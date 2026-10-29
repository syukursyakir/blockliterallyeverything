"""Exercise the real private-worker protocol on user-selected local images.

Run with worker/.venv Python. No mocked decisions, screenshots or model weights
are created by this script. Only numeric decisions/timings go into the report.
"""
import argparse
import base64
import json
import os
from pathlib import Path
import platform
import subprocess
import sys
import time

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "worker"))
from policy import questions_for

parser = argparse.ArgumentParser()
parser.add_argument("--data-dir", required=True)
parser.add_argument("--image", action="append", required=True)
parser.add_argument("--report", required=True)
parser.add_argument("--worker-executable", help="Optional packaged worker to test instead of the source worker")
args = parser.parse_args()
root = Path(__file__).resolve().parents[1]
command = [args.worker_executable] if args.worker_executable else [sys.executable, str(root / "worker/main.py")]
process = subprocess.Popen(command, stdin=subprocess.PIPE,
                           stdout=subprocess.PIPE, stderr=subprocess.DEVNULL, text=True,
                           env={**os.environ, "BLE_DATA_DIR": args.data_dir})
sequence = 0

def request(method, **payload):
    global sequence
    sequence += 1
    key = str(sequence)
    process.stdin.write(json.dumps({"id": key, "method": method, **payload}) + "\n")
    process.stdin.flush()
    while True:
        line = process.stdout.readline()
        if not line:
            raise RuntimeError("Worker exited without a response.")
        response = json.loads(line)
        if response.get("event") == "progress":
            print(response["message"], flush=True)
        elif response.get("id") == key:
            if response.get("error"):
                raise RuntimeError(response["error"])
            return response["result"]

rules = [
    {"id": "explicit", "instruction": "Block visible sexual activity and explicit nudity. Do not treat ordinary clothed people as explicit content."},
    {"id": "video", "instruction": "Block visible YouTube browsing, video playback, Shorts, and the YouTube home feed."},
    {"id": "social", "instruction": "Block visible Instagram and TikTok feeds, including short-form video scrolling."},
    {"id": "cats", "instruction": "Block images showing cats."},
]
try:
    started = time.perf_counter()
    request("load")
    report = {"platform": platform.platform(), "loadSeconds": round(time.perf_counter() - started, 3),
              "runtime": request("diagnose"), "rules": rules, "questions": questions_for(rules), "images": [],
              "scope": "Small real-inference smoke check, not an accuracy benchmark or Windows capture test."}
    for name in args.image:
        path = Path(name)
        started = time.perf_counter()
        result = request("infer", image=base64.b64encode(path.read_bytes()).decode(), rules=rules)
        row = {"name": path.name, "requestSeconds": round(time.perf_counter() - started, 3), **result}
        report["images"].append(row)
        print(json.dumps(row), flush=True)
    destination = Path(args.report)
    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.write_text(json.dumps(report, indent=2) + "\n")
finally:
    process.stdin.close()
    try:
        process.wait(timeout=5)
    except subprocess.TimeoutExpired:
        process.kill()
        process.wait()
