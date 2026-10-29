"""Fixed-corpus local/hosted image-decision comparison. No app integration changes."""
import argparse
import base64
import json
import math
import hashlib
import io
import os
from pathlib import Path
import platform
import sys
import time

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "worker"))
from policy import questions_for
from scoring import metrics, classify_choice
from corpus import prepare_image,verify_case

PROMPTS = {
    "explicit": "Does this image show sexual activity or explicit nudity?",
    "video": "Does this image show a YouTube feed or YouTube video player, rather than just mention its name?",
    "social": "Does this image show an Instagram or TikTok feed?",
    "cats": "Are cats visible in the image?",
}
RULES = [
    {"id":"explicit","instruction":"Block visible sexual activity and explicit nudity. Do not treat ordinary clothed people as explicit content."},
    {"id":"video","instruction":"Block visible YouTube browsing, video playback, Shorts, and the YouTube home feed."},
    {"id":"social","instruction":"Block visible Instagram and TikTok feeds, including short-form video scrolling."},
    {"id":"cats","instruction":"Block images showing cats."},
]

def questions(mode):
    if mode == "app-noul":
        return questions_for(RULES)
    if mode == "noul":
        return {key: {"type":"noul", "instructions": prompt} for key,prompt in PROMPTS.items()}
    return {key: {"type":"choice", "instructions": prompt,
        "criteria":{"block":"Yes, the prohibited content itself is visible.",
                    "allow":"No, it is absent or is only mentioned in ordinary text.",
                    "unknown":"There is not enough visible evidence to decide."}} for key,prompt in PROMPTS.items()}

