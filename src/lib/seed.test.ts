import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  titles: [] as string[],
  findMany: vi.fn(),
  createMany: vi.fn(),
  disconnect: vi.fn(),
}));

vi.mock("@prisma/client", () => ({
  default: {
    PrismaClient: class {
      knowledgeArticle = { findMany: mocks.findMany, createMany: mocks.createMany };
      $disconnect = mocks.disconnect;
    },
    UserRole: { ADMIN: "ADMIN" },
  },
}));

describe("demo knowledge seed", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.stubEnv("ADMIN_EMAIL", "");
    vi.stubEnv("ADMIN_PASSWORD", "");
    vi.spyOn(console, "warn").mockImplementation(() => {});
    mocks.titles = ["Certificado de alumno regular"];
    mocks.findMany.mockImplementation(async () => mocks.titles.map((title) => ({ title })));
    mocks.createMany.mockImplementation(async ({ data }: { data: Array<{ title: string }> }) => {
      mocks.titles.push(...data.map((article) => article.title));
      return { count: data.length };
    });
    mocks.disconnect.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("omits existing titles and does not add duplicates on a second sequential run", async () => {
    await import("../../prisma/seed.mjs");
    await vi.waitFor(() => expect(mocks.disconnect).toHaveBeenCalledTimes(1));
    expect(mocks.titles).toHaveLength(6);
    expect(mocks.createMany).toHaveBeenCalledTimes(1);

    vi.resetModules();
    await import("../../prisma/seed.mjs");
    await vi.waitFor(() => expect(mocks.disconnect).toHaveBeenCalledTimes(2));
    expect(mocks.titles).toHaveLength(6);
    expect(mocks.createMany).toHaveBeenCalledTimes(1);
  });
});
