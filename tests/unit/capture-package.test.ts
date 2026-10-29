import { describe, expect, it } from 'vitest'
import { generateKeyPairSync } from 'node:crypto'
import { decryptCaptures, encryptCaptures } from '../../lab/capture-package'
const pair=()=>generateKeyPairSync('rsa',{modulusLength:2048,publicKeyEncoding:{type:'spki',format:'pem'},privateKeyEncoding:{type:'pkcs8',format:'pem'}})
const keys=pair()
describe('private public-page capture transport',()=>{
 it('round-trips binary images and metadata without exposing plaintext in the envelope',()=>{
  const files={'case.png':Buffer.from([0,1,255,2]),'manifest.json':Buffer.from('private-capture-marker')}
  const envelope=encryptCaptures(files,keys.publicKey)
  expect(envelope.toString()).not.toContain('private-capture-marker')
  expect(decryptCaptures(envelope,keys.privateKey)).toEqual(files)
 })
 it('rejects the wrong key and modified ciphertext',()=>{
  const envelope=encryptCaptures({'case.png':Buffer.from('pixels')},keys.publicKey)
  expect(()=>decryptCaptures(envelope,pair().privateKey)).toThrow()
  const value=JSON.parse(envelope.toString());const bytes=Buffer.from(value.ciphertext,'base64');bytes[0]^=1;value.ciphertext=bytes.toString('base64')
  expect(()=>decryptCaptures(Buffer.from(JSON.stringify(value)),keys.privateKey)).toThrow()
 })
 it('refuses paths that could escape the private destination',()=>{
  expect(()=>encryptCaptures({'../key.pem':Buffer.from('bad')},keys.publicKey)).toThrow()
  expect(()=>encryptCaptures({},keys.publicKey)).toThrow()
 })
})
