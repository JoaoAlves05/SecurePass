import { createHash, createPublicKey, generateKeyPairSync } from 'node:crypto';
import { readFile, mkdir, mkdtemp, cp, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { runtimeFiles } from './runtimeFiles.mjs';
const root = fileURLToPath(new URL('../', import.meta.url));
export function googleManifest(base, config) {
  if (!config || Object.keys(config).sort().join(',') !== 'clientId,extensionId,publicKey') throw new Error('Use only public clientId, extensionId and publicKey; do not supply a client secret or token.');
  if (typeof config.clientId !== 'string' || !/^[0-9]+-[A-Za-z0-9_-]+\.apps\.googleusercontent\.com$/.test(config.clientId) || typeof config.extensionId !== 'string' || !/^[a-p]{32}$/.test(config.extensionId)) throw new Error('Invalid public OAuth client or extension ID.');
  if (typeof config.publicKey !== 'string' || config.publicKey.length > 16384 || config.publicKey.includes('PRIVATE KEY')) throw new Error('A public SPKI key is required.');
  const text = config.publicKey.replace(/-----BEGIN PUBLIC KEY-----|-----END PUBLIC KEY-----|\s/g, '');
  const der = Buffer.from(text, 'base64');
  if (der.toString('base64') !== text) throw new Error('Invalid public key encoding.');
  createPublicKey({ key: der, type: 'spki', format: 'der' });
  const extensionId = createHash('sha256').update(der).digest('hex').slice(0,32).replace(/[0-9a-f]/g, value => String.fromCharCode(97 + parseInt(value,16)));
  if (extensionId !== config.extensionId) throw new Error('The public key does not match the registered extension ID.');
  const manifest = structuredClone(base);
  manifest.key = text;
  manifest.permissions = [...new Set([...manifest.permissions,'identity'])];
  manifest.host_permissions = [...new Set([...manifest.host_permissions,'https://www.googleapis.com/*'])];
  manifest.oauth2 = { client_id: config.clientId, scopes: ['https://www.googleapis.com/auth/drive.appdata'] };
  manifest.content_security_policy.extension_pages = manifest.content_security_policy.extension_pages.replace("connect-src 'self'", "connect-src 'self' https://www.googleapis.com");
  return manifest;
}
async function main() {
  const args = process.argv.slice(2);
  if (args.length === 1 && args[0] === '--create-development-identity') {
    const { publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
    const der = publicKey.export({ type: 'spki', format: 'der' });
    const extensionId = createHash('sha256').update(der).digest('hex').slice(0,32).replace(/[0-9a-f]/g, value => String.fromCharCode(97 + parseInt(value,16)));
    await mkdir(join(root,'dist'),{recursive:true});
    const output = join(root,'dist','google-development.json');
    await writeFile(output, JSON.stringify({clientId:'',extensionId,publicKey:der.toString('base64')},null,2)+'\n', {flag:'wx'});
    console.log(`Created public development identity: ${output}\nExtension ID: ${extensionId}\nAdd the real public OAuth client ID to this file. No private key was stored. This is not a Chrome Web Store identity.`);
    return;
  }
  if (args.length !== 2 || args[0] !== '--config') throw new Error('Usage: npm run configure:google -- --config /path/to/public-google-config.json');
  const config = JSON.parse(await readFile(resolve(args[1]),'utf8'));
  const base = JSON.parse(await readFile(join(root,'manifest.json'),'utf8'));
  const manifest = googleManifest(base,config);
  await mkdir(join(root,'dist'),{recursive:true});
  const output = await mkdtemp(join(root,'dist','SecurePass-google-'));
  for (const name of runtimeFiles) await cp(join(root,name),join(output,name),{recursive:true});
  await writeFile(join(output,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
  console.log(`Prepared ${output}\nExtension ID: ${config.extensionId}\nOAuth manifest configuration only; Google credentials must exist and Drive activation remains gated by protocol integration/review.`);
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) main().catch(error => { console.error(error.message); process.exitCode = 1; });
