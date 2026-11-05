import { mkdir, readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { runtimeFiles } from './runtimeFiles.mjs';
const { version } = JSON.parse(await readFile(new URL('../manifest.json', import.meta.url), 'utf8'));
await mkdir(new URL('../dist/', import.meta.url), { recursive: true });
const result = spawnSync('python3', ['-c', `
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
import json, sys
roots = json.loads(sys.argv[1])
with ZipFile('dist/SecurePass-${version}.zip', 'w', ZIP_DEFLATED) as archive:
 for name in roots:
  path = Path(name)
  for item in sorted(path.rglob('*')) if path.is_dir() else [path]:
   if item.is_file(): archive.write(item, str(item))
print('Packaged dist/SecurePass-${version}.zip (extension runtime files only).')
`, JSON.stringify(runtimeFiles)], { cwd: new URL('../', import.meta.url), encoding: 'utf8' });
if (result.status) throw new Error(result.stderr);
console.log(result.stdout.trim());
