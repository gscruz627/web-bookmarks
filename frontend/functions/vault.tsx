import type { BookmarkInfoDTO } from "../enums";

export function fromB64(b64: string): ArrayBuffer {
    const bin = atob(b64);
    const buf = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
    return buf.buffer;
}

export async function decryptBookmark(
    dek: CryptoKey,
    encrypted: { ciphertext: string; iv: string }
    ) {
        console.log(dek);
        const ciphertext = fromB64(encrypted.ciphertext);
        const iv = new Uint8Array(fromB64(encrypted.iv));
        const plaintextBuf = await crypto.subtle.decrypt(
          { name: "AES-GCM", iv },
          dek,
          ciphertext
        );
      return JSON.parse(new TextDecoder().decode(plaintextBuf));
}

export function base64ToArrayBuffer(base64: string) {
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
    }
export function toB64(buf: ArrayBuffer){
  return btoa(String.fromCharCode(...new Uint8Array(buf)));
}
export async function encryptBookmark(
  dek: CryptoKey,
  data: BookmarkInfoDTO
  ) {
    console.log("im being reached");
    const iv = crypto.getRandomValues(new Uint8Array(12));          // 12-byte GCM IV
    const plaintext = new TextEncoder().encode(JSON.stringify(data));
    console.log(iv);
    const ciphertext = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },                                       // (optionally add: , additionalData: aad )
      dek,
      plaintext
    );
    console.log(ciphertext)
    console.log(toB64(ciphertext))
    console.log(toB64(iv.buffer))
    return {
      cipher: toB64(ciphertext),
      iv: toB64(iv.buffer)
    };
  }