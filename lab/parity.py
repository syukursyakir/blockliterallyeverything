"""Compare original file-based inference against the app's in-memory boundary."""
import argparse
import base64
import json
import os
from pathlib import Path
import sys

parser=argparse.ArgumentParser()
parser.add_argument("--backend",choices=["upstream","worker"],required=True)
parser.add_argument("--upstream",default="/tmp/ble-upstream-parity")
parser.add_argument("--data-dir",default="/workspace/.cache/ble-model-validation")
parser.add_argument("--output",required=True)
args=parser.parse_args()
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/"worker"))
from policy import questions_for
rules=[{"id":"explicit","instruction":"Block visible sexual activity and explicit nudity. Do not treat ordinary clothed people as explicit content."},
       {"id":"video","instruction":"Block visible YouTube browsing, video playback, Shorts, and the YouTube home feed."},
       {"id":"social","instruction":"Block visible Instagram and TikTok feeds, including short-form video scrolling."},
       {"id":"cats","instruction":"Block images showing cats."}]
os.environ["HF_HUB_OFFLINE"]="1"
os.environ["BLE_DATA_DIR"]=args.data_dir
import torch
torch.set_num_threads(4)
from PIL import Image
if args.backend=="upstream":
    sys.path.insert(0,args.upstream)
    from mso.infer import MSO1
    data=Path(args.data_dir)/"models";manifest=json.loads((data/"manifest.json").read_text())
    paths={a["repo"]:data/a["directory"] for a in manifest["assets"]}
    model=MSO1(str(paths["tinnel123/OmniJev-0.8B"]),str(paths["Qwen/Qwen3.5-0.8B"]),max_pixels=384*28*28)
else:
    import main as worker
    worker.load()
report={"backend":args.backend,"upstream_commit":"14dbec4f71e194852c8d7b88ab36ef639493f400","rows":[]}
normalized=Path('/workspace/.cache/ble-evaluation/parity');normalized.mkdir(parents=True,exist_ok=True)
for source in [Path('/workspace/.cache/ble-model-validation/samples/cats.jpg'),ROOT/'docs/images/dashboard.png']:
    path=normalized/(source.stem+'.png')
    with Image.open(source) as image:
        image=image.convert('RGB');image.thumbnail((1280,1280));image.save(path)
    for variant,selected in [("batch",rules),("single-cats",[rules[-1]])]:
        if args.backend=="upstream":
            with torch.inference_mode():answers=model.system_one({"images":[str(path)]},questions_for(selected))
            values={key:answer["noul"] for key,answer in answers.items()}
        else:
            result=worker.infer({"image":base64.b64encode(path.read_bytes()).decode(),"rules":selected})
            values={v['ruleId']:v['probability'] for v in result['verdicts']}
        report['rows'].append({'image':source.name,'variant':variant,'scores':values})
        print(json.dumps(report['rows'][-1]),flush=True)
Path(args.output).write_text(json.dumps(report,indent=2)+'\n')
