import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdtemp, rm, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const temporary=await mkdtemp(join(tmpdir(),'securepass-package-'));
const run=promisify(execFile);
try {
  await run(process.execPath,[join(root,'scripts/package.mjs')],{cwd:root});
  const {version}=JSON.parse(await readFile(join(root,'manifest.json'),'utf8'));
  const extension=join(temporary,'extension');
  await run('python3',['-c','import sys; from zipfile import ZipFile; ZipFile(sys.argv[1]).extractall(sys.argv[2])',join(root,'dist',`SecurePass-${version}.zip`),extension]);
  const result=await run(process.execPath,[join(root,'tests/anchoredSelector-browser.mjs')],{cwd:root,env:{...process.env,SECUREPASS_EXTENSION_ROOT:extension,SECUREPASS_SCREENSHOT_ROOT:join(temporary,'captures')}});
  console.log(result.stdout.trim());
  console.log('Packaged extension passed the real Chromium anchored-login journey from extracted runtime ZIP.');
} finally {await rm(temporary,{recursive:true,force:true});}
