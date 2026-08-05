import json, os, sys
sys.stdout.reconfigure(encoding='utf-8')

path = os.path.join('Data Model', 'Model AI', '02_Model_Comparison.ipynb')
with open(path, 'r', encoding='utf-8') as f:
    nb = json.load(f)

for i, cell in enumerate(nb['cells']):
    if 'outputs' in cell and cell['outputs']:
        for out in cell['outputs']:
            if out.get('output_type') == 'stream' and 'text' in out:
                text = ''.join(out['text']).replace('\u2192', '->').replace('\u26A0\uFE0F', '!').replace('\u2705', '[OK]')
                if text.strip() and i >= 7:  # Skip cells we already saw
                    print(f'[Cell {i+1}]:')
                    print(text)
