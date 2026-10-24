import { readdir, readFile, access } from 'node:fs/promises';
import { resolve, dirname, relative } from 'node:path';
import { spawnSync } from 'node:child_process';
const root = resolve(new URL('../', import.meta.url).pathname);
async function files(dir) {
  const result = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (['.git', 'node_modules', 'test-results'].includes(entry.name)) continue;
    const path = resolve(dir, entry.name);
    if (entry.isDirectory()) result.push(...await files(path)); else result.push(path);
  }
  return result;
}
const all = await files(root);
const js = all.filter(path => /\.[cm]?js$/.test(path));
const graph = new Map();
for (const path of js) {
  const check = spawnSync(process.execPath, ['--check', path], { encoding: 'utf8' });
  if (check.status) throw new Error(check.stderr);
  const source = await readFile(path, 'utf8');
  const imports = [...source.matchAll(/(?:from\s*|import\s*)['"](\.[^'"]+)['"]/g)].map(match => resolve(dirname(path), match[1]));
  for (const dependency of imports) await access(dependency);
  graph.set(path, imports);
}
const done = new Set();
function visit(path, stack = []) {
  if (stack.includes(path)) throw new Error(`Import cycle: ${[...stack, path].map(p => relative(root, p)).join(' -> ')}`);
  if (done.has(path)) return;
  for (const dep of graph.get(path) || []) visit(dep, [...stack, path]);
  done.add(path);
}
for (const path of js) visit(path);
const manifest = JSON.parse(await readFile(resolve(root, 'manifest.json'), 'utf8'));
const pkg = JSON.parse(await readFile(resolve(root, 'package.json'), 'utf8'));
if (manifest.version !== pkg.version) throw new Error('Version mismatch.');
for (const path of [manifest.background.service_worker, manifest.action.default_popup, ...Object.values(manifest.icons)]) await access(resolve(root, path));
console.log(`Checked ${js.length} JavaScript modules: syntax, import paths, no import cycles and manifest/version consistency.`);
