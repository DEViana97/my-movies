import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}));

vi.mock("bcryptjs", () => ({
  compare: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

describe("authOptions credentials provider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns null when credentials are missing", async () => {
    const { authOptions } = await import("@/lib/auth");
    const provider = authOptions.providers[0] as { authorize?: (credentials?: Record<string, string>) => Promise<unknown> };

    const result = await provider.authorize?.({ identifier: "", password: "" });

    expect(result).toBeNull();
  });

  it("returns null when password does not match", async () => {
    const { prisma } = await import("@/lib/prisma");
    const { compare } = await import("bcryptjs");

    const mockedPrisma = prisma as unknown as {
      user: {
        findFirst: ReturnType<typeof vi.fn>;
      };
    };

    mockedPrisma.user.findFirst.mockResolvedValueOnce({
      id: "u1",
      name: "Mateus",
      username: "mateus",
      email: "mateus@email.com",
      image: null,
      passwordHash: "hashed",
    });

    vi.mocked(compare).mockResolvedValueOnce(false);

    const { authOptions } = await import("@/lib/auth");
    const provider = authOptions.providers[0] as { authorize?: (credentials?: Record<string, string>) => Promise<unknown> };

    const result = await provider.authorize?.({ identifier: "mateus@email.com", password: "123456" });

    expect(result).toBeNull();
  });

});
