import { Infographic } from "@antv/infographic";
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { generateInfographic, getProviders, regenerateInfographicItem, reviewInfographic } from "./api";
import { buildAntvOptions, getAntvVariants } from "./antv";
import {
  blockOptions,
  buildMarkdown,
  buildMermaid,
  buildMindmap,
  buildSourcesMarkdown,
  buildZip,
  claimOptions,
  dataUrlToBytes,
  defaultBrands,
  deleteLocalProject,
  duplicateLocalProject,
  intentOptions,
  loadBrands,
  loadLibrary,
  localQualityReview,
  normalizeInfographic,
  renameLocalProject,
  safeSlug,
  saveCustomBrand,
  upsertLocalProject,
  type AugmentedProjectState,
  type LocalProjectRecord,
} from "./augmented";
import { CustomVisual } from "./CustomVisual";
import { MarkdownView } from "./MarkdownView";
import { MermaidView } from "./MermaidView";
import {
  buildStandaloneHtml,
  downloadBlob,
  downloadHref,
  svgDataUrlToPng,
  svgElementToDataUrl,
} from "./project";
import type {
  AIProvider,
  BlockKind,
  BrandProfile,
  CanonicalInfographic,
  ClaimKind,
  InfographicItem,
  InfographicKind,
  InfographicStyle,
  ProviderStatus,
  QualityIssue,
  QualityReview,
  RepresentationKind,
  UsageIntent,
} from "./types";

type ThemeMode = "light" | "dark";
type InspectorPanel = "brief" | "structure" | "brand" | "quality";

type VisualExporter = {
  getSvg: () => Promise<string>;
  getPng: () => Promise<string>;
};

type RetouchHistory = {
  itemIndex: number;
  before: InfographicItem;
};

const layoutOptions: { value: InfographicKind; label: string }[] = [
  { value: "auto", label: "Auto" },
  { value: "process", label: "Processus" },
  { value: "comparison", label: "Comparaison" },
  { value: "timeline", label: "Timeline" },
  { value: "list", label: "Liste" },
];

const resultLayoutOptions: { value: CanonicalInfographic["layout"]; label: string }[] = [
  { value: "process", label: "Processus" },
  { value: "comparison", label: "Comparaison" },
  { value: "timeline", label: "Timeline" },
  { value: "list", label: "Liste" },
];

const styleOptions: { value: InfographicStyle; label: string }[] = [
  { value: "clean", label: "Clean" },
  { value: "soft", label: "Soft" },
  { value: "dark", label: "Dark" },
  { value: "sketch", label: "Sketch" },
  { value: "chalk", label: "Chalk" },
];

const viewOptions: { value: RepresentationKind; label: string; short: string }[] = [
  { value: "infographic", label: "Infographie", short: "VIS" },
  { value: "mermaid", label: "Diagramme", short: "MER" },
  { value: "mindmap", label: "Mindmap", short: "MAP" },
  { value: "markdown", label: "Document", short: "MD" },
];

