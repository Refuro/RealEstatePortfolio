import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { mockActiveUser, mockFreeTierUser } from "@/lib/test/api-route-mocks";

const { getActiveAppUserMock } = vi.hoisted(() => {
  const getActiveAppUserMock = vi.fn();
  return { getActiveAppUserMock };
});

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    property: {
      count: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

const { checkRateLimitMock, recordRateLimitMock } = vi.hoisted(() => ({
  checkRateLimitMock: vi.fn().mockResolvedValue({ allowed: true }),
  recordRateLimitMock: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/auth", () => ({
  getActiveAppUser: () => getActiveAppUserMock(),
}));

vi.mock("@/lib/db", () => ({
  prisma: prismaMock,
}));

vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: (...args: unknown[]) => checkRateLimitMock(...args),
  recordRateLimit: (...args: unknown[]) => recordRateLimitMock(...args),
  getRateLimitIdentifier: vi.fn((userId: string | null) =>
    userId ? `user:${userId}` : "ip:unknown"
  ),
}));

const MORTGAGE_HEADER =
  "address,city,state,zipCode,purchase price,purchase date,value,rent,expenses,is rented,property type,units,vacancy %,mortgage balance,mortgage rate,mortgage term,monthly payment,balance as of,escrow amount";

/** Minimal valid CSV row per `parseRow` (see `lib/import/csv-parser.ts`). */
function minimalCsvOneRow() {
  return [
    "address,city,state,zipCode,purchase price,purchase date,value,rent,expenses,is rented,property type,units,vacancy %",
    "100 Main St,Austin,TX,78701,200000,2020-01-01,250000,2000,500,yes,single_family,1,5",
  ].join("\n");
}

/** One row with mortgage where escrow >= monthly payment (invalid). */
function csvMortgageEscrowTooHigh() {
  return [
    MORTGAGE_HEADER,
    "100 Main St,Austin,TX,78701,200000,2020-01-01,250000,2000,500,yes,single_family,1,5,180000,6.5,30,1000,2024-01-01,1200",
  ].join("\n");
}

/** One row with mortgage where P&I does not cover monthly interest (invalid). */
function csvMortgagePiTooLow() {
  return [
    MORTGAGE_HEADER,
    "100 Main St,Austin,TX,78701,200000,2020-01-01,250000,2000,500,yes,single_family,1,5,180000,6.5,30,800,2024-01-01,",
  ].join("\n");
}

/** First data row invalid mortgage; second row has no mortgage (blanks). */
function csvOneBadMortgageOneCleanRow() {
  return [
    MORTGAGE_HEADER,
    "200 Main St,Austin,TX,78701,200000,2020-01-01,250000,2000,500,yes,single_family,1,5,180000,6.5,30,800,2024-01-01,",
    "201 Oak St,Austin,TX,78701,200000,2020-01-01,250000,2000,500,yes,single_family,1,5,,,,,,",
  ].join("\n");
}

/** Minimal shape for Prisma interactive transaction callback (import route only uses property + mortgage). */
type ImportTransaction = {
  property: {
    create: (args: unknown) => Promise<{ id: string }>;
    update: (args: unknown) => Promise<unknown>;
  };
  mortgage: { create: (args: unknown) => Promise<unknown> };
};

function formRequestWithFile(csv: string, filename = "import.csv") {
  const formData = new FormData();
  formData.append("file", new File([csv], filename, { type: "text/csv" }));
  return new NextRequest("http://localhost/api/import/portfolio", {
    method: "POST",
    body: formData,
  });
}

