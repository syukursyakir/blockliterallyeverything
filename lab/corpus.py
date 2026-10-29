import hashlib
import io

def verify_case(path, case):
    if hashlib.sha256(path.read_bytes()).hexdigest() != case['sha256']:
        raise ValueError('Corpus image changed: ' + case['id'])

def prepare_image(path):
    from PIL import Image, ImageOps
    with Image.open(path) as source:
        image=source.convert('RGB')
        image.thumbnail((1280,1280))
        if min(image.size)<280:
            image=ImageOps.pad(image,(max(280,image.width),max(280,image.height)),color='white')
        memory=io.BytesIO();image.save(memory,format='PNG');image.close()
        return memory.getvalue()

def executed_fingerprint(report):
    cases={case['id']:case for case in report['corpus']['cases']}
    selected=report['selected_case_ids']
    if len(set(selected))!=len(selected) or any(key not in cases for key in selected):
        raise ValueError('Invalid selected corpus cases.')
    expected={(key,rule) for key in selected for rule in cases[key]['labels']}
    for result in report['formats'].values():
        rows=result['rows'];actual=[(r['case'],r['rule']) for r in rows]
        if set(actual)!=expected or len(actual)!=len(expected):
            raise ValueError('Result rows do not cover exactly the selected cases and rules.')
        if any(row['expected']!=cases[row['case']]['labels'][row['rule']] for row in rows):
            raise ValueError('Result labels differ from the fixed corpus.')
    return [(key,cases[key]['sha256'],cases[key]['labels'],report['prepared_sha256'][key]) for key in selected]
