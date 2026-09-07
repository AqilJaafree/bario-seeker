import { expect, test, type Page } from "@playwright/test";

/**
 * Every assertion here runs against the program deployed on devnet. Values like
 * "Ruben Kalang" and "RM21.50" are what the seeded chain actually holds, so a
 * failure means either the UI broke or the chain data moved — both worth knowing.
 */

const SEEDED = {
  audited: "2026-11-001",
  pending: "2026-12-002",
  lowGrade: "2026-11-007",
  missing: "9999-99-999",
};

/**
 * The dialog, not the page. Strings like "Grade A1" and "Bario" also appear in
 * the landing page's price-deconstruction section, so every assertion about
 * certificate content has to be scoped or it passes for the wrong reason.
 */
const modal = (page: Page) => page.getByRole("dialog");

/** Type a batch id into the hero search box and submit. */
async function verifyBatch(page: Page, batchId: string) {
  const input = page.getByPlaceholder(/Enter bag serial or batch/i);
  await input.fill(batchId);
  await input.press("Enter");
  await expect(modal(page)).toBeVisible();
  // Wait out the RPC round trip so assertions do not race the loading state.
  await expect(modal(page).getByText(/Reading the certificate/)).toHaveCount(0);
}

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test.describe("landing page", () => {
  test("renders without console errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
    page.on("pageerror", (e) => errors.push(e.message));

    await page.goto("/");
    await expect(page.locator("h1")).toBeVisible();
    await page.waitForTimeout(1500);

    expect(errors, `console errors: ${errors.join(" | ")}`).toHaveLength(0);
  });

  test("opens the verification modal from the header button", async ({ page }) => {
    await page.getByRole("button", { name: /Verify Batch QR/i }).first().click();
    await expect(modal(page)).toBeVisible();
  });
});

test.describe("verified batch", () => {
  test.beforeEach(async ({ page }) => verifyBatch(page, SEEDED.audited));

  test("shows the Verified Authentic state", async ({ page }) => {
    await expect(modal(page).getByText("Verified Authentic Bario Rice")).toBeVisible();
    await expect(modal(page).getByText(/Registered, awaiting audit/)).toHaveCount(0);
    await expect(modal(page).getByText(/Not verified/)).toHaveCount(0);
  });

  test("shows the real producer, read from chain", async ({ page }) => {
    await expect(
      modal(page).getByRole("heading", { name: "Ruben Kalang" })
    ).toBeVisible();

    // The farm checkpoint's on-chain label is "<name>, Bario". Naming the farm
    // that way inside the journey is fine, but repeating it directly under the
    // producer's own name reads as a stutter, so the header shows the region.
    await expect(modal(page).getByText("Bario Highlands, Sarawak")).toBeVisible();

    // Elevation is enforced on-chain to be >= 1100 m for a Bario farm.
    await expect(modal(page).getByText(/1130 m elevation/)).toBeVisible();
  });

  test("shows the audited grade and the auditor that recorded it", async ({ page }) => {
    await expect(modal(page).getByText("Grade A1")).toBeVisible();
    await expect(modal(page).getByText(/Auditor: Sarawak Rice Laboratory, Miri/)).toBeVisible();
  });

  test("renders the full price journey with computed margins", async ({ page }) => {
    await expect(modal(page).getByText("Farm-to-Shelf Price Journey")).toBeVisible();

    // All five seeded stops, labelled in plain language not enum variants.
    for (const stop of ["Farm", "Collection point", "Laboratory", "Distributor", "Store"]) {
      await expect(modal(page).getByText(stop, { exact: true })).toBeVisible();
    }

    // Real prices in integer sen, formatted at the boundary.
    await expect(modal(page).getByText("RM15.50/kg")).toBeVisible();
    await expect(modal(page).getByText("RM21.50/kg")).toBeVisible();

    // Margin is derived from the prices beside it, never stored.
    await expect(modal(page).getByText("+22.9% margin")).toBeVisible();
  });

  test("shows who recorded each stop", async ({ page }) => {
    await expect(modal(page).getByText(/Kuching Highland Trading/).first()).toBeVisible();
    await expect(modal(page).getByText(/Klang Valley Grocers/)).toBeVisible();
  });

  test("shows distance travelled from the farm", async ({ page }) => {
    await expect(modal(page).getByText(/1,526 km travelled/)).toBeVisible();
  });

  test("shows the quantity-weighted rating", async ({ page }) => {
    await expect(modal(page).getByText("4.7")).toBeVisible();
    await expect(modal(page).getByText("(3)")).toBeVisible();
  });

  test("links both SBTs to the devnet explorer", async ({ page }) => {
    const producerLink = modal(page).getByRole("link", { name: /Producer SBT/ });
    await expect(producerLink).toHaveAttribute(
      "href",
      /explorer\.solana\.com\/address\/[1-9A-HJ-NP-Za-km-z]{32,44}\?cluster=devnet/
    );

    const verifyLink = modal(page).getByRole("link", { name: /Verify/ });
    await expect(verifyLink).toHaveAttribute("href", /cluster=devnet/);
  });

  test("does not invent lab figures the chain cannot vouch for", async ({ page }) => {
    // Grain integrity and moisture live in the IPFS audit report. The old mock
    // printed 3.2% and 11.4%; printing them here would imply the ledger holds
    // them.
    await expect(modal(page).getByText(/Broken Grain/i)).toHaveCount(0);
    await expect(modal(page).getByText(/Moisture/i)).toHaveCount(0);
    await expect(modal(page).getByText("3.2%")).toHaveCount(0);
    await expect(modal(page).getByText("11.4%")).toHaveCount(0);
  });
});

