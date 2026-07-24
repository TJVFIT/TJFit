const encoder = new TextEncoder();
const decoder = new TextDecoder();

function toBase64(bytes: Uint8Array) {
  if (typeof window === "undefined") return Buffer.from(bytes).toString("base64");
  let binary = "";
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary);
}

function fromBase64(base64: string) {
  if (typeof window === "undefined") return new Uint8Array(Buffer.from(base64, "base64"));
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export async function generateEncryptionKeyPair() {
  return crypto.subtle.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256"
    },
    true,
    ["wrapKey", "unwrapKey"]
  );
}

export async function exportPublicKeyJwk(publicKey: CryptoKey) {
  return crypto.subtle.exportKey("jwk", publicKey);
}

export async function exportPrivateKeyPkcs8(privateKey: CryptoKey) {
  const bytes = await crypto.subtle.exportKey("pkcs8", privateKey);
  return toBase64(new Uint8Array(bytes));
}

export async function importPrivateKeyPkcs8(serialized: string) {
  const bytes = fromBase64(serialized);
  return crypto.subtle.importKey(
    "pkcs8",
    bytes,
    { name: "RSA-OAEP", hash: "SHA-256" },
    true,
    ["unwrapKey"]
  );
}

export async function importPublicKeyJwk(jwk: JsonWebKey) {
  return crypto.subtle.importKey("jwk", jwk, { name: "RSA-OAEP", hash: "SHA-256" }, true, [
    "wrapKey"
  ]);
}

export async function createConversationKey() {
  return crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, ["encrypt", "decrypt"]);
}

export async function wrapConversationKeyForRecipient(conversationKey: CryptoKey, recipientPublicKey: CryptoKey) {
  const wrapped = await crypto.subtle.wrapKey("raw", conversationKey, recipientPublicKey, { name: "RSA-OAEP" });
  return toBase64(new Uint8Array(wrapped));
}

export async function unwrapConversationKeyForSelf(wrappedKey: string, privateKey: CryptoKey) {
  const wrappedBytes = fromBase64(wrappedKey);
  return crypto.subtle.unwrapKey(
    "raw",
    wrappedBytes,
    privateKey,
    { name: "RSA-OAEP" },
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
}

export async function encryptText(plaintext: string, conversationKey: CryptoKey) {
  const nonce = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: nonce },
    conversationKey,
    encoder.encode(plaintext)
  );

  return {
    ciphertext: toBase64(new Uint8Array(ciphertext)),
    nonce: toBase64(nonce)
  };
}

export async function decryptText(ciphertext: string, nonce: string, conversationKey: CryptoKey) {
  const plain = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: fromBase64(nonce) },
    conversationKey,
    fromBase64(ciphertext)
  );
  return decoder.decode(plain);
}

export async function encryptBinary(data: ArrayBuffer, conversationKey: CryptoKey) {
  const nonce = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv: nonce }, conversationKey, data);
  return {
    ciphertext: new Uint8Array(ciphertext),
    nonce: toBase64(nonce)
  };
}

