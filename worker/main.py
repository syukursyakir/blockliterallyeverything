"""Private JSON-lines worker. Never opens a network listener or writes screenshots."""
import base64
import contextlib
import ctypes
import hashlib
import io
import json
import os
from pathlib import Path
import sys
import time

from policy import failure_message, questions_for, validate_rules, verdicts_for

ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT / "vendor"))
DATA = Path(os.environ.get("BLE_DATA_DIR", Path.home() / ".blockliterallyeverything")) / "models"
MANIFEST = DATA / "manifest.json"
MODEL_REPO = "tinnel123/OmniJev-0.8B"
BASE_REPO = "Qwen/Qwen3.5-0.8B"
model = None
protocol = sys.stdout

def emit(value):
    protocol.write(json.dumps(value, allow_nan=False) + "\n")
    protocol.flush()

def progress(message):
    emit({"event": "progress", "message": message})

def foreground():
    if sys.platform != "win32":
        return 0
    function = ctypes.windll.user32.GetForegroundWindow
    function.restype = ctypes.c_void_p
    return int(function() or 0)

def digest(path):
    with open(path, "rb") as stream:
        return hashlib.file_digest(stream, "sha256").hexdigest()

def install():
    from huggingface_hub import HfApi, snapshot_download
    DATA.mkdir(parents=True, exist_ok=True)
    api = HfApi()
    assets = []
    # Resolve immutable revisions before downloading; retain this installation's exact lock.
    for repo, revision, folder in [(MODEL_REPO, "v1.1", "checkpoint"), (BASE_REPO, "main", "base")]:
        progress("Resolving " + repo + "…")
        info = api.model_info(repo, revision=revision)
        if not info.sha or len(info.sha) != 40:
            raise ValueError("Could not resolve an immutable model revision.")
        progress("Downloading " + repo + ". The first download can take several minutes.")
        target = DATA / (folder + "-" + info.sha)
        snapshot_download(repo, revision=info.sha, local_dir=target,
                          ignore_patterns=["*.bin", "*.gguf", "*.onnx", "*.h5", "*.msgpack", "*.md", "*.png", "*.jpg"],
                          max_workers=3)
        files = {}
        for path in sorted(target.rglob("*")):
            if path.is_file() and ".cache" not in path.relative_to(target).parts:
                files[str(path.relative_to(target))] = digest(path)
        if not files:
            raise ValueError("No model assets were downloaded.")
        assets.append({"repo": repo, "revision": info.sha, "directory": target.name, "sha256": files})
    value = {"version": 1, "installedAt": int(time.time()), "assets": assets}
    temporary = MANIFEST.with_suffix(".tmp")
    temporary.write_text(json.dumps(value, indent=2))
    os.replace(temporary, MANIFEST)
    return {"installed": True}

def load():
    global model
    if model is not None:
        return {"ready": True}
    if not MANIFEST.exists():
        raise ValueError("Download the local model in Model settings first.")
    manifest = json.loads(MANIFEST.read_text())
    progress("Verifying local model files…")
    for asset in manifest["assets"]:
        for name, expected in asset["sha256"].items():
            path = DATA / asset["directory"] / name
            if not path.is_file() or digest(path) != expected:
                raise ValueError("A model file is missing or changed. Reinstall the model.")
    # No Hugging Face lookups once the model is installed.
    import torch
    torch.set_num_threads(min(4, os.cpu_count() or 1))
    from mso.infer import MSO1
    progress("Loading OmniJev-0.8B locally…")
    locations = {asset["repo"]: DATA / asset["directory"] for asset in manifest["assets"]}
    model = MSO1(str(locations[MODEL_REPO]), str(locations[BASE_REPO]), max_pixels=384 * 28 * 28)
    return {"ready": True}

def infer(request):
    from PIL import Image, ImageStat
    if model is None:
        raise ValueError("Load the model before testing.")
    rules = validate_rules(request.get("rules"))
    encoded = request.get("image")
    if not isinstance(encoded, str) or len(encoded) > 21_000_000:
        raise ValueError("Image must be smaller than 15 MB.")
    raw = base64.b64decode(encoded, validate=True)
    if len(raw) > 15 * 1024 * 1024:
        raise ValueError("Image must be smaller than 15 MB.")
    Image.MAX_IMAGE_PIXELS = 25_000_000
    with Image.open(io.BytesIO(raw)) as original:
        if original.width * original.height > 25_000_000:
            raise ValueError("Image dimensions are too large.")
        image = original.convert("RGB")
    if request.get("foreground") is not None and max(ImageStat.Stat(image).stddev) < 1:
        image.close()
        raise ValueError("Screen capture is blank or protected. Protection is paused.")
    # One image per request bypasses upstream's disk-based multi-image panels.
    # BytesIO support is the documented local vendor patch in THIRD_PARTY.md.
    image.thumbnail((1280, 1280))
    buffer = io.BytesIO()
    image.save(buffer, format="PNG")
    buffer.seek(0)
    started = time.perf_counter()
    try:
        import torch
        with torch.inference_mode():
            answers = model.system_one({"images": [buffer]}, questions_for(rules))
        return {"verdicts": verdicts_for(answers, rules), "elapsedMs": round((time.perf_counter() - started) * 1000),
                "foregroundChanged": request.get("foreground") is not None and request["foreground"] != foreground()}
    finally:
        # Do not retain screenshot-derived cached tensors/decoded images between requests.
        model._cache.clear()
        model._vc_key = None
        model._vc = None
        model._img = None
        image.close()
        buffer.close()

def handle(request):
    method = request.get("method")
    if method == "status":
        return {"installed": MANIFEST.is_file()}
    if method == "context":
        return {"foreground": foreground()}
    if method == "diagnose":
        import torch
        import transformers
        from mso.infer import MSO1
        return {"torch": torch.__version__, "transformers": transformers.__version__, "inferenceModule": MSO1.__name__, "platform": sys.platform}
    if method == "install":
        if model is not None:
            raise ValueError("Restart the app before reinstalling a loaded model.")
        return install()
    if method == "load":
        return load()
    if method == "infer":
        return infer(request)
    raise ValueError("Unknown worker request.")

def main():
    for line in sys.stdin:
        request_id = None
        request = {}
        try:
            if len(line) > 22_000_000:
                raise ValueError("Request is too large.")
            request = json.loads(line)
            request_id = request["id"]
            with contextlib.redirect_stdout(sys.stderr):
                result = handle(request)
            emit({"id": request_id, "result": result})
        except Exception as error:
            # Do not serialize traces, input images, model answers or exception repr.
            message = failure_message(error, request.get("method") if isinstance(request, dict) else None)
            emit({"id": request_id, "error": message[:500]})
        finally:
            if isinstance(request, dict):
                request.clear()
            line = ""

if __name__ == "__main__":
    main()
