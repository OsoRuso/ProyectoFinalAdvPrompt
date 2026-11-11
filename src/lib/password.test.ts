import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "./password";

describe("password hashing", () => {
  it("verifies the password that was hashed", () => {
    const password = "Clave-de-prueba-larga-2026";
    expect(verifyPassword(password, hashPassword(password))).toBe(true);
  });

  it("rejects a different password and malformed hashes", () => {
    expect(verifyPassword("incorrecta", "scrypt:bad:hash")).toBe(false);
    expect(verifyPassword("Clave-de-prueba-larga-2026", "invalid")).toBe(false);
  });
});
