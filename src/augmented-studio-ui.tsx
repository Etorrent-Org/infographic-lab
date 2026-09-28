import { Infographic } from "@antv/infographic";
import { useEffect, useMemo, useRef, useState } from "react";
import { buildAntvOptions, getAntvVariants } from "./antv";
import { CustomVisual } from "./CustomVisual";
import { svgDataUrlToPng, svgElementToDataUrl } from "./project";
import type {
  AIProvider,
  BrandProfile,
  CanonicalInfographic,
  InfographicItem,
  InfographicKind,
  InfographicStyle,
  ProviderStatus,
  RepresentationKind,
} from "./types";

export type ThemeMode = "light" | "dark";
export type InspectorPanel = "brief" | "structure" | "brand" | "quality";

export type VisualExporter = {
  getSvg: () => Promise<string>;
  getPng: () => Promise<string>;
};

export type RetouchHistory = {
  itemIndex: number;
  before: InfographicItem;
};

export const layoutOptions: { value: InfographicKind; label: string }[] = [
  { value: "auto", label: "Auto" },
  { value: "process", label: "Processus" },
  { value: "comparison", label: "Comparaison" },
  { value: "timeline", label: "Timeline" },
  { value: "list", label: "Liste" },
];

export const resultLayoutOptions: { value: CanonicalInfographic["layout"]; label: string }[] = [
  { value: "process", label: "Processus" },
  { value: "comparison", label: "Comparaison" },
  { value: "timeline", label: "Timeline" },
  { value: "list", label: "Liste" },
];

export const styleOptions: { value: InfographicStyle; label: string }[] = [
  { value: "clean", label: "Clean" },
  { value: "soft", label: "Soft" },
  { value: "dark", label: "Dark" },
  { value: "sketch", label: "Sketch" },
  { value: "chalk", label: "Chalk" },
];

export const viewOptions: { value: RepresentationKind; label: string; short: string }[] = [
  { value: "infographic", label: "Infographie", short: "VIS" },
  { value: "mermaid", label: "Diagramme", short: "MER" },
  { value: "mindmap", label: "Mindmap", short: "MAP" },
  { value: "markdown", label: "Document", short: "MD" },
];

export const panelOptions: { value: InspectorPanel; label: string; number: string }[] = [
  { value: "brief", label: "Brief", number: "01" },
  { value: "structure", label: "Structure", number: "02" },
  { value: "brand", label: "Identité", number: "03" },
  { value: "quality", label: "Qualité", number: "04" },
];

const fontStacks: Record<BrandProfile["fontFamily"], string> = {
  system: "Inter, ui-sans-serif, system-ui, sans-serif",
  serif: "Georgia, 'Times New Roman', serif",
  mono: "'SFMono-Regular', Consolas, 'Liberation Mono', monospace",
};

