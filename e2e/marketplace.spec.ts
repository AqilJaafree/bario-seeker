import { expect, test } from "@playwright/test";

/**
 * The marketplace, read from the chain.
 *
 * Both pages are Server Components keyed by the Producer PDA, so a certificate
 * can link straight back to the farmer who grew the batch.
 */

test.describe("producer listing", () => {
  test("lists every registered producer in the server HTML", async ({ request }) => {
    const html = await (await request.get("/marketplace")).text();
    const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");

    expect(text).toContain("3 registered producers");
    for (const name of ["Ruben Kalang", "Sina Rian", "Balang Radu"]) {
      expect(text, `missing producer: ${name}`).toContain(name);
    }
  });

  test("describes each farm from ledger facts, not invented prose", async ({ page }) => {
    await page.goto("/marketplace");
    await expect(page.getByText(/Farming at 1130 m in the Kelabit Highlands/)).toBeVisible();
    await expect(page.getByText(/2 harvests certified since/).first()).toBeVisible();
  });

  test("shows a farmgate price when a harvest never reached a shelf", async ({ page }) => {
    await page.goto("/marketplace");
    // Balang Radu's most recent batch is unaudited and has no Retail stop, so
    // advertising a shelf price for it would be a claim the ledger cannot back.
    await expect(page.getByText("Farmgate price")).toBeVisible();
    await expect(page.getByText("Shelf price").first()).toBeVisible();
    await expect(page.getByText("Ungraded").first()).toBeVisible();
  });

  test("filters by the grade of the latest harvest", async ({ page }) => {
    await page.goto("/marketplace");
    await page.getByRole("button", { name: "Grade A1" }).click();
    await expect(page.getByText("Ruben Kalang")).toBeVisible();
    await expect(page.getByText("Balang Radu")).toHaveCount(0);

    await page.getByRole("button", { name: "Ungraded" }).click();
    await expect(page.getByText("Balang Radu")).toBeVisible();
    await expect(page.getByText("Ruben Kalang")).toHaveCount(0);
  });

  test("searches by name", async ({ page }) => {
    await page.goto("/marketplace");
    await page.getByPlaceholder(/Search by name or village/).fill("sina");
    await expect(page.getByText("Sina Rian")).toBeVisible();
    await expect(page.getByText("Ruben Kalang")).toHaveCount(0);
  });
});

test.describe("producer detail", () => {
  const openRuben = async (page: import("@playwright/test").Page) => {
    await page.goto("/marketplace");
    await page.getByText("Ruben Kalang").click();
    await expect(
      page.getByRole("heading", { name: "Ruben Kalang", level: 1 })
    ).toBeVisible();
  };

  test("is reachable from a card and keyed by the producer PDA", async ({ page }) => {
    await openRuben(page);
    expect(page.url()).toMatch(/\/marketplace\/[1-9A-HJ-NP-Za-km-z]{32,44}$/);
  });

  test("lists every harvest with its on-chain grade", async ({ page }) => {
    await openRuben(page);
    await expect(page.getByRole("button", { name: /2026-11-001/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /2026-10-014/ })).toBeVisible();
    await expect(page.getByText("Adan Halus")).toBeVisible();
  });

  test("links each harvest to its certificate", async ({ page }) => {
    await openRuben(page);
    await page.getByRole("link", { name: /View the certificate for 2026-11-001/ }).click();
    await expect(page.getByText("Verified Authentic")).toBeVisible();
  });

  test("shows the farm coordinates and the Producer SBT", async ({ page }) => {
    await openRuben(page);
    await expect(page.getByText("3.7460, 115.4530")).toBeVisible();
    await expect(page.getByRole("link", { name: /^3EGtGP/ })).toHaveAttribute(
      "href",
      /cluster=devnet/
    );
  });

  test("does not claim a portrait or a biography it does not have", async ({ page }) => {
    await openRuben(page);
    await expect(
      page.getByText(/ledger does not hold producer portraits/)
    ).toBeVisible();
    await expect(page.getByText(/Producer SBT since 20/)).toBeVisible();
  });

  test("shows ratings without inventing review text", async ({ page }) => {
    await openRuben(page);
    await expect(
      page.getByText(/Review text is stored off-chain and is not shown here/)
    ).toBeVisible();
  });

  test("is explicit that it cannot take an order", async ({ page }) => {
    await openRuben(page);
    await page.getByRole("button", { name: /Request RM/ }).click();
    await expect(
      page.getByText(/does not process payments — this is not an order/)
    ).toBeVisible();
  });

  test("a certificate links back to the producer who grew it", async ({ page }) => {
    await page.goto("/verify/2026-11-001");
    await page.getByRole("link", { name: /Back to Ruben Kalang/ }).click();
    await expect(
      page.getByRole("heading", { name: "Ruben Kalang", level: 1 })
    ).toBeVisible();
  });
});
