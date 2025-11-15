// wallet.ts - Wallet encryption/decryption utilities
import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";

/**
 * Generate a new Solana keypair
 */
export function generateKeypair(): Keypair {
  return Keypair.generate();
}

/**
 * Encrypt private key with password using Web Crypto API
 */
export async function encryptPrivateKey(
  privateKeyBytes: Uint8Array,
  password: string
): Promise<string> {
  // Derive key from password
  const enc = new TextEncoder();
  const passwordBuffer = enc.encode(password);
  
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    passwordBuffer,
    "PBKDF2",
    false,
    ["deriveBits", "deriveKey"]
  );

  // Generate salt
  const salt = crypto.getRandomValues(new Uint8Array(16));

  // Derive encryption key
  const key = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt"]
  );

  // Generate IV
  const iv = crypto.getRandomValues(new Uint8Array(12));

  // Encrypt
  const encryptedData = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    privateKeyBytes as BufferSource
  );

  // Combine salt + iv + encrypted data
  const combined = new Uint8Array(salt.length + iv.length + encryptedData.byteLength);
  combined.set(salt, 0);
  combined.set(iv, salt.length);
  combined.set(new Uint8Array(encryptedData), salt.length + iv.length);

  // Return as base64
  return btoa(String.fromCharCode(...combined));
}

/**
 * Decrypt private key with password
 */
export async function decryptPrivateKey(
  encryptedBase64: string,
  password: string
): Promise<Uint8Array | null> {
  try {
    // Decode base64
    const combined = Uint8Array.from(atob(encryptedBase64), c => c.charCodeAt(0));

    // Extract salt, iv, and encrypted data
    const salt = combined.slice(0, 16);
    const iv = combined.slice(16, 28);
    const encryptedData = combined.slice(28);

    // Derive key from password
    const enc = new TextEncoder();
    const passwordBuffer = enc.encode(password);
    
    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      passwordBuffer,
      "PBKDF2",
      false,
      ["deriveBits", "deriveKey"]
    );

    const key = await crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt,
        iterations: 100000,
        hash: "SHA-256",
      },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      false,
      ["decrypt"]
    );

    // Decrypt
    const decryptedData = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      encryptedData as BufferSource
    );

    return new Uint8Array(decryptedData);
  } catch (error: any) {
    // Wrong password or corrupted data - this is expected for wrong passwords
    console.log("[vizor] Decryption failed (likely wrong password):", error.message || error);
    return null;
  }
}

/**
 * Convert private key bytes to base58 string
 */
export function privateKeyToBase58(privateKeyBytes: Uint8Array): string {
  return bs58.encode(privateKeyBytes);
}

/**
 * Convert base58 string to Keypair
 */
export function keypairFromBase58(base58: string): Keypair {
  const secretKey = bs58.decode(base58);
  return Keypair.fromSecretKey(secretKey);
}

