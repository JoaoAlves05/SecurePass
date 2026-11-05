import { test } from 'node:test';
import assert from 'node:assert/strict';
import { installChrome, resetStorage } from './helpers/chrome.js';
installChrome();
const vault = await import('../src/cryptoVault.js');
const { encryptEntries } = await import('../src/vault/crypto.js');
const { commitRecord } = await import('../src/vault/repository.js');
const protocol = await import('../src/sync/signedProtocol.js');
const { pinAuthorization, advanceAuthorization } = await import('../src/sync/authorizationStore.js');
const { prepareSignedPublication } = await import('../src/sync/signedPublication.js');
const { publicationStore: store } = await import('../src/sync/publicationStore.js');
const { createPublicationCoordinator } = await import('../src/sync/publication.js');
const { createDriveTransport } = await import('../src/sync/driveTransport.js');
test('signed vault commit reaches verified emulated transport and acknowledges the exact queued operation', async () => {
  resetStorage(); await vault.initializeVault('Fictional end to end drive master 123!');
  const active = await vault.requireVault();
  const record = await encryptEntries(active.record, [], active.bytes);
  const admin = await protocol.generateSigningKey(); const device = await protocol.generateSigningKey();
  const genesis = await protocol.createAuthorization({kind:'securepass-authorization',version:1,vaultId:record.vaultId,keyEpoch:record.keyEpoch,revision:crypto.randomUUID(),previous:null,adminKey:admin.publicKey,devices:[{id:'writer',publicKey:device.publicKey}]},admin.privateKey);
  const authorization = await pinAuthorization([genesis],{vaultId:record.vaultId,rootFingerprint:await protocol.signingKeyFingerprint(admin.publicKey)});
  const binding={accountId:'fictional-account',vaultId:record.vaultId,generation:'one'};
  await store.configure(binding,true);
  const prepared=await prepareSignedPublication(record,{binding,author:'writer',privateKey:device.privateKey,authorization});
  await commitRecord(record,active.record.revision,{drivePublication:prepared});
  const operation=await store.next();const files=[];
  const transport=createDriveTransport({getToken:async()=>'fictional-token',assertBinding:async()=>store.assertCurrent(operation),assertWritable:async()=>store.assertCurrent(operation),validatePublication:(body,identity)=>protocol.verifySignedPublication(body,identity,authorization),fetchImpl:async(url,options)=>{
    if(options.method==='POST'){
      // Extract the actual media segment, instead of supplying the expected body.
      const boundary=options.headers['Content-Type'].split('boundary=')[1];
      const sections=options.body.split(`--${boundary}`);
      const media=sections[2].slice(sections[2].indexOf('\r\n\r\n')+4,-2);
      files.push({id:'uploaded',appProperties:{vaultId:record.vaultId,revisionId:record.revision},body:media});
      return Response.json({id:'uploaded'});
    }
    if(url.includes('alt=media'))return new Response(files[0].body);
    return Response.json({files});
  }});
  assert.deepEqual(await createPublicationCoordinator({store,transport}).run(),{published:true,revisionId:record.revision});
  assert.equal(await store.next(),null);assert.equal(files[0].body,prepared.publication.body);
  const staleRecord=await encryptEntries(record,[],active.bytes);
  const stalePacket=await prepareSignedPublication(staleRecord,{binding,author:'writer',privateKey:device.privateKey,authorization});
  await commitRecord(staleRecord,record.revision,{drivePublication:stalePacket});
  const revokedOperation=await store.next();
  const lateRecord=await encryptEntries(staleRecord,[],active.bytes);
  const latePacket=await prepareSignedPublication(lateRecord,{binding,author:'writer',privateKey:device.privateKey,authorization});
  const nextAuthorization=await protocol.createAuthorization({...genesis.payload,revision:crypto.randomUUID(),previous:authorization.hash},admin.privateKey);
  await advanceAuthorization(record.vaultId,[genesis,nextAuthorization]);
  await assert.rejects(store.assertCurrent(revokedOperation),/authorization changed/);
  await assert.rejects(store.acknowledge(revokedOperation,{verified:true,revisionId:staleRecord.revision}),/authorization changed/);
  await assert.rejects(commitRecord(lateRecord,staleRecord.revision,{drivePublication:latePacket}),/authorization changed/);
  assert.equal((await (await import('../src/utils/storage.js')).readLocalVaultRecordRaw()).revision,staleRecord.revision);
});
