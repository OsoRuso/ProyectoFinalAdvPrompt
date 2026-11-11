import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const SALT_BYTES = 16;
const KEY_LENGTH = 64;

export function hashPassword(password: string): string {
  const salt = randomBytes(SALT_BYTES).toString("hex");
  const key = scryptSync(password, salt, KEY_LENGTH).toString("hex");
  return `scrypt:${salt}:${key}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  const [algorithm, salt, storedKey] = storedHash.split(":");
  if (algorithm !== "scrypt" || !salt || !storedKey || !/^[a-f0-9]{128}$/i.test(storedKey)) {
    return false;
  }

  const candidate = scryptSync(password, salt, KEY_LENGTH);
  const expected = Buffer.from(storedKey, "hex");
  return expected.length === candidate.length && timingSafeEqual(candidate, expected);
}
