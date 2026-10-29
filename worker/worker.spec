from PyInstaller.utils.hooks import collect_all
from pathlib import Path

root = Path(SPECPATH)
datas, binaries, hidden = [(str(root / 'vendor' / 'OMNIJEV-LICENSE'), 'licenses')], [], []
for package in ['torch', 'torchvision', 'transformers', 'peft', 'accelerate', 'safetensors', 'huggingface_hub']:
    d, b, h = collect_all(package)
    datas += d
    binaries += b
    hidden += h
a = Analysis([str(root / 'main.py')], pathex=[str(root), str(root / 'vendor')],
             binaries=binaries, datas=datas, hiddenimports=hidden + ['mso.infer', 'mso.records', 'mso.branch', 'mso.head', 'mso.v04', 'mso.panels', 'mso.fast_kernels'],
             excludes=['tkinter', 'matplotlib', 'IPython', 'pytest'])
pyz = PYZ(a.pure)
exe = EXE(pyz, a.scripts, [], exclude_binaries=True, name='ble-worker', console=True)
coll = COLLECT(exe, a.binaries, a.datas, name='ble-worker')
