import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { installChrome, resetStorage } from './helpers/chrome.js';
installChrome();
const p=await import('../src/sync/signedProtocol.js');
const store=await import('../src/sync/authorizationStore.js');
beforeEach(()=>resetStorage());
async function fixture(){
 const admin=await p.generateSigningKey();const writer=await p.generateSigningKey();
 const payload={kind:'securepass-authorization',version:1,vaultId:'fictional-vault',keyEpoch:'epoch',revision:'genesis',previous:null,adminKey:admin.publicKey,devices:[{id:'writer',publicKey:writer.publicKey}]};
 const genesis=await p.createAuthorization(payload,admin.privateKey);
 const trust={vaultId:payload.vaultId,rootFingerprint:await p.signingKeyFingerprint(admin.publicKey)};
 const initial=await store.pinAuthorization([genesis],trust);
 return{admin,payload,genesis,trust,initial};
}
test('authorization checkpoint survives reload and rejects rollback to a previous valid chain',async()=>{
 const f=await fixture();
 const next=await p.createAuthorization({...f.payload,revision:'next',previous:f.initial.hash},f.admin.privateKey);
 const updated=await store.advanceAuthorization(f.trust.vaultId,[f.genesis,next]);
 assert.equal((await store.loadAuthorization(f.trust.vaultId)).hash,updated.hash);
 await assert.rejects(store.advanceAuthorization(f.trust.vaultId,[f.genesis]),/checkpoint/);
 assert.equal((await store.loadAuthorization(f.trust.vaultId)).hash,updated.hash);
});
test('an existing trusted root cannot be silently replaced or repinned',async()=>{
 const f=await fixture();
 await assert.rejects(store.pinAuthorization([f.genesis],f.trust),/concurrently/);
 await assert.rejects(store.advanceAuthorization('unknown',[f.genesis]),/independently/);
});
test('concurrent administration branches cannot overwrite each other using a stale checkpoint',async()=>{
 const f=await fixture();
 const changes=await Promise.all(['a','b'].map(revision=>p.createAuthorization({...f.payload,revision,previous:f.initial.hash},f.admin.privateKey)));
 const results=await Promise.allSettled(changes.map(change=>store.advanceAuthorization(f.trust.vaultId,[f.genesis,change])));
 assert.equal(results.filter(result=>result.status==='fulfilled').length,1);
 assert.ok(['a','b'].includes((await store.loadAuthorization(f.trust.vaultId)).payload.revision));
});
