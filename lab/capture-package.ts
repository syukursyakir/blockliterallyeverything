import { createCipheriv, createDecipheriv, createHash, privateDecrypt, publicEncrypt, randomBytes, constants } from 'node:crypto'
import { gzipSync, gunzipSync } from 'node:zlib'

function validateNames(files: Record<string, string>) {
  const names=Object.keys(files)
  if(!names.length || names.length>80 || names.some(n=>! /^[a-zA-Z0-9][a-zA-Z0-9_.-]{0,120}$/.test(n))) throw new Error('Invalid private capture file names/count.')
}
export function encryptCaptures(files: Record<string,Buffer>, publicKey: string) {
  validateNames(Object.fromEntries(Object.keys(files).map(n=>[n,''])))
  const key=randomBytes(32),nonce=randomBytes(12)
  const cipher=createCipheriv('aes-256-gcm',key,nonce)
  const payload=gzipSync(Buffer.from(JSON.stringify(Object.fromEntries(Object.entries(files).map(([name,bytes])=>[name,bytes.toString('base64')])))))
  if(payload.length>64*1024*1024)throw new Error('Capture package too large.')
  const ciphertext=Buffer.concat([cipher.update(payload),cipher.final()])
  const wrappedKey=publicEncrypt({key:publicKey,oaepHash:'sha256',padding:constants.RSA_PKCS1_OAEP_PADDING},key)
  key.fill(0)
  return Buffer.from(JSON.stringify({version:1,algorithm:'RSA-OAEP-SHA256+AES-256-GCM',publicKeySha256:createHash('sha256').update(publicKey).digest('hex'),wrappedKey:wrappedKey.toString('base64'),nonce:nonce.toString('base64'),tag:cipher.getAuthTag().toString('base64'),ciphertext:ciphertext.toString('base64')}))
}
export function decryptCaptures(envelope: Buffer, privateKey: string) {
  const e=JSON.parse(envelope.toString())
  if(e.version!==1 || e.algorithm!=='RSA-OAEP-SHA256+AES-256-GCM')throw new Error('Unknown capture package.')
  const key=privateDecrypt({key:privateKey,oaepHash:'sha256',padding:constants.RSA_PKCS1_OAEP_PADDING},Buffer.from(e.wrappedKey,'base64'))
  const decipher=createDecipheriv('aes-256-gcm',key,Buffer.from(e.nonce,'base64'));decipher.setAuthTag(Buffer.from(e.tag,'base64'))
  const payload=Buffer.concat([decipher.update(Buffer.from(e.ciphertext,'base64')),decipher.final()]);key.fill(0)
  const files=JSON.parse(gunzipSync(payload,{maxOutputLength:192*1024*1024}).toString()) as Record<string,string>
  validateNames(files)
  return Object.fromEntries(Object.entries(files).map(([name,bytes])=>{if(typeof bytes!=='string')throw new Error('Invalid capture file.');return [name,Buffer.from(bytes,'base64')]}))
}
