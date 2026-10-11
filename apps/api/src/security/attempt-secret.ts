import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
export const generateSecret = () => randomBytes(32).toString("base64url");
export const digestSecret = (secret: string) => createHash("sha256").update(secret).digest("hex");
export function verifySecret(secret: string, digest: string): boolean {
  if (!/^[A-Za-z0-9_-]{43}$/.test(secret) || !/^[a-f0-9]{64}$/.test(digest)) return false;
  return timingSafeEqual(Buffer.from(digestSecret(secret), "hex"), Buffer.from(digest, "hex"));
}
