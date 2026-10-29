"""Worker boundary tests use an explicit model stub, never claimed as AI accuracy."""
import base64
import io
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest
import types
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import main as worker

try:
    from PIL import Image
except ImportError:
    Image = None

class ProtocolTests(unittest.TestCase):
    def test_worker_missing_model_and_unknown_method_are_visible_errors(self):
        with tempfile.TemporaryDirectory() as folder:
            import os
            process = subprocess.run([sys.executable, str(Path(worker.__file__))],
                input='{"id":"one","method":"status"}\n{"id":"two","method":"load"}\n{"id":"three","method":"invalid"}\n',
                text=True, capture_output=True, env={**os.environ, "BLE_DATA_DIR": folder}, check=True)
        replies = [json.loads(line) for line in process.stdout.splitlines()]
        self.assertFalse(replies[0]["result"]["installed"])
        self.assertIn("Download", replies[1]["error"])
        self.assertIn("Unknown", replies[2]["error"])
        self.assertEqual(process.stderr, "")

    def test_processed_request_payload_is_cleared(self):
        received = []
        with (patch.object(worker.sys, "stdin", io.StringIO('{"id":"x","method":"infer","image":"PRIVATE"}\n')),
             patch.object(worker, "handle", side_effect=lambda value: received.append(value) or {"ok": True}),
             patch.object(worker, "protocol", io.StringIO())):
            worker.main()
        self.assertEqual(received, [{}])

class InstallationTests(unittest.TestCase):
    def test_installs_inside_a_cache_parent_without_hashing_hub_metadata(self):
        class API:
            def model_info(self, repo, revision):
                return types.SimpleNamespace(sha=("a" if repo == worker.MODEL_REPO else "b") * 40)
        def download(_repo, *, local_dir, **_options):
            local_dir.mkdir(parents=True)
            (local_dir / "model.safetensors").write_bytes(b"synthetic asset for installer test")
            (local_dir / ".cache").mkdir()
            (local_dir / ".cache" / "metadata").write_text("not a model asset")
        hub = types.SimpleNamespace(HfApi=API, snapshot_download=download)
        with tempfile.TemporaryDirectory() as folder:
            data = Path(folder) / ".cache" / "models"
            with (patch.object(worker, "DATA", data), patch.object(worker, "MANIFEST", data / "manifest.json"),
                  patch.dict(sys.modules, {"huggingface_hub": hub}), patch.object(worker, "protocol", io.StringIO())):
                self.assertTrue(worker.install()["installed"])
                manifest = json.loads(worker.MANIFEST.read_text())
                self.assertEqual(len(manifest["assets"]), 2)
                for asset in manifest["assets"]:
                    self.assertEqual(list(asset["sha256"]), ["model.safetensors"])
                    self.assertEqual(len(asset["revision"]), 40)

@unittest.skipIf(Image is None, "Pillow available in the worker environment only")
class ImageBoundaryTests(unittest.TestCase):
    def test_in_memory_input_and_caches_are_released(self):
        class Stub:
            _cache = {"old": "pixels"}
            _vc_key = "old"
            _vc = "old"
            _img = "old"
            def system_one(self, state, questions):
                self_input = state["images"][0]
                self.assertion = isinstance(self_input, io.BytesIO)
                return {key: {"noul": 0.8} for key in questions}
        stub = Stub()
        picture = io.BytesIO()
        Image.new("RGB", (20, 20), "red").save(picture, format="PNG")
        with patch.object(worker, "model", stub):
            result = worker.infer({"image": base64.b64encode(picture.getvalue()).decode(), "rules": [{"id": "r", "instruction": "Block red images"}]})
        self.assertTrue(stub.assertion)
        self.assertEqual(result["verdicts"], [{"ruleId": "r", "probability": 0.8}])
        self.assertEqual(stub._cache, {})
        self.assertIsNone(stub._vc)
        self.assertIsNone(stub._img)
