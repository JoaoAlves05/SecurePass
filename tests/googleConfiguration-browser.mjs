import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { generateKeyPairSync, createHash } from 'node:crypto';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
const root=fileURLToPath(new URL('../',import.meta.url));const temporary=await mkdtemp(join(tmpdir(),'securepass-google-build-'));let context;let output;
try{
 const {publicKey}=generateKeyPairSync('rsa',{modulusLength:2048});const der=publicKey.export({type:'spki',format:'der'});
 const extensionId=createHash('sha256').update(der).digest('hex').slice(0,32).replace(/[0-9a-f]/g,v=>String.fromCharCode(97+parseInt(v,16)));
 const config={clientId:'123456-fictional.apps.googleusercontent.com',extensionId,publicKey:der.toString('base64')};const path=join(temporary,'public-config.json');await writeFile(path,JSON.stringify(config));
 const result=await promisify(execFile)(process.execPath,[join(root,'scripts/configureGoogle.mjs'),'--config',path]);
 output=result.stdout.match(/^Prepared (.+)$/m)?.[1];assert.ok(output?.startsWith(join(root,'dist','SecurePass-google-')));
 context=await chromium.launchPersistentContext(join(temporary,'profile'),{channel:'chromium',headless:true,args:[`--disable-extensions-except=${output}`,`--load-extension=${output}`,'--no-sandbox']});
 let [worker]=context.serviceWorkers();if(!worker)worker=await context.waitForEvent('serviceworker');assert.equal(worker.url().split('/')[2],extensionId);
 const page=await context.newPage();await page.goto(`chrome-extension://${extensionId}/popup/popup.html`);
 assert.deepEqual(await page.evaluate(()=>({id:chrome.runtime.id,identity:typeof chrome.identity.getAuthToken,scopes:chrome.runtime.getManifest().oauth2.scopes})),{id:extensionId,identity:'function',scopes:['https://www.googleapis.com/auth/drive.appdata']});
 console.log('Google build passed in Chromium: public key/extension ID, runtime resources and identity scope. Fictional client; no Google authorization attempted.');
}finally{if(context)await context.close();if(output?.startsWith(join(root,'dist','SecurePass-google-')))await rm(output,{recursive:true,force:true});await rm(temporary,{recursive:true,force:true});}
