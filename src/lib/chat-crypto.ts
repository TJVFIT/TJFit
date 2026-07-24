function bytesToBase64(bytes: Uint8Array) {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return window.btoa(binary);
}

export async function createConversationKey() {
  return crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
}

export async function importPublicKeyJwk(jwk: JsonWebKey) {
  return crypto.subtle.importKey(
    "jwk",
    jwk,
    { name: "RSA-OAEP", hash: "SHA-256" },
    false,
    ["encrypt"]
  );
}

export async function wrapConversationKeyForRecipient(
  conversationKey: CryptoKey,
  publicKey: CryptoKey
) {
  const rawKey = await crypto.subtle.exportKey("raw", conversationKey);
  const wrapped = await crypto.subtle.encrypt({ name: "RSA-OAEP" }, publicKey, rawKey);
  return bytesToBase64(new Uint8Array(wrapped));
}
