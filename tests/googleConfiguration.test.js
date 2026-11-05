import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generateKeyPairSync, createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { googleManifest } from '../scripts/configureGoogle.mjs';
const { publicKey } = generateKeyPairSync('rsa',{modulusLength:2048});
const der=publicKey.export({type:'spki',format:'der'});
const extensionId=createHash('sha256').update(der).digest('hex').slice(0,32).replace(/[0-9a-f]/g,v=>String.fromCharCode(97+parseInt(v,16)));
const config={clientId:'123456-fictional.apps.googleusercontent.com',extensionId,publicKey:der.toString('base64')};
const base=JSON.parse(await readFile(new URL('../manifest.json',import.meta.url),'utf8'));
test('Google build pins the public extension identity and restricts OAuth to appData',()=>{
 const manifest=googleManifest(base,config);
 assert.equal(manifest.key,config.publicKey);assert.ok(manifest.permissions.includes('identity'));
 assert.deepEqual(manifest.oauth2.scopes,['https://www.googleapis.com/auth/drive.appdata']);
 assert.equal('oauth2' in base,false);assert.equal(base.permissions.includes('identity'),false);
 assert.equal(manifest.web_accessible_resources.some(value=>value.resources.includes('auth/auth.html')),false);
});
test('Google setup refuses mismatched extension IDs and secret-bearing configuration',()=>{
 assert.throws(()=>googleManifest(base,{...config,extensionId:'a'.repeat(32)}),/does not match/);
 assert.throws(()=>googleManifest(base,{...config,client_secret:'never-include-secrets'}),/only public/);
 assert.throws(()=>googleManifest(base,{...config,publicKey:'-----BEGIN PRIVATE KEY-----'}),/public SPKI/);
});
