import { expect, test } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const outputDir = join(process.cwd(), "artifacts", "visual-audit");
mkdirSync(outputDir, { recursive: true });

const customKinds = [
  "iceberg", "cycle", "sankey", "matrix", "swot", "impact", "eisenhower", "risk", "architecture", "hub",
  "tree", "venn", "table", "kpi", "chart-bar", "chart-column", "chart-line", "chart-donut", "chart-waterfall",
];
const orientations = ["landscape", "square", "portrait"];
const antvTemplates = [
  "sequence-steps-simple",
  "sequence-snake-steps-simple",
  "sequence-roadmap-vertical-simple",
  "sequence-color-snake-steps-horizontal-icon-line",
  "sequence-stairs-front-compact-card",
  "sequence-funnel-simple",
  "sequence-pyramid-simple",
  "sequence-timeline-simple",
  "sequence-horizontal-zigzag-underline-text",
  "sequence-horizontal-zigzag-horizontal-icon-line",
  "compare-binary-horizontal-simple-vs",
  "compare-binary-horizontal-badge-card-vs",
  "compare-binary-horizontal-compact-card-vs",
  "list-grid-simple",
  "list-grid-horizontal-icon-arrow",
  "list-row-horizontal-icon-line",
  "list-sector-simple",
  "list-grid-badge-card",
  "list-grid-compact-card",
  "list-pyramid-compact-card",
  "list-waterfall-compact-card",
];

function layoutForTemplate(template) {
  if (template.startsWith("compare-")) return "comparison";
  if (template.startsWith("list-")) return "list";
  if ([
    "sequence-roadmap-vertical-simple",
    "sequence-timeline-simple",
    "sequence-horizontal-zigzag-underline-text",
    "sequence-horizontal-zigzag-horizontal-icon-line",
  ].includes(template)) return "timeline";
  return "process";
}

function safeName(value) {
  return value.replace(/[^a-zA-Z0-9_-]+/g, "-");
}

async function waitForAudit(page) {
  await page.waitForFunction(() => (
    window.__VISUAL_AUDIT_READY__ === true &&
    document.querySelector("[data-visual-audit-root]")?.getAttribute("data-audit-ready") === "true"
  ), undefined, { timeout: 30_000 });
}

async function inspectRenderedVisual(page, mode) {
  return page.evaluate((auditMode) => {
    const root = document.querySelector("[data-visual-audit-root]");
    const issues = [];
    if (!root) return { issues: ["racine d'audit absente"], score: 0, layoutIssues: -1, textCount: 0 };
    const reportedError = root.getAttribute("data-audit-error");
    if (reportedError) issues.push(`erreur de rendu: ${reportedError}`);
    const svg = root.querySelector("svg");
    if (!svg) return { issues: [...issues, "SVG absent"], score: 0, layoutIssues: -1, textCount: 0 };

    const svgRect = svg.getBoundingClientRect();
    if (svgRect.width < 200 || svgRect.height < 200) issues.push("surface SVG trop petite");
    const textNodes = [...svg.querySelectorAll("text")].filter((node) => {
      const rect = node.getBoundingClientRect();
      const style = getComputedStyle(node);
      return rect.width > 2 && rect.height > 2 && style.visibility !== "hidden" && style.display !== "none";
    });

    const textRects = textNodes.map((node) => ({ node, rect: node.getBoundingClientRect() }));
    for (const { node, rect } of textRects) {
      const tolerance = 8;
      if (
        rect.left < svgRect.left - tolerance || rect.right > svgRect.right + tolerance ||
        rect.top < svgRect.top - tolerance || rect.bottom > svgRect.bottom + tolerance
      ) {
        issues.push(`texte hors canvas: ${node.textContent?.trim().slice(0, 48) ?? "?"}`);
      }
    }

    for (const group of [...svg.querySelectorAll("g[data-box-id]")]) {
      const rectNode = group.querySelector(":scope > rect");
      const texts = [...group.querySelectorAll("text")].filter((node) => node.getBoundingClientRect().width > 2);
      if (rectNode) {
        const cardRect = rectNode.getBoundingClientRect();
        for (const node of texts) {
          const rect = node.getBoundingClientRect();
          const tolerance = 5;
          if (
            rect.left < cardRect.left - tolerance || rect.right > cardRect.right + tolerance ||
            rect.top < cardRect.top - tolerance || rect.bottom > cardRect.bottom + tolerance
          ) {
            issues.push(`texte déborde de ${group.getAttribute("data-box-id")}: ${node.textContent?.trim().slice(0, 42) ?? "?"}`);
          }
        }
      }
      for (let i = 0; i < texts.length; i += 1) {
        for (let j = i + 1; j < texts.length; j += 1) {
          const a = texts[i].getBoundingClientRect();
          const b = texts[j].getBoundingClientRect();
          const overlapX = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left));
          const overlapY = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
          if (overlapX > 2 && overlapY > 2) {
            issues.push(`chevauchement texte dans ${group.getAttribute("data-box-id")}`);
          }
        }
      }
    }

    if (auditMode === "antv") {
      const rects = textRects.map(({ node, rect }) => ({ text: node.textContent?.trim() ?? "", rect }));
      for (let i = 0; i < rects.length; i += 1) {
        for (let j = i + 1; j < rects.length; j += 1) {
          const a = rects[i];
          const b = rects[j];
          const overlapX = Math.max(0, Math.min(a.rect.right, b.rect.right) - Math.max(a.rect.left, b.rect.left));
          const overlapY = Math.max(0, Math.min(a.rect.bottom, b.rect.bottom) - Math.max(a.rect.top, b.rect.top));
          const overlapArea = overlapX * overlapY;
          const minArea = Math.max(1, Math.min(a.rect.width * a.rect.height, b.rect.width * b.rect.height));
          if (overlapArea / minArea > 0.55) {
            issues.push(`chevauchement AntV: ${a.text.slice(0, 28)} / ${b.text.slice(0, 28)}`);
          }
        }
      }
    }

    const layoutIssues = Number(svg.getAttribute("data-layout-issues") ?? (auditMode === "custom" ? "-1" : "0"));
    const score = Number(svg.getAttribute("data-structure-score") ?? (auditMode === "custom" ? "0" : "10"));
    return { issues, score, layoutIssues, textCount: textNodes.length };
  }, mode);
}

