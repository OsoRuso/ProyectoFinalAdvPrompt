import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";
import { prisma } from "@/lib/prisma";

vi.mock("@/lib/auth", () => ({ createSession: vi.fn() }));
vi.mock("@/lib/password", () => ({ verifyPassword: vi.fn() }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    loginAttempt: {
      deleteMany: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
    },
    user: { findUnique: vi.fn() },
  },
}));

describe("POST /api/auth/login", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.AUTH_RATE_LIMIT_SECRET = "test-rate-limit-secret-0123456789";
    vi.mocked(prisma.loginAttempt.deleteMany).mockResolvedValue({ count: 0 });
    vi.mocked(prisma.loginAttempt.count).mockResolvedValue(10);
  });

  it("rechaza el intento antes de verificar credenciales al alcanzar el límite por hora", async () => {
    const request = new Request("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        host: "localhost:3000",
        origin: "http://localhost:3000",
      },
      body: JSON.stringify({ email: "student@example.test", password: "password" }),
    });

    const response = await POST(request);

    expect(response.status).toBe(429);
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
    expect(prisma.loginAttempt.create).not.toHaveBeenCalled();
  });
});