export function getInitialTheme(): ThemeMode {
  const stored = localStorage.getItem("infographic-lab-augmented-theme");
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function formatDate(value: string) {
  try {
    return new Intl.DateTimeFormat("fr-FR", { dateStyle: "short", timeStyle: "short" }).format(new Date(value));
  } catch {
    return value;
  }
}

function brandSvgDataUrl(dataUrl: string, brand: BrandProfile) {
  const comma = dataUrl.indexOf(",");
  if (comma < 0) return dataUrl;
  const header = dataUrl.slice(0, comma);
  const payload = dataUrl.slice(comma + 1);
  const source = header.includes(";base64")
    ? new TextDecoder().decode(Uint8Array.from(atob(payload), (char) => char.charCodeAt(0)))
    : decodeURIComponent(payload);
  const doc = new DOMParser().parseFromString(source, "image/svg+xml");
  const svg = doc.documentElement;
  if (svg.tagName.toLowerCase() !== "svg") return dataUrl;
  svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  svg.querySelectorAll("text").forEach((node) => node.setAttribute("font-family", fontStacks[brand.fontFamily]));

  const viewBox = svg.getAttribute("viewBox")?.split(/\s+/).map(Number) ?? [];
  const width = viewBox.length === 4 && Number.isFinite(viewBox[2]) ? viewBox[2] : Number(svg.getAttribute("width")) || 1120;
  const height = viewBox.length === 4 && Number.isFinite(viewBox[3]) ? viewBox[3] : Number(svg.getAttribute("height")) || 680;
  const namespace = "http://www.w3.org/2000/svg";

  if (brand.footer?.trim()) {
    const text = doc.createElementNS(namespace, "text");
    text.setAttribute("x", String(Math.max(20, width - 24)));
    text.setAttribute("y", String(Math.max(24, height - 18)));
    text.setAttribute("text-anchor", "end");
    text.setAttribute("font-size", "12");
    text.setAttribute("font-family", fontStacks[brand.fontFamily]);
    text.setAttribute("fill", brand.primary);
    text.setAttribute("opacity", "0.72");
    text.textContent = brand.footer.trim();
    svg.appendChild(text);
  }

  if (brand.logoDataUrl) {
    const image = doc.createElementNS(namespace, "image");
    image.setAttribute("href", brand.logoDataUrl);
    image.setAttribute("x", "20");
    image.setAttribute("y", String(Math.max(12, height - 52)));
    image.setAttribute("width", "96");
    image.setAttribute("height", "36");
    image.setAttribute("preserveAspectRatio", "xMinYMid meet");
    svg.appendChild(image);
  }

  const serialized = new XMLSerializer().serializeToString(svg);
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(serialized)}`;
}

export function InfographicPreview({
  data,
  style,
  brand,
  variantIndex,
  onVariantIndexChange,
  onExporter,
}: {
  data: CanonicalInfographic;
  style: InfographicStyle;
  brand: BrandProfile;
  variantIndex: number;
  onVariantIndexChange: (value: number) => void;
  onExporter: (exporter: VisualExporter | null) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const customRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<Infographic | null>(null);
  const [renderError, setRenderError] = useState<string | null>(null);
  const variants = useMemo(() => getAntvVariants(data), [data]);
  const safeIndex = variants.length ? ((variantIndex % variants.length) + variants.length) % variants.length : 0;
  const activeVariant = variants[safeIndex];
  const customMode = activeVariant?.engine === "custom" && Boolean(activeVariant.customKind);
  const canvasHeight = data.layout === "timeline" ? Math.max(620, 260 + data.items.length * 86) : data.items.length > 5 ? 760 : 650;

  useEffect(() => {
    if (variants.length && variantIndex !== safeIndex) onVariantIndexChange(safeIndex);
  }, [variantIndex, safeIndex, variants.length, onVariantIndexChange]);

  useEffect(() => {
    instanceRef.current?.destroy();
    instanceRef.current = null;
    setRenderError(null);
    if (customMode || !containerRef.current) return;
    try {
      const infographic = new Infographic({
        ...buildAntvOptions(data, style, safeIndex),
        container: containerRef.current,
        width: "100%",
        height: canvasHeight,
        padding: 44,
        editable: false,
      });
      infographic.on("error", (error) => setRenderError(error instanceof Error ? error.message : "Erreur de rendu AntV."));
      infographic.render();
      instanceRef.current = infographic;
    } catch (error) {
      setRenderError(error instanceof Error ? error.message : "Erreur de rendu AntV.");
    }
    return () => {
      instanceRef.current?.destroy();
      instanceRef.current = null;
    };
  }, [data, style, safeIndex, customMode, canvasHeight]);

  useEffect(() => {
    const getSvg = async () => {
      let raw: string;
      if (customMode) {
        const svg = customRef.current?.querySelector("svg");
        if (!(svg instanceof SVGSVGElement)) throw new Error("SVG local indisponible.");
        raw = svgElementToDataUrl(svg);
      } else {
        if (!instanceRef.current) throw new Error("Rendu AntV indisponible.");
        raw = await instanceRef.current.toDataURL({ type: "svg", embedResources: true });
      }
      return brandSvgDataUrl(raw, brand);
    };
    const getPng = async () => svgDataUrlToPng(await getSvg(), 2);
    onExporter({ getSvg, getPng });
    return () => onExporter(null);
  }, [data, style, safeIndex, customMode, brand, onExporter]);

  return (
    <div className="studio-visual-frame" style={{ fontFamily: fontStacks[brand.fontFamily], background: brand.background }}>
      <div className="studio-visual-meta">
        <div className="studio-brand-lockup">
          {brand.logoDataUrl && <img src={brand.logoDataUrl} alt="" />}
          <span>{brand.name}</span>
        </div>
        {variants.length > 1 && (
          <div className="studio-variant-control">
            <button type="button" onClick={() => onVariantIndexChange((safeIndex - 1 + variants.length) % variants.length)} aria-label="Variante précédente">‹</button>
            <span>{activeVariant?.label ?? "Variante"} · {safeIndex + 1}/{variants.length}</span>
            <button type="button" onClick={() => onVariantIndexChange((safeIndex + 1) % variants.length)} aria-label="Variante suivante">›</button>
          </div>
        )}
      </div>
      <div className={`studio-infographic-canvas canvas-${style}`} style={{ minHeight: canvasHeight }}>
        {customMode && activeVariant?.customKind ? (
          <div ref={customRef} className="custom-visual-host">
            <CustomVisual kind={activeVariant.customKind} data={data} style={style} />
          </div>
        ) : (
          <div ref={containerRef} className="antv-canvas" />
        )}
      </div>
      {brand.footer?.trim() && <div className="studio-visual-footer">{brand.footer}</div>}
      {renderError && <p className="studio-inline-error">Rendu : {renderError}</p>}
    </div>
  );
}

export function ProviderPicker({ value, onChange, providers }: { value: AIProvider; onChange: (value: AIProvider) => void; providers: ProviderStatus[] }) {
  const options: { value: AIProvider; label: string }[] = [
    { value: "auto", label: "Auto" },
    { value: "vibe", label: "Vibe" },
    { value: "codex", label: "Codex" },
  ];
  return (
    <div className="studio-provider-picker">
      {options.map((option) => {
        const status = option.value === "auto" ? null : providers.find((item) => item.id === option.value);
        const ready = option.value === "auto" ? providers.some((item) => item.available) : Boolean(status?.available);
        return (
          <button key={option.value} type="button" className={value === option.value ? "active" : ""} onClick={() => onChange(option.value)}>
            <span className={`provider-dot ${ready ? "ready" : "offline"}`} />
            <strong>{option.label}</strong>
            <small>{option.value === "auto" ? "fallback" : status?.available ? "prêt" : "indisponible"}</small>
          </button>
        );
      })}
    </div>
  );
}

