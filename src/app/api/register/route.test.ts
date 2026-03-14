import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
  },
}));

describe("POST /api/register", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns validation error for invalid payload", async () => {
    const { POST } = await import("./route");

    const req = new Request("http://localhost/api/register", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-forwarded-for": "10.0.0.1",
      },
      body: JSON.stringify({ email: "invalid" }),
    });

    const res = await POST(req);
    const data = (await res.json()) as { ok: boolean; code: string };

    expect(res.status).toBe(400);
    expect(data.ok).toBe(false);
    expect(data.code).toBe("VALIDATION_ERROR");
  });

  it("returns conflict when username already exists", async () => {
    const { prisma } = await import("@/lib/prisma");
    const mockedPrisma = prisma as unknown as {
      user: {
        findFirst: ReturnType<typeof vi.fn>;
        create: ReturnType<typeof vi.fn>;
      };
    };

    mockedPrisma.user.findFirst.mockResolvedValueOnce({ username: "mateus", email: "foo@bar.com" });

    const { POST } = await import("./route");
    const req = new Request("http://localhost/api/register", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-forwarded-for": "10.0.0.2",
      },
      body: JSON.stringify({
        name: "Mateus",
        username: "mateus",
        email: "new@email.com",
        password: "123456",
      }),
    });

    const res = await POST(req);
    const data = (await res.json()) as { ok: boolean; code: string; error: string };

    expect(res.status).toBe(409);
    expect(data.ok).toBe(false);
    expect(data.code).toBe("CONFLICT");
    expect(data.error).toContain("Usuario");
    expect(mockedPrisma.user.create).not.toHaveBeenCalled();
  });

  it("creates user and returns 201 on success", async () => {
    const { prisma } = await import("@/lib/prisma");
    const mockedPrisma = prisma as unknown as {
      user: {
        findFirst: ReturnType<typeof vi.fn>;
        create: ReturnType<typeof vi.fn>;
      };
    };

    mockedPrisma.user.findFirst.mockResolvedValueOnce(null);
    mockedPrisma.user.create.mockResolvedValueOnce({ id: "u1" });

    const { POST } = await import("./route");
    const req = new Request("http://localhost/api/register", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-forwarded-for": "10.0.0.3",
      },
      body: JSON.stringify({
        name: "Mateus",
        username: "mateus",
        email: "mateus@email.com",
        password: "123456",
      }),
    });

    const res = await POST(req);
    const data = (await res.json()) as { ok: boolean };

    expect(res.status).toBe(201);
    expect(data.ok).toBe(true);
    expect(mockedPrisma.user.create).toHaveBeenCalledTimes(1);
  });

  it("rate limits repeated requests from same ip", async () => {
    const { POST } = await import("./route");

    const makeReq = () =>
      new Request("http://localhost/api/register", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-forwarded-for": "10.0.0.4",
        },
        body: JSON.stringify({
          name: "Mateus",
          username: "mateus",
          email: "mateus@email.com",
          password: "123456",
        }),
      });

    let res: Response | null = null;
    for (let i = 0; i < 9; i += 1) {
      res = await POST(makeReq());
    }

    expect(res).not.toBeNull();
    expect(res?.status).toBe(429);
    const data = (await res?.json()) as { ok: boolean; code: string };
    expect(data.ok).toBe(false);
    expect(data.code).toBe("RATE_LIMITED");
  });
});
