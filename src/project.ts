import type {
  CanonicalInfographic,
  InfographicKind,
  InfographicProject,
  InfographicStyle,
} from "./types";
import { validateInfographicProject } from "./validation";

export const MAX_PROJECT_FILE_BYTES = 512 * 1024;

export function createInfographicProject(input: {
  sourceText: string;
  type: InfographicKind;
  style: InfographicStyle;
  variantIndex: number;
  infographic: CanonicalInfographic;
}): InfographicProject {
  return {
    format: "infographic-lab",
    version: 2,
    savedAt: new Date().toISOString(),
    sourceText: input.sourceText,
    type: input.type,
    style: input.style,
    variantIndex: input.variantIndex,
    infographic: input.infographic,
  };
}

export function projectStateFingerprint(input: {
  sourceText: string;
  type: InfographicKind;
  style: InfographicStyle;
  variantIndex: number;
  infographic: CanonicalInfographic;
}) {
  return JSON.stringify({
    sourceText: input.sourceText,
    type: input.type,
    style: input.style,
    variantIndex: input.variantIndex,
    infographic: input.infographic,
  });
}

export function parseInfographicProject(text: string): InfographicProject {
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch {
    throw new Error("Projet JSON invalide : JSON illisible.");
  }
  return validateInfographicProject(value);
}

export function safeFilenameBase(title: string) {
  const value = title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
  return value || "infographic-lab";
}

export function projectFileName(title: string) {
  return `${safeFilenameBase(title)}.infographic.json`;
}

export function htmlFileName(title: string) {
  return `${safeFilenameBase(title)}.html`;
}

export function downloadHref(href: string, filename: string) {
  const link = document.createElement("a");
  link.href = href;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export function downloadBlob(content: BlobPart, type: string, filename: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  downloadHref(url, filename);
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

export function svgElementToDataUrl(svg: SVGSVGElement) {
  const clone = svg.cloneNode(true) as SVGSVGElement;
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  const viewBox = clone.viewBox.baseVal;
  if (!clone.getAttribute("width") && viewBox.width > 0) clone.setAttribute("width", String(viewBox.width));
  if (!clone.getAttribute("height") && viewBox.height > 0) clone.setAttribute("height", String(viewBox.height));
  const source = new XMLSerializer().serializeToString(clone);
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(source)}`;
}

export function svgDataUrlToPng(svgDataUrl: string, dpr = 2): Promise<string> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      try {
        const width = image.naturalWidth || image.width || 1120;
        const height = image.naturalHeight || image.height || 680;
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(width * dpr));
        canvas.height = Math.max(1, Math.round(height * dpr));
        const context = canvas.getContext("2d");
        if (!context) throw new Error("Canvas indisponible.");
        context.scale(dpr, dpr);
        context.drawImage(image, 0, 0, width, height);
        resolve(canvas.toDataURL("image/png"));
      } catch (error) {
        reject(error);
      }
    };
    image.onerror = () => reject(new Error("Impossible de convertir le SVG en PNG."));
    image.src = svgDataUrl;
  });
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const pageBackgrounds: Record<InfographicStyle, string> = {
  clean: "#eef2f5",
  soft: "#ece9e2",
  dark: "#0b1020",
  sketch: "#f3efe6",
  chalk: "#171d1b",
  zen: "#ece9e2",
  pro: "#eef2f7",
  minimal: "#f5f5f5",
  tech: "#020617",
};

export function buildStandaloneHtml(input: {
  svgDataUrl: string;
  title: string;
  subtitle?: string;
  style: InfographicStyle;
}) {
  const title = escapeHtml(input.title);
  const description = escapeHtml(input.subtitle?.trim() || input.title);
  const svgDataUrl = escapeHtml(input.svgDataUrl);
  const background = pageBackgrounds[input.style] ?? "#ece9e2";

  return `<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src data:; style-src 'unsafe-inline';">
  <meta name="description" content="${description}">
  <title>${title}</title>
  <style>
    html, body { margin: 0; min-height: 100%; background: ${background}; }
    body { min-height: 100vh; display: grid; place-items: center; padding: 24px; box-sizing: border-box; }
    main { width: min(1600px, 100%); }
    img { display: block; width: 100%; height: auto; }
  </style>
</head>
<body>
  <main>
    <img src="${svgDataUrl}" alt="${title}">
  </main>
</body>
</html>`;
}