def summarize(rows):
    return {key: {split: {"raw": metrics([r for r in rows if r["rule"]==key and r["split"]==split]),
                         "cover_unknown": metrics([r for r in rows if r["rule"]==key and r["split"]==split], True)}
                  for split in sorted({r["split"] for r in rows})} for key in PROMPTS}

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument("--backend",choices=["omni","siglip","jev"],required=True)
    parser.add_argument("--model-dir",required=False)
    parser.add_argument("--corpus",default="/workspace/.cache/ble-evaluation/corpus")
    parser.add_argument("--formats",nargs="+",choices=["app-noul","noul","choice"],default=["noul","choice"])
    parser.add_argument("--output",required=True)
    parser.add_argument("--limit",type=int)
    parser.add_argument("--allow-cloud",action="store_true")
    parser.add_argument("--ledger",default="/workspace/.cache/ble-evaluation/jev-budget.json")
    args=parser.parse_args()
    if args.backend=="jev" and not args.allow_cloud:
        raise RuntimeError("Hosted image evaluation requires --allow-cloud explicitly.")
    corpus=Path(args.corpus); manifest=json.loads((corpus/"manifest.json").read_text());cases=manifest["cases"][:args.limit]
    if not cases:raise ValueError('No evaluation cases selected.')
    if any(case.get('needs_visual_label') for case in cases):
        raise ValueError('Inspect captures and freeze visible-content labels before evaluation.')
    for case in cases:verify_case(corpus/case['file'],case)
    import torch
    torch.set_num_threads(4)
    from PIL import Image
    model=None
    started=time.perf_counter()
    if args.backend=="omni":
        import main as worker
        model_dir=Path(args.model_dir)
        worker.DATA=model_dir;worker.MANIFEST=model_dir/"manifest.json"
        assets=json.loads(worker.MANIFEST.read_text())["assets"]
        worker.MODEL_REPO=next(a["repo"] for a in assets if "OmniJev" in a["repo"])
        worker.BASE_REPO=next(a["repo"] for a in assets if "Qwen/" in a["repo"])
        worker.load();model=worker.model
    elif args.backend=="siglip":
        from transformers import AutoModel,AutoProcessor
        model=AutoModel.from_pretrained(args.model_dir,local_files_only=True).eval()
        processor=AutoProcessor.from_pretrained(args.model_dir,local_files_only=True)
        descriptions={"explicit":"an image showing explicit nudity or sexual activity", "video":"a screenshot of the YouTube website with a video player or feed", "social":"a screenshot of an Instagram or TikTok feed", "cats":"a photograph of cats", "document":"a screenshot of ordinary settings, a document, a code editor, or an article", "landscape":"a landscape or an ordinary room without people or animals"}
        keys=list(descriptions)
        text_inputs=processor(text=list(descriptions.values()),padding="max_length",return_tensors="pt")
        with torch.inference_mode():
            text_features=model.get_text_features(**text_inputs)
            if not isinstance(text_features,torch.Tensor): text_features=text_features.pooler_output
            text_features=text_features/text_features.norm(dim=-1,keepdim=True)
    report={"backend":args.backend,"model_dir":Path(args.model_dir).name if args.model_dir else None,"platform":platform.platform(),"threads":4,
            "selected_case_ids":[case['id'] for case in cases],"prepared_sha256":{case['id']:hashlib.sha256(prepare_image(corpus/case['file'])).hexdigest() for case in cases},
            "load_seconds":round(time.perf_counter()-started,3),"corpus":manifest,"formats":{},
            "limits":"Small synthetic/development corpus. Explicit-content coverage is negative-only. No real-world accuracy or Windows timing claim."}
    formats=["similarity"] if args.backend=="siglip" else args.formats
    for mode in formats:
        rows=[];timings=[];details=[]
        for case in cases:
            image_path=corpus/case["file"]
            prepared=prepare_image(image_path)
            image=Image.open(io.BytesIO(prepared)).convert('RGB')
            t=time.perf_counter()
            if args.backend=="siglip":
                inputs=processor(images=image,return_tensors="pt")
                with torch.inference_mode():
                    features=model.get_image_features(**inputs)
                    if not isinstance(features,torch.Tensor):features=features.pooler_output
                    features=features/features.norm(dim=-1,keepdim=True)
                    scores=(features@text_features.T)[0]
                chosen=keys[int(scores.argmax())]
                answers={key:{"selected":chosen,"cosine_similarity":float(scores[keys.index(key)])} for key in PROMPTS}
                elapsed=(time.perf_counter()-t)*1000
            elif args.backend=="jev":
                from jev import evaluate
                answers,elapsed,billing=evaluate(prepared,questions(mode),args.ledger)
                details.append({"case":case["id"],"billing":billing})
            else:
                memory=io.BytesIO();image.save(memory,format="PNG");memory.seek(0)
                with torch.inference_mode():answers=model.system_one({"images":[memory]},questions(mode))
                elapsed=(time.perf_counter()-t)*1000
                model._cache.clear();model._vc_key=None;model._vc=None;model._img=None;memory.close()
            image.close();timings.append(elapsed)
            for key in PROMPTS:
                answer=answers[key]
                if mode=="similarity":predicted=answer["selected"]==key
                elif mode in {"noul","app-noul"}:
                    score=answer.get("noul")
                    if not isinstance(score,(int,float)) or not math.isfinite(score) or not 0<=score<=1:raise ValueError("Invalid Noul response")
                    predicted=score>=0.4
                else:
                    predicted,reason=classify_choice(answer)
                rows.append({"case":case["id"],"split":case["split"],"rule":key,"expected":case["labels"][key],"predicted":predicted,"answer":answer,
                             "decision_reason":reason if mode=='choice' else mode})
            print(json.dumps({"format":mode,"case":case["id"],"milliseconds":round(elapsed),"predictions":{r["rule"]:r["predicted"] for r in rows[-4:]}}),flush=True)
        ordered=sorted(timings)
        report["formats"][mode]={"questions":questions(mode) if mode!="similarity" else descriptions,"rows":rows,"metrics":summarize(rows),"timing_ms":{"median":ordered[len(ordered)//2],"max":max(ordered)},"billing":details}
        Path(args.output).parent.mkdir(parents=True,exist_ok=True);Path(args.output).write_text(json.dumps(report,indent=2)+"\n")

if __name__=="__main__":main()
