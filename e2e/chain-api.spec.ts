import { expect, test } from "@playwright/test";

/**
 * The on-chain read API.
 *
 * After the landing-page merge the UI renders from lib/data fixtures again, so
 * these routes are the only surface still reading the deployed program. They
 * are what a chain-backed UI would consume, and they keep the query layer
 * honest in the meantime.
 */

test.describe("chain API", () => {
  test("resolves a batch by its printed code", async ({ request }) => {
    const res = await request.get("/api/batch/2026-11-001");
    expect(res.status()).toBe(200);

    const { found, batch } = await res.json();
    expect(found).toBe(true);
    expect(batch.producerName).toBe("Ruben Kalang");
    expect(batch.gradeLabel).toBe("A1");
    expect(batch.variety).toBe("Adan Halus");
    expect(batch.farmElevationM).toBeGreaterThanOrEqual(1100);
  });

  test("returns the full geotagged journey with computed margins", async ({
    request,
  }) => {
    const { batch } = await (await request.get("/api/batch/2026-11-001")).json();

    expect(batch.journey.map((s: { kind: string }) => s.kind)).toEqual([
      "farm",
      "collection",
      "audit",
      "distribution",
      "retail",
    ]);
    expect(batch.totalDistanceKm).toBeGreaterThan(1000);

    // Money stays in integer sen; margins are derived, never stored.
    const priced = batch.journey.filter((s: { priceSen: number }) => s.priceSen > 0);
    expect(priced[0].priceSen).toBe(1550);
    expect(priced[priced.length - 1].priceSen).toBe(2150);
    for (let i = 1; i < priced.length; i++) {
      expect(priced[i].priceSen).toBeGreaterThan(priced[i - 1].priceSen);
    }
  });

  test("resolves by batch address, which is what a QR should carry", async ({
    request,
  }) => {
    const first = await (await request.get("/api/batch/2026-10-031")).json();
    const byAddress = await (
      await request.get(`/api/batch/${first.batch.batchPda}`)
    ).json();

    expect(byAddress.found).toBe(true);
    expect(byAddress.batch.batchCode).toBe("2026-10-031");
  });

  test("reports an unknown batch as not found, not as an error", async ({
    request,
  }) => {
    const res = await request.get("/api/batch/9999-99-999");
    expect(res.status()).toBe(404);

    const body = await res.json();
    expect(body.found).toBe(false);
    expect(body.reason).toMatch(/No certificate exists/);
  });

  test("does not claim a shelf price for a batch that never reached one", async ({
    request,
  }) => {
    const { batches } = await (await request.get("/api/batches")).json();

    const pending = batches.find(
      (b: { batchCode: string }) => b.batchCode === "2026-12-002"
    );
    expect(pending.grade).toBe("pending");
    expect(pending.retailPriceSen).toBeNull();

    const sold = batches.find(
      (b: { batchCode: string }) => b.batchCode === "2026-11-001"
    );
    expect(sold.retailPriceSen).toBe(2150);
  });

  test("coarsens every consumer scan to the privacy grid", async ({ request }) => {
    const { batch } = await (await request.get("/api/batch/2026-11-001")).json();

    expect(batch.scans.length).toBeGreaterThan(0);
    for (const scan of batch.scans) {
      // The program snaps to ~1km so a precise consumer location can never
      // reach a ledger that cannot forget it.
      expect(scan.lat % 10_000).toBe(0);
      expect(scan.lon % 10_000).toBe(0);
    }
  });

  test("lists every producer's batches", async ({ request }) => {
    const { batches } = await (await request.get("/api/batches")).json();
    expect(batches).toHaveLength(6);
    expect(
      new Set(batches.map((b: { producerName: string }) => b.producerName))
    ).toEqual(new Set(["Ruben Kalang", "Sina Rian", "Balang Radu"]));
  });
});
