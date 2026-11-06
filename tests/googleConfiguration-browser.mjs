import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { generateKeyPairSync, createHash } from 'node:crypto';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdtemp, writeFile, rm, mkdir } from 'node:fs/promises';
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
 // Exercise actual UI/background routes with an emulated identity provider. No
 // real Google login, token or Drive file is used by this disposable scenario.
 await worker.evaluate(() => {
   chrome.identity.getAuthToken = async () => ({ token: 'fictional-browser-token', grantedScopes: ['https://www.googleapis.com/auth/drive.appdata'] });
   chrome.identity.clearAllCachedAuthTokens = async () => {};
   globalThis.googleRequests = [];
   globalThis.fetch = async (url, options) => {
     googleRequests.push({ url, method: options.method });
     return url.includes('/about?') ? Response.json({ user: { permissionId: 'fictional-account', emailAddress: 'fictional@example.com' } }) : Response.json({ files: [] });
   };
 });
 await page.goto(`chrome-extension://${extensionId}/popup/popup.html?manage=1#advancedSection`);
 await page.locator('#connectGoogle:enabled').waitFor();
 await page.locator('#connectGoogle').click();
 await page.locator('#googleConnectionStatus').filter({ hasText: 'fictional@example.com' }).waitFor();
 await page.locator('#inspectGoogle').click();
 await page.locator('#googleConnectionResult').filter({ hasText: '0 app files found' }).waitFor();
 assert.equal(await worker.evaluate(() => googleRequests.every(value => value.method === 'GET')), true);
 assert.equal(await worker.evaluate(async () => JSON.stringify(await chrome.storage.local.get(null)).includes('fictional-browser-token')), false);
 const captures = join(root, 'docs/screenshots/google-connection'); await mkdir(captures, { recursive: true });
 await page.setViewportSize({ width: 1200, height: 900 });
 await page.locator('.settings-scroll-container').evaluate(node => { node.scrollTop = 0; });
 await page.screenshot({ path: join(captures, 'management.png'), fullPage: true });
 await page.setViewportSize({ width: 320, height: 560 });
 await page.locator('.settings-scroll-container').evaluate(node => { node.scrollTop = 0; });
 assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
 await page.screenshot({ path: join(captures, 'narrow.png'), fullPage: true });
 await page.locator('#disconnectGoogle').click(); await page.locator('#connectGoogle:enabled').waitFor();
 assert.equal(await page.locator('#inspectGoogle').isVisible(), false);
 console.log('Google build/UI passed in Chromium: public identity, connect, complete read-only inspection, disconnect, no persisted tokens and narrow layout. Provider emulated; no Google authorization attempted.');
}finally{if(context)await context.close();if(output?.startsWith(join(root,'dist','SecurePass-google-')))await rm(output,{recursive:true,force:true});await rm(temporary,{recursive:true,force:true});}
