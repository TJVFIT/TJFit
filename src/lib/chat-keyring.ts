import { getSupabaseBrowserClient } from "@/lib/supabase";
import {
  exportPrivateKeyPkcs8,
  exportPublicKeyJwk,
  generateEncryptionKeyPair,
  importPrivateKeyPkcs8
} from "@/lib/chat-crypto";

const PRIVATE_KEY_PREFIX = "tjfit-chat-private-key:";

export async function ensureUserKeyPair(userId: string) {
  const privateKeyStorageKey = `${PRIVATE_KEY_PREFIX}${userId}`;
  const supabase = getSupabaseBrowserClient();
  if (!supabase) throw new Error("Supabase not configured.");

  const stored = localStorage.getItem(privateKeyStorageKey);
  if (stored) {
    const privateKey = await importPrivateKeyPkcs8(stored);
    const { data } = await supabase.from("user_public_keys").select("public_key_jwk").eq("user_id", userId).single();
    return { privateKey, publicKeyJwk: (data?.public_key_jwk ?? null) as JsonWebKey | null };
  }

  const pair = await generateEncryptionKeyPair();
  const [privateSerialized, publicJwk] = await Promise.all([
    exportPrivateKeyPkcs8(pair.privateKey),
    exportPublicKeyJwk(pair.publicKey)
  ]);

  localStorage.setItem(privateKeyStorageKey, privateSerialized);
  await supabase.from("user_public_keys").upsert({
    user_id: userId,
    public_key_jwk: publicJwk
  });

  return { privateKey: pair.privateKey, publicKeyJwk: publicJwk };
}

