"""Opt-in hosted comparison; never used by the desktop application."""
import base64
import json
import os
from pathlib import Path
import time
import urllib.error
import urllib.request
import uuid

from filelock import FileLock

MODEL = "jev-1.14.0"
INPUT_USD_PER_MILLION = 0.042  # Official models.md, checked 2026-10-29.
RESERVE_TOKENS_PER_CALL = 262_144  # Conservative upper bound, above default 64k context.
MAX_CALLS = 64

def reserve(ledger_path):
    path = Path(ledger_path)
    path.parent.mkdir(parents=True, exist_ok=True)
    with FileLock(str(path) + ".lock"):
        state = json.loads(path.read_text()) if path.exists() else {"calls": 0, "reserved_usd": 0, "reported_input_tokens": 0}
        charge = RESERVE_TOKENS_PER_CALL * INPUT_USD_PER_MILLION / 1_000_000
        if state["calls"] >= MAX_CALLS or state["reserved_usd"] + charge > 3:
            raise RuntimeError("Jev evaluation budget/request cap reached. No request sent.")
        state["calls"] += 1
        state["reserved_usd"] += charge
        path.write_text(json.dumps(state, indent=2) + "\n")
        path.chmod(0o600)
    return state

def evaluate(image_bytes, questions, ledger):
    key = os.environ.get("TYPESAFE_API_KEY")
    if not key:
        raise RuntimeError("TYPESAFE_API_KEY is not configured. Add it securely in environment settings, not chat.")
    reference = str(uuid.uuid4())
    payload = {"model": MODEL, "state": {"screen": reference}, "questions": questions,
               "assets": {reference: {"type": "image", "format": "png", "data_base64": base64.b64encode(image_bytes).decode()}}}
    reserve(ledger)  # Failed/uncertain requests retain their reservation. No automatic retries.
    request = urllib.request.Request("https://api.typesafe.ai/v1/systemone", data=json.dumps(payload).encode(),
        headers={"Authorization": "Bearer " + key, "Content-Type": "application/json", "TypeSafe-Danger-Zone-Images": "true"})
    started = time.perf_counter()
    try:
        with urllib.request.urlopen(request, timeout=60) as response:
            value = json.load(response)
    except urllib.error.HTTPError as error:
        raise RuntimeError(f"Jev returned HTTP {error.code}; stopping without retries. No response body or credential logged.") from None
    except urllib.error.URLError:
        raise RuntimeError("Jev connection failed; reservation retained and no retry sent.") from None
    usage = value.get("usage", {}).get("input_tokens")
    if not isinstance(usage, int) or usage < 0 or usage > RESERVE_TOKENS_PER_CALL:
        raise RuntimeError("Unexpected Jev token usage; stop and inspect provider billing before more calls.")
    with FileLock(str(ledger) + ".lock"):
        state = json.loads(Path(ledger).read_text())
        state["reported_input_tokens"] += usage
        Path(ledger).write_text(json.dumps(state, indent=2) + "\n")
    return value["answers"], (time.perf_counter() - started) * 1000, {"model": value.get("model"), "input_tokens": usage,
        "estimated_usd": usage * INPUT_USD_PER_MILLION / 1_000_000}
