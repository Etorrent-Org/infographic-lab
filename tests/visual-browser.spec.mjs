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

function expectedAntvLabels(template) {
  const layout = layoutForTemplate(template);
  const count = layout === "comparison" ? 2 : template === "list-pyramid-compact-card" ? 3 : 4;
  const prefix = layout === "timeline" ? "Jalon" : "Axe";
  return Array.from({ length: count }, (_, index) => `${prefix} ${index + 1}`);
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
    if (!root) return { issues: ["racine d'audit absente"], score: 0, layoutIssues: -1, textCount: 0, renderedCount: 0 };
    const reportedError = root.getAttribute("data-audit-error");
    if (reportedError) issues.push(`erreur de rendu: ${reportedError}`);

    const svg = root.querySelector("svg");
    const antvContainer = root.querySelector("[data-antv-audit-canvas]");
    if (auditMode === "custom" && !svg) return { issues: [...issues, "SVG absent"], score: 0, layoutIssues: -1, textCount: 0, renderedCount: 0 };
    if (auditMode === "antv" && !antvContainer) return { issues: [...issues, "conteneur AntV absent"], score: 0, layoutIssues: 0, textCount: 0, renderedCount: 0 };

    const surface = auditMode === "custom" ? svg : antvContainer;
    const surfaceRect = surface?.getBoundingClientRect();
    if (!surfaceRect || surfaceRect.width < 200 || surfaceRect.height < 200) issues.push("surface de rendu trop petite");

    const textNodes = svg
      ? [...svg.querySelectorAll("text")].filter((node) => {
          const rect = node.getBoundingClientRect();
          const style = getComputedStyle(node);
          return rect.width > 2 && rect.height > 2 && style.visibility !== "hidden" && style.display !== "none";
        })
      : [];
    const textRects = textNodes.map((node) => ({ node, rect: node.getBoundingClientRect() }));

    if (svg) {
      const svgRect = svg.getBoundingClientRect();
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
        const groupRect = group.getBoundingClientRect();
        const rectNodes = [...group.querySelectorAll(":scope > rect")];
        const cardRectNode = rectNodes.find((rectNode) => {
          const rect = rectNode.getBoundingClientRect();
          return rect.width >= groupRect.width * 0.72 && rect.height >= groupRect.height * 0.64;
        });
        const texts = [...group.querySelectorAll("text")].filter((node) => node.getBoundingClientRect().width > 2);
        if (cardRectNode) {
          const cardRect = cardRectNode.getBoundingClientRect();
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
            if (overlapX > 2 && overlapY > 2) issues.push(`chevauchement texte dans ${group.getAttribute("data-box-id")}`);
          }
        }
      }
    }

    const renderedCount = auditMode === "antv" && antvContainer
      ? antvContainer.querySelectorAll("svg, canvas, path, rect, circle, line, polyline, polygon, foreignObject, image").length
      : svg?.querySelectorAll("path, rect, circle, line, polyline, polygon, text").length ?? 0;
    const layoutIssues = Number(svg?.getAttribute("data-layout-issues") ?? (auditMode === "custom" ? "-1" : "0"));
    const score = Number(svg?.getAttribute("data-structure-score") ?? (auditMode === "custom" ? "0" : "10"));
    return { issues, score, layoutIssues, textCount: textNodes.length, renderedCount };
  }, mode);
}

