import crypto from 'node:crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_BYTES = 12;   // 96-bit IV recommended for GCM
const TAG_BYTES = 16;  // 128-bit auth tag

/**
 * Encrypt a Buffer with AES-256-GCM.
 * Returns { iv, ciphertext, tag } — all Buffers.
 */
export function encrypt(plaintext, hexKey) {
  const key = Buffer.from(hexKey, 'hex');
  if (key.length !== 32) throw new Error('Encryption key must be 32 bytes (64 hex chars)');

  const iv = crypto.randomBytes(IV_BYTES);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const tag = cipher.getAuthTag();

  return { iv, ciphertext: encrypted, tag };
}

/**
 * Decrypt AES-256-GCM ciphertext.
 * Returns the decrypted Buffer.
 */
export function decrypt({ iv, ciphertext, tag }, hexKey) {
  const key = Buffer.from(hexKey, 'hex');
  if (key.length !== 32) throw new Error('Encryption key must be 32 bytes (64 hex chars)');

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
}

/**
 * Pack encrypted payload into a single Buffer: [iv][tag][ciphertext]
 * This is the wire format stored in R2.
 */
export function packEncrypted({ iv, ciphertext, tag }) {
  return Buffer.concat([iv, tag, ciphertext]);
}

/**
 * Unpack wire format Buffer into { iv, ciphertext, tag }.
 */
export function unpackEncrypted(buf) {
  const iv = buf.subarray(0, IV_BYTES);
  const tag = buf.subarray(IV_BYTES, IV_BYTES + TAG_BYTES);
  const ciphertext = buf.subarray(IV_BYTES + TAG_BYTES);
  return { iv, ciphertext, tag };
}

/**
 * Generate a new 32-byte encryption key (hex string).
 * Run once and store in a password manager.
 */
export function generateKey() {
  return crypto.randomBytes(32).toString('hex');
}