test("audit navigateur de tous les rendus custom", async ({ page }) => {
  const failures = [];
  let browserErrors = [];
  page.on("console", (message) => {
    if (message.type() === "error") browserErrors.push(`console: ${message.text()}`);
  });
  page.on("pageerror", (error) => browserErrors.push(`page: ${error.message}`));

  const cases = [
    ...customKinds.flatMap((kind) => orientations.map((orientation) => ({ kind, orientation, style: "clean" }))),
    ...customKinds.map((kind) => ({ kind, orientation: "landscape", style: "dark" })),
  ];

  for (const entry of cases) {
    browserErrors = [];
    const query = new URLSearchParams({
      "visual-audit": "1",
      mode: "custom",
      kind: entry.kind,
      orientation: entry.orientation,
      style: entry.style,
    });
    await page.goto(`/?${query.toString()}`, { waitUntil: "networkidle" });
    await waitForAudit(page);
    const report = await inspectRenderedVisual(page, "custom");
    const name = `custom-${safeName(entry.kind)}-${entry.orientation}-${entry.style}`;
    await page.locator("[data-visual-audit-root]").screenshot({ path: join(outputDir, `${name}.png`) });
    const caseIssues = [...browserErrors, ...report.issues];
    if (report.layoutIssues !== 0) caseIssues.push(`layout issues=${report.layoutIssues}`);
    if (report.score < 9) caseIssues.push(`score structurel=${report.score}`);
    if (report.textCount < 2) caseIssues.push("contenu texte insuffisant");
    if (caseIssues.length) failures.push(`${name}: ${caseIssues.join(" | ")}`);
  }

  expect(failures, failures.join("\n")).toEqual([]);
});

test("audit navigateur de tous les gabarits AntV exposés", async ({ page }) => {
  const failures = [];
  let browserErrors = [];
  page.on("console", (message) => {
    if (message.type() === "error") browserErrors.push(`console: ${message.text()}`);
  });
  page.on("pageerror", (error) => browserErrors.push(`page: ${error.message}`));

  for (const template of antvTemplates) {
    for (const style of ["clean", "dark"]) {
      browserErrors = [];
      const query = new URLSearchParams({
        "visual-audit": "1",
        mode: "antv",
        template,
        layout: layoutForTemplate(template),
        style,
      });
      await page.goto(`/?${query.toString()}`, { waitUntil: "networkidle" });
      await waitForAudit(page);
      const report = await inspectRenderedVisual(page, "antv");
      const name = `antv-${safeName(template)}-${style}`;
      await page.locator("[data-visual-audit-root]").screenshot({ path: join(outputDir, `${name}.png`) });
      const caseIssues = [...browserErrors, ...report.issues];
      if (report.textCount < 2) caseIssues.push("contenu texte insuffisant");
      if (caseIssues.length) failures.push(`${name}: ${caseIssues.join(" | ")}`);
    }
  }

  expect(failures, failures.join("\n")).toEqual([]);
});
