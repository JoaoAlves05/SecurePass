import { mkdir, readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
const { version } = JSON.parse(await readFile(new URL('../manifest.json', import.meta.url), 'utf8'));
await mkdir(new URL('../dist/', import.meta.url), { recursive: true });
const result = spawnSync('python3', ['-c', `
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
roots = ['manifest.json', 'background', 'src', 'popup', 'content', 'auth', 'icons', 'offscreen.html', 'offscreen.js', 'LICENSE', 'SECURITY.md']
with ZipFile('dist/SecurePass-${version}.zip', 'w', ZIP_DEFLATED) as archive:
 for name in roots:
  path = Path(name)
  for item in sorted(path.rglob('*')) if path.is_dir() else [path]:
   if item.is_file(): archive.write(item, str(item))
print('Packaged dist/SecurePass-${version}.zip (extension runtime files only).')
`], { cwd: new URL('../', import.meta.url), encoding: 'utf8' });
if (result.status) throw new Error(result.stderr);
console.log(result.stdout.trim());
