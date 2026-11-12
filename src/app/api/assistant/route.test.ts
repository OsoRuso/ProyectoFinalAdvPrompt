import { beforeEach, describe, expect, it, vi } from "vitest";
import demoArticles from "../../../../prisma/demo-knowledge.json";
import { POST } from "./route";

const mocks = vi.hoisted(() => ({
  getCurrentUser: vi.fn(),
  findMany: vi.fn(),
  openai: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({ getCurrentUser: mocks.getCurrentUser }));
vi.mock("@/lib/prisma", () => ({ prisma: { knowledgeArticle: { findMany: mocks.findMany } } }));
vi.mock("openai", () => ({ default: mocks.openai }));

describe("POST /api/assistant", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getCurrentUser.mockResolvedValue({ id: "student", role: "STUDENT" });
    mocks.findMany.mockResolvedValue(demoArticles.map((article, index) => ({ ...article, id: String(index) })));
  });

  it.each([
    "¿Cuál es la política institucional de becas y cuándo vence?",
    "Explícame cómo descargar un juego en mi teléfono.",
  ])("se abstiene sin llamar a OpenAI ante información no respaldada: %s", async (question) => {
    const request = new Request("http://localhost:3000/api/assistant", {
      method: "POST",
      headers: { "content-type": "application/json", host: "localhost:3000", origin: "http://localhost:3000" },
      body: JSON.stringify({ question }),
    });

    const response = await POST(request);
    const result = await response.json();

    expect(response.status).toBe(200);
    expect(result).toMatchObject({ sources: [], needsHumanSupport: true });
    expect(mocks.openai).not.toHaveBeenCalled();
  });
});
