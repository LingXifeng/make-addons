import os, json

manifest = {}
icon_root = os.path.join(os.path.dirname(__file__), '..', 'public', 'assets', 'icons')

for root, dirs, files in os.walk(icon_root):
    dirs[:] = [d for d in dirs if not d.startswith('.')]
    pngs = [f.replace('.png', '') for f in files if f.endswith('.png')]
    if pngs:
        rel_path = os.path.relpath(root, icon_root).replace(os.sep, '/')
        if rel_path == '.':
            rel_path = ''
        manifest[rel_path] = sorted(pngs)

out_path = os.path.join(os.path.dirname(__file__), '..', 'public', 'assets', 'icon_manifest.json')
with open(out_path, 'w') as f:
    json.dump(manifest, f, indent=2, ensure_ascii=False)

for k, v in manifest.items():
    print(f'{k}: {len(v)} icons')
