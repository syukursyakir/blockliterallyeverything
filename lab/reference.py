"""Small visual-reference pilot using public/self-authored images only."""
import json
import os
from pathlib import Path
import sys
import time

ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'worker'))
os.environ['BLE_DATA_DIR']='/workspace/.cache/ble-model-validation'
import main as worker
import torch
worker.load()
corpus=Path('/workspace/.cache/ble-evaluation/corpus')
question={'video':{'type':'choice','instructions':
    'Picture 1 is the target. Picture 2 is an example of a YouTube screen. Picture 3 is an allowed ordinary document. '
    'Does picture 1 itself show a YouTube feed or YouTube video player, rather than only mention the name?',
    'criteria':{'block':'It is a YouTube feed or player like picture 2.',
                'allow':'It is not YouTube, or only mentions it, like picture 3.',
                'unknown':'There is not enough visible evidence to tell.'}}}
report={'scope':'Four-case visual-reference pilot for YouTube only; not a general accuracy benchmark. Multi-image panels are intentionally cached research fixtures, never private screenshots.',
        'references':['youtube-home.png','work-document.png'],'question':question,'rows':[]}
for name,truth in [('youtube-player',True),('youtube-shorts',True),('settings-list',False),('generic-video',False)]:
    started=time.perf_counter()
    with torch.inference_mode():
        result=worker.model.system_one({'images':[str(corpus/(name+'.png')),str(corpus/'youtube-home.png'),str(corpus/'work-document.png')]},question)
    row={'case':name,'expected':truth,'answer':result['video'],'milliseconds':round((time.perf_counter()-started)*1000)}
    report['rows'].append(row);print(json.dumps(row),flush=True)
Path('docs/evaluation-reference-2026-10-29.json').write_text(json.dumps(report,indent=2)+'\n')