async function inspectAntvSemantics(page, expectedLabels) {
  return page.evaluate((labels) => {
    const issues = [];
    const container = document.querySelector("[data-antv-audit-canvas]");
    const svg = container?.querySelector("svg");
    if (!svg) return { issues: ["SVG AntV absent pour le contrôle sémantique"] };

    const text = (svg.textContent ?? "").replace(/\s+/g, " ");
    for (const label of labels) {
      if (!text.includes(label)) issues.push(`élément source absent du rendu: ${label}`);
    }

    const visible = (node) => {
      const rect = node.getBoundingClientRect();
      const style = getComputedStyle(node);
      return rect.width > 2 && rect.height > 2 && style.display !== "none" && style.visibility !== "hidden";
    };
    const overlap = (a, b) => {
      const ra = a.getBoundingClientRect();
      const rb = b.getBoundingClientRect();
      const x = Math.max(0, Math.min(ra.right, rb.right) - Math.max(ra.left, rb.left));
      const y = Math.max(0, Math.min(ra.bottom, rb.bottom) - Math.max(ra.top, rb.top));
      return x > 2 && y > 2;
    };

    const title = svg.querySelector('[data-element-type="title"]');
    if (title && visible(title)) {
      const candidates = [...svg.querySelectorAll(
        '[data-element-type="desc"], [data-element-type="item-label"], [data-element-type="item-desc"], [data-element-type="item-value"]'
      )].filter((node) => node !== title && visible(node));
      for (const node of candidates) {
        if (overlap(title, node)) {
          issues.push(`titre AntV chevauche ${node.getAttribute("data-element-type") ?? "un texte"}: ${(node.textContent ?? "").trim().slice(0, 36)}`);
          break;
        }
      }
    }

    const desc = svg.querySelector('[data-element-type="desc"]');
    if (title && desc && visible(title) && visible(desc) && overlap(title, desc)) {
      issues.push("titre et sous-titre AntV se chevauchent");
    }
    return { issues };
  }, expectedLabels);
}

async function inspectExports(page) {
  return page.evaluate(async () => {
    const issues = [];
    const exporter = window.__VISUAL_AUDIT_EXPORT__;
    if (typeof exporter !== "function") return { issues: ["exporteur visuel absent"], svgLength: 0, pngLength: 0 };
    try {
      const output = await exporter();
      if (!output?.svg?.startsWith("data:image/svg+xml")) issues.push("export SVG non conforme");
      if (!output?.png?.startsWith("data:image/png")) issues.push("export PNG non conforme");
      return { issues, svgLength: output?.svg?.length ?? 0, pngLength: output?.png?.length ?? 0 };
    } catch (error) {
      return { issues: [`export impossible: ${error instanceof Error ? error.message : String(error)}`], svgLength: 0, pngLength: 0 };
    }
  });
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
    const exportReport = await inspectExports(page);
    const name = `custom-${safeName(entry.kind)}-${entry.orientation}-${entry.style}`;
    await page.locator("[data-visual-audit-root]").screenshot({ path: join(outputDir, `${name}.png`) });
    const caseIssues = [...browserErrors, ...report.issues, ...exportReport.issues];
    if (report.layoutIssues !== 0) caseIssues.push(`layout issues=${report.layoutIssues}`);
    if (report.score < 9) caseIssues.push(`score structurel=${report.score}`);
    if (report.textCount < 2) caseIssues.push("contenu texte insuffisant");
    if (report.renderedCount < 8) caseIssues.push("rendu SVG insuffisamment matérialisé");
    if (exportReport.svgLength < 500) caseIssues.push(`SVG exporté trop court (${exportReport.svgLength})`);
    if (exportReport.pngLength < 1000) caseIssues.push(`PNG exporté trop court (${exportReport.pngLength})`);
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
      const layout = layoutForTemplate(template);
      const query = new URLSearchParams({
        "visual-audit": "1",
        mode: "antv",
        template,
        layout,
        style,
      });
      await page.goto(`/?${query.toString()}`, { waitUntil: "networkidle" });
      await waitForAudit(page);
      const report = await inspectRenderedVisual(page, "antv");
      const semanticReport = await inspectAntvSemantics(page, expectedAntvLabels(template));
      const exportReport = await inspectExports(page);
      const name = `antv-${safeName(template)}-${style}`;
      await page.locator("[data-visual-audit-root]").screenshot({ path: join(outputDir, `${name}.png`) });
      const caseIssues = [...browserErrors, ...report.issues, ...semanticReport.issues, ...exportReport.issues];
      if (report.renderedCount < 5) caseIssues.push(`rendu AntV insuffisant (${report.renderedCount} éléments graphiques)`);
      if (exportReport.svgLength < 500) caseIssues.push(`SVG exporté trop court (${exportReport.svgLength})`);
      if (exportReport.pngLength < 1000) caseIssues.push(`PNG exporté trop court (${exportReport.pngLength})`);
      if (caseIssues.length) failures.push(`${name}: ${caseIssues.join(" | ")}`);
    }
  }

  expect(failures, failures.join("\n")).toEqual([]);
});
