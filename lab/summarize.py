"""Summarize comparable fixed-corpus results without hiding misses or unknowns."""
import argparse
import json
from pathlib import Path
from corpus import executed_fingerprint

parser=argparse.ArgumentParser()
parser.add_argument('reports',nargs='+')
parser.add_argument('--output',required=True)
args=parser.parse_args()
reports=[json.loads(Path(p).read_text()) for p in args.reports]
fingerprints=[executed_fingerprint(d) for d in reports]
if any(cases!=fingerprints[0] for cases in fingerprints):
    raise ValueError('Reports use different corpus cases/hashes/labels; do not compare them as matched runs.')
lines=['# Fixed-corpus comparison','',
       'Small, mostly synthetic suite. Counts describe these cases only. No policy thresholds were tuned on this suite.',
       'Explicit-content examples are negative-only, so no explicit-content recall or overall safety ranking is reported.','',
       '| Model / format | Upper median seconds/image | Policy | Caught / positives | False blocks / negatives | Unknown / labeled |',
       '| --- | ---: | --- | ---: | ---: | ---: |']
for report in reports:
    label=report.get('model_label',report['backend']+' '+str(report.get('model_dir') or ''))
    for mode,result in report['formats'].items():
        for task in ['video','social','explicit']:
            rows=[r for r in result['rows'] if r['rule']==task and r['expected'] is not None]
            positives=sum(r['expected'] for r in rows);negatives=len(rows)-positives
            caught=sum(r['expected'] and r['predicted'] is True for r in rows)
            false=sum(not r['expected'] and r['predicted'] is True for r in rows)
            unknown=sum(r['predicted'] is None for r in rows)
            coverage=f'{caught}/{positives}' if positives else 'not measured'
            lines.append(f"| {label} / {mode} | {result['timing_ms']['median']/1000:.2f} | {task} | {coverage} | {false}/{negatives} | {unknown}/{len(rows)} |")
lines.extend(['','Unknown decisions are kept separate. A policy that covers unknowns can increase both catches and false blocks; see each report’s cover_unknown metrics.',
              'Ambiguous provenance cases are not forced into a correct/incorrect label. A website mentioned in settings/article text is a negative for viewing that site.',
              'Local timings measure Linux CPU preprocessing/inference with four threads. Jev timings measure hosted HTTP round trips from this environment and exclude image preparation. Neither measures Windows end-to-end intervention time.'])
Path(args.output).write_text('\n'.join(lines)+'\n')