describe("POST /api/import/portfolio", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    checkRateLimitMock.mockResolvedValue({ allowed: true });
    getActiveAppUserMock.mockResolvedValue(mockFreeTierUser);
    prismaMock.property.count.mockResolvedValue(0);
    prismaMock.$transaction.mockImplementation(
      async (fn: (tx: ImportTransaction) => Promise<void>) => {
        const tx = {
          property: {
            create: vi.fn().mockResolvedValue({ id: "new-prop-id" }),
            update: vi.fn().mockResolvedValue({}),
          },
          mortgage: { create: vi.fn().mockResolvedValue({}) },
        };
        await fn(tx as unknown as ImportTransaction);
      }
    );
  });

  it("returns 401 when there is no active user", async () => {
    getActiveAppUserMock.mockResolvedValue(null);
    const { POST } = await import("./route");
    const res = await POST(formRequestWithFile(minimalCsvOneRow()));
    expect(res.status).toBe(401);
  });

  it("returns 400 when multipart has no file field", async () => {
    const formData = new FormData();
    const req = new NextRequest("http://localhost/api/import/portfolio", {
      method: "POST",
      body: formData,
    });
    const { POST } = await import("./route");
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toMatch(/No file provided/i);
  });

  it("returns 429 when rate limit is exceeded", async () => {
    checkRateLimitMock.mockResolvedValue({ allowed: false });
    const { POST } = await import("./route");
    const res = await POST(formRequestWithFile(minimalCsvOneRow()));
    expect(res.status).toBe(429);
    const data = await res.json();
    expect(data.error).toMatch(/Rate limit/i);
    expect(recordRateLimitMock).not.toHaveBeenCalled();
  });

  it("returns 403 with PLAN_LIMIT_REACHED when at property cap (free tier)", async () => {
    prismaMock.property.count.mockResolvedValue(1);
    const { POST } = await import("./route");
    const res = await POST(formRequestWithFile(minimalCsvOneRow()));
    expect(res.status).toBe(403);
    const data = await res.json();
    expect(data.code).toBe("PLAN_LIMIT_REACHED");
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it("imports one row when under cap and records rate limit", async () => {
    prismaMock.property.count.mockResolvedValue(0);
    const { POST } = await import("./route");
    const res = await POST(formRequestWithFile(minimalCsvOneRow()));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.imported).toBe(1);
    expect(prismaMock.$transaction).toHaveBeenCalled();
    expect(recordRateLimitMock).toHaveBeenCalled();
  });

  it("returns 200 with imported 0 and escrow error when escrow >= monthly payment", async () => {
    prismaMock.property.count.mockResolvedValue(0);
    const { POST } = await import("./route");
    const res = await POST(formRequestWithFile(csvMortgageEscrowTooHigh()));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.imported).toBe(0);
    expect(data.errors.some((e: { message: string }) =>
      /Escrow amount must be less than monthly payment/i.test(e.message)
    )).toBe(true);
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it("returns 200 with imported 0 and P&I error when payment does not cover interest", async () => {
    prismaMock.property.count.mockResolvedValue(0);
    const { POST } = await import("./route");
    const res = await POST(formRequestWithFile(csvMortgagePiTooLow()));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.imported).toBe(0);
    expect(
      data.errors.some((e: { message: string }) =>
        /P&I must cover the monthly interest/i.test(e.message)
      )
    ).toBe(true);
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it("imports rows that pass mortgage checks and records row-level errors for failing rows", async () => {
    getActiveAppUserMock.mockResolvedValue(mockActiveUser);
    prismaMock.property.count.mockResolvedValue(0);
    const { POST } = await import("./route");
    const res = await POST(formRequestWithFile(csvOneBadMortgageOneCleanRow()));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.imported).toBe(1);
    expect(
      data.errors.some((e: { row: number; message: string }) =>
        e.row === 2 && /P&I must cover the monthly interest/i.test(e.message)
      )
    ).toBe(true);
    expect(prismaMock.$transaction).toHaveBeenCalled();
    expect(recordRateLimitMock).toHaveBeenCalled();
  });

  it("returns 500 when import transaction fails", async () => {
    prismaMock.$transaction.mockRejectedValue(new Error("db down"));
    const { POST } = await import("./route");
    const res = await POST(formRequestWithFile(minimalCsvOneRow()));
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toMatch(/Import failed/i);
  });
});
