import { getSupabaseBrowserClient } from "@/lib/supabase";

type StoredKeyPair = {
  id: string;
  privateKey: CryptoKey;
  publicKey: CryptoKey;
  publicKeyJwk: JsonWebKey;
};

function openKeyDatabase() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open("tjfit-secure-keys", 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains("keys")) {
        request.result.createObjectStore("keys", { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function getStoredPair(userId: string) {
  const database = await openKeyDatabase();
  return new Promise<StoredKeyPair | undefined>((resolve, reject) => {
    const transaction = database.transaction("keys", "readonly");
    const request = transaction.objectStore("keys").get(userId);
    request.onsuccess = () => resolve(request.result as StoredKeyPair | undefined);
    request.onerror = () => reject(request.error);
    transaction.oncomplete = () => database.close();
  });
}

async function savePair(pair: StoredKeyPair) {
  const database = await openKeyDatabase();
  return new Promise<void>((resolve, reject) => {
    const transaction = database.transaction("keys", "readwrite");
    transaction.objectStore("keys").put(pair);
    transaction.oncomplete = () => {
      database.close();
      resolve();
    };
    transaction.onerror = () => reject(transaction.error);
  });
}

export async function ensureUserKeyPair(userId: string) {
  const existing = await getStoredPair(userId);
  if (existing) {
    return existing;
  }

  const pair = await crypto.subtle.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256"
    },
    false,
    ["encrypt", "decrypt"]
  );
  const publicKeyJwk = await crypto.subtle.exportKey("jwk", pair.publicKey);
  const stored: StoredKeyPair = {
    id: userId,
    privateKey: pair.privateKey,
    publicKey: pair.publicKey,
    publicKeyJwk
  };
  await savePair(stored);

  const supabase = getSupabaseBrowserClient();
  if (supabase) {
    await supabase.from("user_public_keys").upsert(
      { user_id: userId, public_key_jwk: publicKeyJwk },
      { onConflict: "user_id" }
    );
  }

  return stored;
}
