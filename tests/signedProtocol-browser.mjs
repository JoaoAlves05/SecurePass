import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { mkdtemp, rm, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const profile=await mkdtemp(`${tmpdir()}/securepass-signed-protocol-`);
const vector=JSON.parse(await readFile(new URL('./fixtures/signedProtocolVector.json',import.meta.url),'utf8'));
let context;
try {
  context=await chromium.launchPersistentContext(profile,{channel:'chromium',headless:true,args:[`--disable-extensions-except=${root}`,`--load-extension=${root}`,'--no-sandbox']});
  let [worker]=context.serviceWorkers();if(!worker)worker=await context.waitForEvent('serviceworker');
  const page=await context.newPage();await page.goto(`chrome-extension://${worker.url().split('/')[2]}/popup/popup.html`);
  const result=await page.evaluate(async vector=>{
    const p=await import('../src/sync/signedProtocol.js');
    const keys=await import('../src/sync/signingKeyProtection.js');
    const state=await p.verifyAuthorizationChain([vector.genesis],{...vector.trust,expectedHead:vector.authorizationHash});
    const verified=await p.verifySignedPublication(vector.body,vector.publication,state);
    const expected={vaultId:'fictional-browser-vault',keyEpoch:'epoch'};
    const admin=await keys.createAdministrativeKey('Fictional browser admin master 123!',expected);
    const restored=await keys.unlockAdministrativeKey(admin.envelope,'Fictional browser admin master 123!',expected);
    let rejected=false;try{await keys.unlockDeviceKey(admin.envelope,crypto.getRandomValues(new Uint8Array(32)),expected);}catch{rejected=true;}
    return {hash:state.hash,author:verified.author,extractable:restored.extractable,rejected};
  },vector);
  assert.deepEqual(result,{hash:vector.authorizationHash,author:'fixed-vector-writer',extractable:false,rejected:true});
  console.log('Chromium WebCrypto signed protocol passed: fixed Node vector, trusted checkpoint, protected admin-key round-trip and device-key separation. No Google or hardware acceptance.');
} finally {if(context)await context.close();await rm(profile,{recursive:true,force:true});}
