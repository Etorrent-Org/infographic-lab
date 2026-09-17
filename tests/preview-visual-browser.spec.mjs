import { expect, test } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const outputDir = join(process.cwd(), "artifacts", "visual-audit");
mkdirSync(outputDir, { recursive: true });

const chartFixture = {
  title: "Évolution du chiffre d’affaires 2026",
  subtitle: "Présentation de l’évolution de l’activité en 2026",
  layout: "list",
  items: [
    { title: "T1", description: "Chiffre d’affaires observé au premier trimestre.", value: 240, unit: "k€", category: "T1", blockType: "list", claimType: "fact" },
    { title: "T2", description: "Chiffre d’affaires observé au deuxième trimestre.", value: 280, unit: "k€", category: "T2", blockType: "list", claimType: "fact" },
    { title: "T3", description: "Chiffre d’affaires observé au troisième trimestre.", value: 310, unit: "k€", category: "T3", blockType: "list", claimType: "fact" },
    { title: "T4", description: "Chiffre d’affaires observé au quatrième trimestre.", value: 370, unit: "k€", category: "T4", blockType: "list", claimType: "fact" },
  ],
};

test("la preview chart reste compacte et s’ouvre en modal grand format", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("infographic-lab-generation-preferences-v1", JSON.stringify({
      orientation: "landscape",
      detail: "balanced",
      wording: "close",
      visual: "line",
    }));
  });

  await page.route("**/api/providers", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        providers: [
          { id: "vibe", label: "Vibe", configured: true, available: true },
          { id: "codex", label: "Codex", configured: true, available: true },
        ],
      }),
    });
  });

  await page.route("**/api/generate", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ data: chartFixture, provider: "test", durationMs: 120 }),
    });
  });

  await page.goto("/", { waitUntil: "networkidle" });
  await page.getByPlaceholder("Collez votre texte, vos notes ou votre raisonnement…").fill(
    "T1 240 k€, T2 280 k€, T3 310 k€, T4 370 k€. Montrer l’évolution du chiffre d’affaires 2026.",
  );
  await page.getByRole("button", { name: "Construire le modèle" }).click();

  const preview = page.locator(".studio-infographic-canvas");
  const svg = preview.locator("svg").first();
  await expect(svg).toBeVisible();
  await expect(page.locator(".studio-variant-control span")).toContainText("Courbe");

  const geometry = await page.evaluate(() => {
    const canvas = document.querySelector(".studio-infographic-canvas");
    const visual = canvas?.querySelector("svg");
    if (!(canvas instanceof HTMLElement) || !(visual instanceof SVGSVGElement)) return null;
    const frame = canvas.getBoundingClientRect();
    const content = visual.getBoundingClientRect();
    return {
      frame: { left: frame.left, top: frame.top, right: frame.right, bottom: frame.bottom, height: frame.height },
      content: { left: content.left, top: content.top, right: content.right, bottom: content.bottom },
      overflow: getComputedStyle(canvas).overflow,
    };
  });

  expect(geometry).not.toBeNull();
  expect(geometry.frame.height).toBeLessThanOrEqual(432);
  expect(geometry.frame.height).toBeGreaterThanOrEqual(298);
  expect(geometry.overflow).toBe("hidden");
  expect(geometry.content.left).toBeGreaterThanOrEqual(geometry.frame.left - 2);
  expect(geometry.content.top).toBeGreaterThanOrEqual(geometry.frame.top - 2);
  expect(geometry.content.right).toBeLessThanOrEqual(geometry.frame.right + 2);
  expect(geometry.content.bottom).toBeLessThanOrEqual(geometry.frame.bottom + 2);

  await page.locator(".studio-visual-frame").screenshot({ path: join(outputDir, "ui-compact-preview-chart.png") });

  const expand = page.getByRole("button", { name: "Agrandir l’aperçu de l’infographie" });
  await expect(expand).toBeVisible();
  await expect(expand).toBeEnabled();
  await expand.click();

  const dialog = page.getByRole("dialog", { name: "Évolution du chiffre d’affaires 2026" });
  await expect(dialog).toBeVisible();
  const modalImage = dialog.locator("img");
  await expect(modalImage).toBeVisible();
  await expect.poll(async () => modalImage.evaluate((image) => image.complete && image.naturalWidth > 0 && image.naturalHeight > 0)).toBe(true);

  const modalGeometry = await modalImage.evaluate((image) => {
    const rect = image.getBoundingClientRect();
    const parent = image.parentElement?.getBoundingClientRect();
    return parent ? {
      image: { left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom },
      parent: { left: parent.left, top: parent.top, right: parent.right, bottom: parent.bottom },
    } : null;
  });
  expect(modalGeometry).not.toBeNull();
  expect(modalGeometry.image.left).toBeGreaterThanOrEqual(modalGeometry.parent.left - 2);
  expect(modalGeometry.image.top).toBeGreaterThanOrEqual(modalGeometry.parent.top - 2);
  expect(modalGeometry.image.right).toBeLessThanOrEqual(modalGeometry.parent.right + 2);
  expect(modalGeometry.image.bottom).toBeLessThanOrEqual(modalGeometry.parent.bottom + 2);

  await page.locator(".studio-preview-modal").screenshot({ path: join(outputDir, "ui-expanded-preview-chart.png") });

  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(expand).toBeFocused();
});
