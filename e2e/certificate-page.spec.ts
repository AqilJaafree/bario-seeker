import { expect, test } from "@playwright/test";

/**
 * The /verify/[batchId] certificate page.
 *
 * This is the surface a QR code should resolve to, so it is a Server Component
 * reading the chain. The tests below assert that the verdict is present in the
 * server HTML — not merely that it appears once React hydrates — because a
 * shopper on 4G must see it before any JavaScript arrives.
 */

const SEEDED = {
  audited: "2026-11-001",
  pending: "2026-12-002",
  missing: "9999-99-999",
};

test.describe("certificate page", () => {
  test("renders the verdict in the server HTML, before any JavaScript", async ({
    request,
  }) => {
    const html = await (await request.get(`/verify/${SEEDED.audited}`)).text();
    const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");

    // Producer, grade, auditor, journey and proof all come from the chain.
    for (const probe of [
      "Verified Authentic",
      "Ruben Kalang",
      "Bario Highlands",
      "Adan Halus",
      "Sarawak Rice Laboratory",
      "Pavilion Kuala Lumpur",
      "1,526 km travelled",
      "non-transferable",
    ]) {
      expect(text, `missing from server HTML: ${probe}`).toContain(probe);
    }
  });

  test("shows the price journey with margins", async ({ page }) => {
    await page.goto(`/verify/${SEEDED.audited}`);
    await expect(page.getByText("Farm to shelf")).toBeVisible();
    await expect(page.getByText("RM15.50").first()).toBeVisible();
    await expect(page.getByText("RM21.50").first()).toBeVisible();
    await expect(page.getByText("+22.9%")).toBeVisible();
  });

  test("names who recorded each stop, and where", async ({ page }) => {
    await page.goto(`/verify/${SEEDED.audited}`);
    await expect(page.getByText(/Kuching Highland Trading/).first()).toBeVisible();
    await expect(page.getByText(/Klang Valley Grocers/)).toBeVisible();
    // Coordinates are shown so a claimed stop can be checked, not just read.
    await expect(page.getByText(/3\.7460, 115\.4530/)).toBeVisible();
  });

  test("does not print lab figures the chain cannot vouch for", async ({ page }) => {
    await page.goto(`/verify/${SEEDED.audited}`);
    await expect(
      page.getByText(/it does not hold the raw measurements/)
    ).toBeVisible();
    await expect(page.getByText(/Broken Grain/i)).toHaveCount(0);
    await expect(page.getByText("3.2%")).toHaveCount(0);
  });

  test("links the batch SBT to the right cluster", async ({ page }) => {
    await page.goto(`/verify/${SEEDED.audited}`);
    await expect(
      page.getByRole("link", { name: /View on Solana Explorer/ })
    ).toHaveAttribute("href", /explorer\.solana\.com\/address\/.+cluster=devnet/);
  });

  test("renders an honest awaiting-audit state", async ({ page }) => {
    await page.goto(`/verify/${SEEDED.pending}`);
    await expect(page.getByText("Registered, awaiting audit")).toBeVisible();
    await expect(page.getByText("Ungraded")).toBeVisible();
    await expect(page.getByText("Verified Authentic")).toHaveCount(0);
    await expect(
      page.getByText(/not been recorded all the way to a shelf/)
    ).toBeVisible();
  });

  test("renders an unmistakable not-verified state", async ({ page }) => {
    await page.goto(`/verify/${SEEDED.missing}`);
    await expect(page.getByText("Not verified")).toBeVisible();
    await expect(page.getByText(/Treat this bag as unverified/)).toBeVisible();
    await expect(page.getByText("Verified Authentic")).toHaveCount(0);
  });

  test("resolves by batch address, which is what a QR carries", async ({
    page,
    request,
  }) => {
    const res = await request.get("/api/batch/2026-10-031");
    const { batch } = await res.json();

    await page.goto(`/verify/${batch.batchPda}`);
    await expect(page.getByText("Verified Authentic")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Balang Radu" })
    ).toBeVisible();
  });

  test("is honest that rating and reporting are not wired up", async ({ page }) => {
    await page.goto(`/verify/${SEEDED.audited}`);

    await page.getByRole("button", { name: "Rate 4 stars" }).click();
    await expect(page.getByText(/not recorded on-chain yet/)).toBeVisible();

    await page.getByRole("button", { name: /Report Counterfeit/ }).click();
    await expect(page.getByText(/not wired up yet/)).toBeVisible();
  });

  test("carries a shareable title naming the producer and grade", async ({ page }) => {
    await page.goto(`/verify/${SEEDED.audited}`);
    await expect(page).toHaveTitle(/2026-11-001.*Ruben Kalang/);
  });
});