test.describe("unaudited batch", () => {
  test("renders an honest awaiting-audit state, not a grade", async ({ page }) => {
    await verifyBatch(page, SEEDED.pending);

    await expect(modal(page).getByText("Registered, awaiting audit")).toBeVisible();
    await expect(modal(page).getByText("Ungraded")).toBeVisible();
    await expect(modal(page).getByText("Verified Authentic Bario Rice")).toHaveCount(0);
    await expect(
      modal(page).getByText(/No laboratory result recorded on-chain/)
    ).toBeVisible();
  });

  test("warns that the journey is incomplete rather than implying a shelf", async ({ page }) => {
    await verifyBatch(page, SEEDED.pending);
    await expect(
      modal(page).getByText(/has not been recorded all the way to a shelf/)
    ).toBeVisible();
    await expect(modal(page).getByText("Store", { exact: true })).toHaveCount(0);
  });
});

test.describe("unknown batch", () => {
  test("renders an unmistakable not-verified state", async ({ page }) => {
    await verifyBatch(page, SEEDED.missing);

    await expect(modal(page).getByText("Not verified")).toBeVisible();
    await expect(modal(page).getByText(/No Bario Seeker certificate exists/)).toBeVisible();
    await expect(modal(page).getByText("Verified Authentic Bario Rice")).toHaveCount(0);
    // The counterfeit case must not look like a loading state that gave up.
    await expect(modal(page).getByRole("button", { name: /Try again/ })).toBeVisible();
  });

  test("disables reporting when there is no batch to report against", async ({ page }) => {
    await verifyBatch(page, SEEDED.missing);
    await expect(modal(page).getByRole("button", { name: /Report Counterfeit/ })).toBeDisabled();
  });
});

test.describe("lower grades", () => {
  test("renders grade B without dressing it up", async ({ page }) => {
    await verifyBatch(page, SEEDED.lowGrade);
    await expect(modal(page).getByText("Grade B")).toBeVisible();
    await expect(modal(page).getByText("Verified Authentic Bario Rice")).toBeVisible();
    await expect(modal(page).getByText("RM18.50/kg")).toBeVisible();
  });
});

test.describe("interactions", () => {
  test("closes on the close button", async ({ page }) => {
    await verifyBatch(page, SEEDED.audited);
    await modal(page).getByRole("button", { name: "Close", exact: true }).click();
    await expect(modal(page)).toHaveCount(0);
  });

  test("share copies a link naming the batch and its grade", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await verifyBatch(page, SEEDED.audited);

    await modal(page).getByRole("button", { name: /Share/ }).click();
    await expect(modal(page).getByRole("button", { name: /Copied Link/ })).toBeVisible();

    const copied = await page.evaluate(() => navigator.clipboard.readText());
    expect(copied).toContain("2026-11-001");
    expect(copied).toContain("Grade A1");
    expect(copied).toContain("Ruben Kalang");
  });

  test("says plainly that on-chain reporting is not wired up yet", async ({ page }) => {
    await verifyBatch(page, SEEDED.audited);
    await modal(page).getByRole("button", { name: /Report Counterfeit/ }).click();
    await expect(modal(page).getByText(/not wired up yet/)).toBeVisible();
  });

  test("closes on Escape", async ({ page }) => {
    await verifyBatch(page, SEEDED.audited);
    await page.keyboard.press("Escape");
    await expect(modal(page)).toHaveCount(0);
  });

  test("closes when the backdrop is clicked", async ({ page }) => {
    await verifyBatch(page, SEEDED.audited);
    // Well outside the dialog, which is centred and capped at max-w-lg.
    await page.mouse.click(5, 5);
    await expect(modal(page)).toHaveCount(0);
  });

  test("exposes proper dialog semantics", async ({ page }) => {
    await verifyBatch(page, SEEDED.audited);
    const dialog = modal(page);
    await expect(dialog).toHaveAttribute("aria-modal", "true");
    await expect(dialog).toHaveAttribute("aria-labelledby", "batch-certificate-title");
  });

  test("re-fetches when a different batch is searched", async ({ page }) => {
    await verifyBatch(page, SEEDED.audited);
    await expect(modal(page).getByText("Grade A1")).toBeVisible();
    await modal(page).getByRole("button", { name: "Close", exact: true }).click();

    await verifyBatch(page, SEEDED.lowGrade);
    await expect(modal(page).getByText("Grade B")).toBeVisible();
    await expect(modal(page).getByText("Grade A1")).toHaveCount(0);
  });
});