const panelOptions: { value: InspectorPanel; label: string; number: string }[] = [
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

function getInitialTheme(): ThemeMode {
  const stored = localStorage.getItem("infographic-lab-augmented-theme");
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function formatDate(value: string) {
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

function InfographicPreview({
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

function ProviderPicker({ value, onChange, providers }: { value: AIProvider; onChange: (value: AIProvider) => void; providers: ProviderStatus[] }) {
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

export function AugmentedStudioV2() {
  const [theme, setTheme] = useState<ThemeMode>(getInitialTheme);
  const [activePanel, setActivePanel] = useState<InspectorPanel>("brief");
  const [sourceText, setSourceText] = useState("");
  const [intent, setIntent] = useState<UsageIntent>("explain");
  const [provider, setProvider] = useState<AIProvider>("auto");
  const [type, setType] = useState<InfographicKind>("auto");
  const [style, setStyle] = useState<InfographicStyle>("clean");
  const [result, setResult] = useState<CanonicalInfographic | null>(null);
  const [view, setView] = useState<RepresentationKind>("infographic");
  const [variantIndex, setVariantIndex] = useState(0);
  const [providers, setProviders] = useState<ProviderStatus[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [brands, setBrands] = useState<BrandProfile[]>(() => loadBrands());
  const [brand, setBrand] = useState<BrandProfile>(() => loadBrands()[0] ?? defaultBrands[0]);
  const [quality, setQuality] = useState<QualityReview | null>(null);
  const [qualityLoading, setQualityLoading] = useState(false);
  const [qualityError, setQualityError] = useState<string | null>(null);
  const [selectedItemIndex, setSelectedItemIndex] = useState(0);
  const [retouchInstruction, setRetouchInstruction] = useState("");
  const [retouchLoading, setRetouchLoading] = useState(false);
  const [retouchHistory, setRetouchHistory] = useState<RetouchHistory | null>(null);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [projectName, setProjectName] = useState("Sans titre");
  const [createdAt, setCreatedAt] = useState(() => new Date().toISOString());
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [libraryVersion, setLibraryVersion] = useState(0);
  const [exporting, setExporting] = useState(false);
  const [mermaidSvg, setMermaidSvg] = useState<string | null>(null);
  const exporterRef = useRef<VisualExporter | null>(null);

  const library = useMemo(() => loadLibrary(), [libraryVersion]);
  const mermaidCode = useMemo(() => result ? buildMermaid(result) : "", [result]);
  const markdown = useMemo(() => result ? buildMarkdown(result, intent, brand) : "", [result, intent, brand]);
  const mindmap = useMemo(() => result ? buildMindmap(result) : null, [result]);
  const localReview = useMemo(() => result ? localQualityReview(result) : null, [result]);
  const selectedItem = result?.items[selectedItemIndex] ?? null;
  const activeQuality = quality ?? localReview;

  const registerExporter = useCallback((exporter: VisualExporter | null) => {
    exporterRef.current = exporter;
  }, []);

  const handleMermaidSvg = useCallback((svg: string | null) => {
    setMermaidSvg(svg);
  }, []);

  useEffect(() => {
    localStorage.setItem("infographic-lab-augmented-theme", theme);
  }, [theme]);

  useEffect(() => {
    let active = true;
    const refresh = async () => {
      try {
        const next = await getProviders();
        if (active) setProviders(next);
      } catch {
        if (active) setProviders([]);
      }
    };
    void refresh();
    const timer = window.setInterval(() => void refresh(), 15_000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    if (!result) return;
    setResult((current) => current ? {
      ...current,
      appearance: { ...current.appearance, accent: brand.accent, background: brand.background },
    } : current);
  }, [brand.id, brand.accent, brand.background]);

  useEffect(() => {
    const count = result?.items.length ?? 0;
    if (!count) {
      setSelectedItemIndex(0);
      return;
    }
    setSelectedItemIndex((current) => Math.min(current, count - 1));
  }, [result?.items.length]);

  useEffect(() => {
    if (!result || !projectId) return;
    const timer = window.setTimeout(() => {
      upsertLocalProject({
        id: projectId,
        name: projectName,
        createdAt,
        updatedAt: new Date().toISOString(),
        sourceText,
        intent,
        provider,
        type,
        style,
        variantIndex,
        brand,
        infographic: result,
      }, "Version précédente");
      setLibraryVersion((value) => value + 1);
    }, 900);
    return () => window.clearTimeout(timer);
  }, [result, projectId, projectName, createdAt, sourceText, intent, provider, type, style, variantIndex, brand]);

  async function handleGenerate() {
    const clean = sourceText.trim();
    if (clean.length < 10) {
      setError("Décrivez un peu plus l'idée à structurer.");
      return;
    }
    setLoading(true);
    setError(null);
    setWarnings([]);
    setQuality(null);
    setQualityError(null);
    try {
      const response = await generateInfographic({ text: clean, type, style, language: "fr", intent, provider });
      const next = normalizeInfographic({
        ...response.infographic,
        appearance: { ...response.infographic.appearance, accent: brand.accent, background: brand.background },
      });
      setResult(next);
      setVariantIndex(0);
      setSelectedItemIndex(0);
      setView("infographic");
      setActivePanel("structure");
      setWarnings(response.warnings ?? []);
      const seconds = response.durationMs ? `${(response.durationMs / 1000).toFixed(1)} s` : null;
      setMeta([response.provider ?? provider, seconds].filter(Boolean).join(" · "));
      if (!projectId) {
        setProjectId(crypto.randomUUID());
        setCreatedAt(new Date().toISOString());
      }
      if (projectName === "Sans titre") setProjectName(next.title);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "La génération a échoué.");
    } finally {
      setLoading(false);
    }
  }

  function updateItem(index: number, patch: Partial<InfographicItem>) {
    setResult((current) => current ? {
      ...current,
      items: current.items.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item),
    } : current);
    setQuality(null);
  }

  function moveItem(index: number, delta: number) {
    if (!result) return;
    const target = index + delta;
    if (target < 0 || target >= result.items.length) return;
    const items = result.items.map((item) => ({ ...item }));
    [items[index], items[target]] = [items[target], items[index]];
    setResult({ ...result, items });
    setSelectedItemIndex(target);
    setQuality(null);
  }

  function addItem(afterIndex?: number) {
    if (!result || result.layout === "comparison" || result.items.length >= 8) return;
    const index = afterIndex ?? result.items.length - 1;
    const items = [...result.items];
    items.splice(index + 1, 0, {
      title: "Nouveau bloc",
      description: "À compléter.",
      blockType: "list",
      claimType: "interpretation",
    });
    setResult({ ...result, items });
    setSelectedItemIndex(index + 1);
  }

  function deleteItem(index: number) {
    if (!result || result.layout === "comparison" || result.items.length <= 2) return;
    setResult({ ...result, items: result.items.filter((_, itemIndex) => itemIndex !== index) });
    setSelectedItemIndex(Math.max(0, index - 1));
  }

  async function handleRetouch(index: number) {
    if (!result || retouchLoading) return;
    const before = { ...result.items[index] };
    setRetouchLoading(true);
    setError(null);
    try {
      const response = await regenerateInfographicItem({
        sourceText,
        infographic: result,
        itemIndex: index,
        instruction: retouchInstruction.trim() || undefined,
        intent,
        provider,
      });
      updateItem(index, response.item);
      setRetouchHistory({ itemIndex: index, before });
      setRetouchInstruction("");
      const seconds = response.durationMs ? `${(response.durationMs / 1000).toFixed(1)} s` : null;
      setMeta([response.provider ?? provider, seconds, `bloc ${index + 1}`].filter(Boolean).join(" · "));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "La retouche IA a échoué.");
    } finally {
      setRetouchLoading(false);
    }
  }

  function undoRetouch() {
    if (!retouchHistory) return;
    updateItem(retouchHistory.itemIndex, retouchHistory.before);
    setRetouchHistory(null);
    setMeta("Retouche annulée localement");
  }

  async function handleQualityReview() {
    if (!result) return;
    setQualityLoading(true);
    setQualityError(null);
    try {
      const response = await reviewInfographic({ sourceText, infographic: result, intent, provider });
      setQuality(response);
    } catch (caught) {
      setQualityError(caught instanceof Error ? caught.message : "Contrôle qualité indisponible.");
      setQuality(localReview);
    } finally {
      setQualityLoading(false);
    }
  }

  function applyQualityIssue(issue: QualityIssue) {
    if (issue.itemIndex === undefined || !result?.items[issue.itemIndex]) return;
    const patch: Partial<InfographicItem> = {};
    if (issue.proposedTitle?.trim()) patch.title = issue.proposedTitle.trim();
    if (issue.proposedDescription?.trim()) patch.description = issue.proposedDescription.trim();
    if (Object.keys(patch).length) updateItem(issue.itemIndex, patch);
  }

  function buildCurrentProject(): AugmentedProjectState | null {
    if (!result) return null;
    return {
      id: projectId ?? crypto.randomUUID(),
      name: projectName === "Sans titre" ? result.title : projectName,
      createdAt,
      updatedAt: new Date().toISOString(),
      sourceText,
      intent,
      provider,
      type,
      style,
      variantIndex,
      brand,
      infographic: result,
    };
  }

  function loadProject(record: LocalProjectRecord) {
    setProjectId(record.id);
    setProjectName(record.name);
    setCreatedAt(record.createdAt);
    setSourceText(record.sourceText);
    setIntent(record.intent);
    setProvider(record.provider);
    setType(record.type);
    setStyle(record.style);
    setVariantIndex(record.variantIndex);
    setBrand(record.brand);
    setResult(normalizeInfographic(record.infographic));
    setQuality(null);
    setWarnings([]);
    setSelectedItemIndex(0);
    setMeta(`Projet local ouvert · ${formatDate(record.updatedAt)}`);
    setLibraryOpen(false);
  }

  function restoreSnapshot(record: LocalProjectRecord, snapshotIndex: number) {
    const snapshot = record.snapshots[snapshotIndex];
    if (!snapshot) return;
    const state = snapshot.state;
    setProjectId(record.id);
    setProjectName(state.name);
    setCreatedAt(record.createdAt);
    setSourceText(state.sourceText);
    setIntent(state.intent);
    setProvider(state.provider);
    setType(state.type);
    setStyle(state.style);
    setVariantIndex(state.variantIndex);
    setBrand(state.brand);
    setResult(normalizeInfographic(state.infographic));
    setSelectedItemIndex(0);
    setMeta(`Version restaurée · ${formatDate(snapshot.savedAt)}`);
    setLibraryOpen(false);
  }

  function newProject() {
    setProjectId(null);
    setProjectName("Sans titre");
    setCreatedAt(new Date().toISOString());
    setSourceText("");
    setIntent("explain");
    setProvider("auto");
    setType("auto");
    setStyle("clean");
    setVariantIndex(0);
    setResult(null);
    setQuality(null);
    setMeta(null);
    setError(null);
    setWarnings([]);
    setSelectedItemIndex(0);
    setActivePanel("brief");
  }

  function createBrandProfile() {
    const next: BrandProfile = {
      ...brand,
      id: crypto.randomUUID(),
      name: `${brand.name} personnalisé`,
      logoDataUrl: brand.logoDataUrl,
    };
    saveCustomBrand(next);
    setBrands(loadBrands());
    setBrand(next);
  }

  function saveBrand() {
    if (defaultBrands.some((item) => item.id === brand.id)) return createBrandProfile();
    saveCustomBrand(brand);
    setBrands(loadBrands());
  }

  function handleLogo(file: File | null) {
    if (!file) return;
    if (file.size > 300_000) {
      setError("Logo refusé : utilisez une image de moins de 300 Ko.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setBrand((current) => ({ ...current, logoDataUrl: typeof reader.result === "string" ? reader.result : undefined }));
    reader.readAsDataURL(file);
  }

  async function exportPack() {
    const project = buildCurrentProject();
    if (!project || !result) return;
    setExporting(true);
    setError(null);
    try {
      const base = safeSlug(result.title);
      const files: { name: string; data: string | Uint8Array }[] = [
        { name: `${base}/document.md`, data: markdown },
        { name: `${base}/diagram.mmd`, data: mermaidCode },
        { name: `${base}/mindmap.json`, data: JSON.stringify(mindmap, null, 2) },
        { name: `${base}/sources.md`, data: buildSourcesMarkdown(result) },
        { name: `${base}/project.json`, data: JSON.stringify(project, null, 2) },
      ];

      if (mermaidSvg) files.push({ name: `${base}/diagram.svg`, data: mermaidSvg });
      if (exporterRef.current) {
        const svg = await exporterRef.current.getSvg();
        const png = await exporterRef.current.getPng();
        files.push({ name: `${base}/infographic.svg`, data: dataUrlToBytes(svg) });
        files.push({ name: `${base}/infographic.png`, data: dataUrlToBytes(png) });
        files.push({ name: `${base}/infographic.html`, data: buildStandaloneHtml({ svgDataUrl: svg, title: result.title, subtitle: result.subtitle, style }) });
      }
      downloadBlob(buildZip(files), "application/zip", `${base}-publication-pack.zip`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "L'export du pack a échoué.");
    } finally {
      setExporting(false);
    }
  }

  async function exportSvg() {
    if (!result || !exporterRef.current) return;
    try {
      downloadHref(await exporterRef.current.getSvg(), `${safeSlug(result.title)}.svg`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Export SVG impossible.");
    }
  }

  async function exportPng() {
    if (!result || !exporterRef.current) return;
    try {
      downloadHref(await exporterRef.current.getPng(), `${safeSlug(result.title)}.png`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Export PNG impossible.");
    }
  }

  function exportCurrentSource() {
    if (!result) return;
    const base = safeSlug(result.title);
    if (view === "mermaid") downloadBlob(mermaidCode, "text/plain;charset=utf-8", `${base}.mmd`);
    if (view === "markdown") downloadBlob(markdown, "text/markdown;charset=utf-8", `${base}.md`);
    if (view === "mindmap") downloadBlob(JSON.stringify(mindmap, null, 2), "application/json;charset=utf-8", `${base}.mindmap.json`);
  }

  function exportMermaidSvg() {
    if (!result || !mermaidSvg) return;
    downloadBlob(mermaidSvg, "image/svg+xml;charset=utf-8", `${safeSlug(result.title)}-diagram.svg`);
  }

  const availableProviders = providers.filter((item) => item.available);
  const statusText = availableProviders.length
    ? availableProviders.map((item) => item.label.replace("Mistral ", "").replace("OpenAI ", "")).join(" + ")
    : "Aucun moteur";

  return (
    <main className="studio-app" data-theme={theme} style={{ "--brand-accent": brand.accent } as CSSProperties}>
      <header className="studio-header">
        <div className="studio-product">
          <div className="studio-product-mark">IL</div>
          <div className="studio-product-copy">
            <strong>Infographic Lab</strong>
            <span>Augmented Studio</span>
          </div>
        </div>

        <div className="studio-project-title">
          <span>Projet</span>
          <input value={projectName} onChange={(event) => setProjectName(event.target.value.slice(0, 120))} aria-label="Nom du projet" />
          {meta && <small>{meta}</small>}
        </div>

        <div className="studio-header-actions">
          <div className={`studio-engine-status ${availableProviders.length ? "ready" : "offline"}`} title="État des moteurs IA">
            <span />
            <strong>{statusText}</strong>
          </div>
          <button type="button" className="studio-header-button" onClick={() => setLibraryOpen(true)}>Projets <i>{library.length}</i></button>
          <button type="button" className="studio-header-button" onClick={newProject}>Nouveau</button>
          <button type="button" className="studio-theme-toggle" onClick={() => setTheme((current) => current === "light" ? "dark" : "light")} aria-label="Changer le thème">
            <span>{theme === "light" ? "☾" : "☀"}</span>
            {theme === "light" ? "Sombre" : "Clair"}
          </button>
        </div>
      </header>

      <div className="studio-workbench">
        <aside className="studio-inspector">
          <nav className="studio-inspector-tabs" aria-label="Outils de composition">
            {panelOptions.map((panel) => (
              <button key={panel.value} type="button" className={activePanel === panel.value ? "active" : ""} onClick={() => setActivePanel(panel.value)}>
                <span>{panel.number}</span>
                {panel.label}
              </button>
            ))}
          </nav>

          <div className="studio-inspector-scroll">
            {activePanel === "brief" && (
              <section className="studio-inspector-section">
                <div className="studio-section-title">
                  <span>01 · BRIEF</span>
                  <h2>Que voulez-vous faire comprendre ?</h2>
                  <p>Donnez la matière. Le moteur construit ensuite un modèle d'idée éditable.</p>
                </div>

                <label className="studio-field studio-source-field">
                  <span>Contenu source</span>
                  <textarea value={sourceText} onChange={(event) => setSourceText(event.target.value)} maxLength={12000} placeholder="Collez votre texte, vos notes ou votre raisonnement…" />
                  <small>{sourceText.length.toLocaleString("fr-FR")} / 12 000</small>
                </label>

                <div className="studio-field-group">
                  <span className="studio-field-label">Objectif</span>
                  <div className="studio-intent-grid">
                    {intentOptions.map((option) => (
                      <button key={option.value} type="button" className={intent === option.value ? "active" : ""} onClick={() => setIntent(option.value)}>
                        <strong>{option.label}</strong>
                        <small>{option.hint}</small>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="studio-field-group">
                  <span className="studio-field-label">Moteur IA</span>
                  <ProviderPicker value={provider} onChange={setProvider} providers={providers} />
                </div>

                <div className="studio-two-fields">
                  <label className="studio-field">
                    <span>Structure</span>
                    <select value={type} onChange={(event) => setType(event.target.value as InfographicKind)}>{layoutOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select>
                  </label>
                  <label className="studio-field">
                    <span>Style visuel</span>
                    <select value={style} onChange={(event) => setStyle(event.target.value as InfographicStyle)}>{styleOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select>
                  </label>
                </div>

                <button type="button" className="studio-primary" disabled={loading} onClick={() => void handleGenerate()}>{loading ? "Structuration en cours…" : result ? "Reconstruire le modèle" : "Construire le modèle"}</button>
                {error && <p className="studio-message error">{error}</p>}
                {warnings.map((warning) => <p key={warning} className="studio-message warning">{warning}</p>)}
              </section>
            )}

            {activePanel === "structure" && (
              <section className="studio-inspector-section">
                <div className="studio-section-title">
                  <span>02 · STRUCTURE</span>
                  <h2>Composez le modèle d'idée</h2>
                  <p>Chaque modification alimente toutes les représentations sans nouvel appel IA.</p>
                </div>

                {!result ? (
                  <div className="studio-panel-empty">Construisez d'abord un modèle depuis le Brief.</div>
                ) : (
                  <>
                    <div className="studio-model-meta">
                      <label className="studio-field"><span>Titre</span><input value={result.title} onChange={(event) => setResult({ ...result, title: event.target.value.slice(0, 120) })} /></label>
                      <label className="studio-field"><span>Sous-titre</span><input value={result.subtitle ?? ""} onChange={(event) => setResult({ ...result, subtitle: event.target.value.slice(0, 180) || undefined })} /></label>
                      <label className="studio-field"><span>Logique globale</span><select value={result.layout} onChange={(event) => setResult({ ...result, layout: event.target.value as CanonicalInfographic["layout"] })}>{resultLayoutOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
                    </div>

                    <div className="studio-block-list-head"><span>Blocs · {result.items.length}</span><button type="button" onClick={() => addItem()} disabled={result.layout === "comparison" || result.items.length >= 8}>+ Ajouter</button></div>
                    <div className="studio-block-list">
                      {result.items.map((item, index) => (
                        <button key={`${index}-${item.title}`} type="button" className={selectedItemIndex === index ? "studio-block-row active" : "studio-block-row"} onClick={() => setSelectedItemIndex(index)}>
                          <span className="studio-block-index">{String(index + 1).padStart(2, "0")}</span>
                          <span className="studio-block-row-copy"><strong>{item.title || "Sans titre"}</strong><small>{item.blockType ?? "list"} · {item.claimType ?? "interpretation"}</small></span>
                        </button>
                      ))}
                    </div>

                    {selectedItem && (
                      <div className="studio-block-editor">
                        <div className="studio-block-editor-head">
                          <strong>Bloc {selectedItemIndex + 1}</strong>
                          <div><button type="button" onClick={() => moveItem(selectedItemIndex, -1)} disabled={selectedItemIndex === 0}>↑</button><button type="button" onClick={() => moveItem(selectedItemIndex, 1)} disabled={selectedItemIndex === result.items.length - 1}>↓</button><button type="button" onClick={() => deleteItem(selectedItemIndex)} disabled={result.layout === "comparison" || result.items.length <= 2}>Suppr.</button></div>
                        </div>
                        <label className="studio-field"><span>Titre du bloc</span><input value={selectedItem.title} maxLength={60} onChange={(event) => updateItem(selectedItemIndex, { title: event.target.value })} /></label>
                        <label className="studio-field"><span>Description</span><textarea className="studio-small-textarea" value={selectedItem.description} maxLength={180} onChange={(event) => updateItem(selectedItemIndex, { description: event.target.value })} /></label>
                        <div className="studio-two-fields">
                          <label className="studio-field"><span>Type</span><select value={selectedItem.blockType ?? "list"} onChange={(event) => updateItem(selectedItemIndex, { blockType: event.target.value as BlockKind })}>{blockOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
                          <label className="studio-field"><span>Statut</span><select value={selectedItem.claimType ?? "interpretation"} onChange={(event) => updateItem(selectedItemIndex, { claimType: event.target.value as ClaimKind })}>{claimOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
                        </div>
                        {selectedItem.claimType === "fact" && <label className="studio-field"><span>Preuve source</span><input value={selectedItem.evidence ?? ""} maxLength={260} onChange={(event) => updateItem(selectedItemIndex, { evidence: event.target.value || undefined })} placeholder="Extrait exact du texte source" /></label>}
                        <div className="studio-ai-command"><span>Retouche IA ciblée</span><div><input value={retouchInstruction} onChange={(event) => setRetouchInstruction(event.target.value.slice(0, 500))} placeholder="Simplifie, rends plus direct, fusionne…" /><button type="button" disabled={retouchLoading} onClick={() => void handleRetouch(selectedItemIndex)}>{retouchLoading ? "…" : "Appliquer"}</button></div></div>
                        {retouchHistory && <button type="button" className="studio-link-button" onClick={undoRetouch}>↶ Annuler la dernière retouche</button>}
                      </div>
                    )}
                  </>
                )}
              </section>
            )}

            {activePanel === "brand" && (
              <section className="studio-inspector-section">
                <div className="studio-section-title"><span>03 · IDENTITÉ</span><h2>Appliquez votre signature</h2><p>Un profil visuel s'applique au projet et aux exports.</p></div>
                <label className="studio-field"><span>Profil</span><select value={brand.id} onChange={(event) => { const selected = brands.find((item) => item.id === event.target.value); if (selected) setBrand(selected); }}>{brands.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
                <label className="studio-field"><span>Nom</span><input value={brand.name} onChange={(event) => setBrand({ ...brand, name: event.target.value.slice(0, 80) })} /></label>
                <div className="studio-color-grid">
                  <label><span>Principale</span><input type="color" value={brand.primary} onChange={(event) => setBrand({ ...brand, primary: event.target.value })} /><small>{brand.primary}</small></label>
                  <label><span>Accent</span><input type="color" value={brand.accent} onChange={(event) => setBrand({ ...brand, accent: event.target.value })} /><small>{brand.accent}</small></label>
                  <label><span>Fond</span><input type="color" value={brand.background} onChange={(event) => setBrand({ ...brand, background: event.target.value })} /><small>{brand.background}</small></label>
                </div>
                <label className="studio-field"><span>Typographie</span><select value={brand.fontFamily} onChange={(event) => setBrand({ ...brand, fontFamily: event.target.value as BrandProfile["fontFamily"] })}><option value="system">Sans serif</option><option value="serif">Serif</option><option value="mono">Mono</option></select></label>
                <label className="studio-field"><span>Footer</span><input value={brand.footer ?? ""} onChange={(event) => setBrand({ ...brand, footer: event.target.value.slice(0, 120) })} /></label>
                <label className="studio-file-field"><span>Logo</span><input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" onChange={(event) => handleLogo(event.target.files?.[0] ?? null)} /></label>
                <button type="button" className="studio-secondary" onClick={saveBrand}>{defaultBrands.some((item) => item.id === brand.id) ? "Créer mon profil" : "Enregistrer le profil"}</button>
              </section>
            )}

            {activePanel === "quality" && (
              <section className="studio-inspector-section">
                <div className="studio-section-title"><span>04 · QUALITÉ</span><h2>Contrôlez avant de publier</h2><p>Lisibilité, structure, contenu et traçabilité des sources.</p></div>
                {!result ? <div className="studio-panel-empty">Aucun modèle à analyser.</div> : (
                  <>
                    {activeQuality && <div className="studio-score"><strong>{activeQuality.score}</strong><span>/100</span><p>{activeQuality.summary}</p></div>}
                    <button type="button" className="studio-secondary" disabled={qualityLoading} onClick={() => void handleQualityReview()}>{qualityLoading ? "Analyse en cours…" : "Analyser avec l'IA"}</button>
                    {qualityError && <p className="studio-message warning">{qualityError} · contrôle local affiché.</p>}
                    <div className="studio-issues">{activeQuality?.issues.map((issue, index) => <article key={`${issue.message}-${index}`} className={issue.severity}><span>{issue.category}</span><strong>{issue.message}</strong>{issue.suggestion && <small>{issue.suggestion}</small>}{issue.itemIndex !== undefined && (issue.proposedTitle || issue.proposedDescription) && <button type="button" onClick={() => applyQualityIssue(issue)}>Appliquer la correction</button>}</article>)}</div>
                  </>
                )}
              </section>
            )}
          </div>
        </aside>

        <section className="studio-stage">
          <div className="studio-stage-toolbar">
            <div className="studio-view-tabs">
              {viewOptions.map((option) => <button key={option.value} type="button" className={view === option.value ? "active" : ""} onClick={() => setView(option.value)} disabled={!result}><span>{option.short}</span>{option.label}</button>)}
            </div>
            <div className="studio-stage-badges">
              {result && <span>{result.items.length} blocs</span>}
              <span>Preview · 3092</span>
            </div>
          </div>

          <div className="studio-stage-scroll">
            {!result ? (
              <div className="studio-stage-empty">
                <div className="studio-empty-mark">IL</div>
                <h1>Une idée, plusieurs représentations.</h1>
                <p>Commencez par le Brief. Le même modèle alimentera l'infographie, Mermaid, la mindmap et le document Markdown.</p>
                <button type="button" onClick={() => setActivePanel("brief")}>Ouvrir le Brief</button>
              </div>
            ) : (
              <div className="studio-output-shell">
                <div className="studio-output-heading">
                  <div><span>{viewOptions.find((item) => item.value === view)?.label}</span><h1>{result.title}</h1>{result.subtitle && <p>{result.subtitle}</p>}</div>
                  <small>Source unique · mise à jour en direct</small>
                </div>

                {view === "infographic" && <InfographicPreview data={result} style={style} brand={brand} variantIndex={variantIndex} onVariantIndexChange={setVariantIndex} onExporter={registerExporter} />}
                {view === "mermaid" && <MermaidView code={mermaidCode} theme={theme} onSvg={handleMermaidSvg} />}
                {view === "mindmap" && <div className="studio-mindmap"><div className="studio-mind-root"><strong>{mindmap?.title}</strong><small>{mindmap?.subtitle}</small></div><div className="studio-mind-branches">{result.items.map((item, index) => <article key={index}><span>{String(index + 1).padStart(2, "0")} · {item.blockType}</span><strong>{item.title}</strong><small>{item.description}</small></article>)}</div></div>}
                {view === "markdown" && <MarkdownView source={markdown} />}

                {view === "mermaid" && <details className="studio-source-details"><summary>Afficher le code Mermaid</summary><pre>{mermaidCode}</pre></details>}
                {view === "markdown" && <details className="studio-source-details"><summary>Afficher le Markdown source</summary><pre>{markdown}</pre></details>}
              </div>
            )}
          </div>

          {result && (
            <div className="studio-stage-footer">
              <div className="studio-footer-status"><span className="live-dot" /> Modèle synchronisé</div>
              <div className="studio-export-actions">
                {view === "infographic" && <><button type="button" onClick={() => void exportSvg()}>SVG</button><button type="button" onClick={() => void exportPng()}>PNG</button></>}
                {view === "mermaid" && <><button type="button" onClick={exportCurrentSource}>Source .mmd</button><button type="button" onClick={exportMermaidSvg} disabled={!mermaidSvg}>Diagramme SVG</button></>}
                {view === "markdown" && <button type="button" onClick={exportCurrentSource}>Document .md</button>}
                {view === "mindmap" && <button type="button" onClick={exportCurrentSource}>Mindmap JSON</button>}
                <button type="button" className="studio-export-pack" disabled={exporting} onClick={() => void exportPack()}>{exporting ? "Création du pack…" : "Publication Pack"}</button>
              </div>
            </div>
          )}
        </section>
      </div>

      {libraryOpen && (
        <div className="studio-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setLibraryOpen(false); }}>
          <section className="studio-modal" role="dialog" aria-modal="true" aria-label="Bibliothèque de projets">
            <header><div><span>BIBLIOTHÈQUE LOCALE</span><h2>Mes projets</h2></div><button type="button" onClick={() => setLibraryOpen(false)} aria-label="Fermer">×</button></header>
            <div className="studio-modal-content">
              {!library.length && <div className="studio-panel-empty">Aucun projet local pour le moment.</div>}
              {library.map((record) => <article key={record.id} className={record.id === projectId ? "studio-project-card active" : "studio-project-card"}><div className="studio-project-card-copy"><strong>{record.name}</strong><small>{formatDate(record.updatedAt)} · {record.infographic.items.length} blocs</small></div><div className="studio-project-card-actions"><button type="button" onClick={() => loadProject(record)}>Ouvrir</button><button type="button" onClick={() => { duplicateLocalProject(record.id); setLibraryVersion((value) => value + 1); }}>Dupliquer</button><button type="button" onClick={() => { const name = window.prompt("Nouveau nom", record.name); if (name) { renameLocalProject(record.id, name); setLibraryVersion((value) => value + 1); } }}>Renommer</button><button type="button" onClick={() => { if (window.confirm(`Supprimer « ${record.name} » ?`)) { deleteLocalProject(record.id); setLibraryVersion((value) => value + 1); } }}>Supprimer</button></div>{record.snapshots.length > 0 && <details><summary>{record.snapshots.length} version(s) enregistrée(s)</summary><div className="studio-version-list">{record.snapshots.map((snapshot, index) => <button key={snapshot.id} type="button" onClick={() => restoreSnapshot(record, index)}>{formatDate(snapshot.savedAt)} · restaurer</button>)}</div></details>}</article>)}
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
