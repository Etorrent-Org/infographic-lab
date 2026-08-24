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

const layoutOptions: { value: InfographicKind; label: string }[] = [
  { value: "auto", label: "Auto" },
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

const viewOptions: { value: RepresentationKind; label: string }[] = [
  { value: "infographic", label: "Infographie" },
  { value: "mermaid", label: "Mermaid" },
  { value: "mindmap", label: "Mindmap" },
  { value: "markdown", label: "Markdown" },
];

const fontStacks: Record<BrandProfile["fontFamily"], string> = {
  system: "Inter, ui-sans-serif, system-ui, sans-serif",
  serif: "Georgia, 'Times New Roman', serif",
  mono: "'SFMono-Regular', Consolas, 'Liberation Mono', monospace",
};

type VisualExporter = {
  getSvg: () => Promise<string>;
  getPng: () => Promise<string>;
};

type RetouchHistory = {
  itemIndex: number;
  before: InfographicItem;
};

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
    <div className="aug-visual-wrap" style={{ fontFamily: fontStacks[brand.fontFamily], background: brand.background }}>
      <div className="aug-brand-strip">
        <div className="aug-brand-identity">
          {brand.logoDataUrl && <img src={brand.logoDataUrl} alt="" />}
          <span>{brand.name}</span>
        </div>
        {variants.length > 1 && (
          <div className="aug-variant-switch">
            <button type="button" onClick={() => onVariantIndexChange((safeIndex - 1 + variants.length) % variants.length)}>‹</button>
            <span>{activeVariant?.label ?? "Variante"} · {safeIndex + 1}/{variants.length}</span>
            <button type="button" onClick={() => onVariantIndexChange((safeIndex + 1) % variants.length)}>›</button>
          </div>
        )}
      </div>
      <div className={`aug-canvas canvas-${style}`} style={{ minHeight: canvasHeight }}>
        {customMode && activeVariant?.customKind ? (
          <div ref={customRef} className="custom-visual-host">
            <CustomVisual kind={activeVariant.customKind} data={data} style={style} />
          </div>
        ) : (
          <div ref={containerRef} className="antv-canvas" />
        )}
      </div>
      {brand.footer?.trim() && <div className="aug-brand-footer">{brand.footer}</div>}
      {renderError && <p className="error-message">Rendu : {renderError}</p>}
    </div>
  );
}

function ProviderPicker({ value, onChange, providers }: { value: AIProvider; onChange: (value: AIProvider) => void; providers: ProviderStatus[] }) {
  const options: { value: AIProvider; label: string }[] = [
    { value: "auto", label: "Automatique" },
    { value: "vibe", label: "Vibe" },
    { value: "codex", label: "Codex" },
  ];
  return (
    <div className="aug-provider-grid">
      {options.map((option) => {
        const status = option.value === "auto" ? null : providers.find((item) => item.id === option.value);
        return (
          <button key={option.value} type="button" className={value === option.value ? "aug-choice active" : "aug-choice"} onClick={() => onChange(option.value)}>
            <span>{option.label}</span>
            <small>{option.value === "auto" ? "fallback intelligent" : status?.available ? "prêt" : status?.configured ? "indisponible" : "à configurer"}</small>
            {option.value !== "auto" && <i className={`aug-status-dot ${status?.available ? "ok" : status?.configured ? "warn" : "off"}`} />}
          </button>
        );
      })}
    </div>
  );
}

export function AugmentedStudio() {
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
  const [retouchTarget, setRetouchTarget] = useState<number | null>(null);
  const [retouchInstruction, setRetouchInstruction] = useState("");
  const [retouchLoading, setRetouchLoading] = useState(false);
  const [retouchHistory, setRetouchHistory] = useState<RetouchHistory | null>(null);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [projectName, setProjectName] = useState("Sans titre");
  const [createdAt, setCreatedAt] = useState(() => new Date().toISOString());
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [libraryVersion, setLibraryVersion] = useState(0);
  const [exporting, setExporting] = useState(false);
  const exporterRef = useRef<VisualExporter | null>(null);
  const library = useMemo(() => loadLibrary(), [libraryVersion]);
  const mermaid = useMemo(() => result ? buildMermaid(result) : "", [result]);
  const markdown = useMemo(() => result ? buildMarkdown(result, intent, brand) : "", [result, intent, brand]);
  const mindmap = useMemo(() => result ? buildMindmap(result) : null, [result]);
  const localReview = useMemo(() => result ? localQualityReview(result) : null, [result]);

  const registerExporter = useCallback((exporter: VisualExporter | null) => {
    exporterRef.current = exporter;
  }, []);

  useEffect(() => {
    void getProviders().then(setProviders).catch(() => setProviders([]));
  }, []);

  useEffect(() => {
    if (!result) return;
    setResult((current) => current ? {
      ...current,
      appearance: { ...current.appearance, accent: brand.accent, background: brand.background },
    } : current);
  }, [brand.id, brand.accent, brand.background]);

  useEffect(() => {
    if (!result || !projectId) return;
    const timer = window.setTimeout(() => {
      const now = new Date().toISOString();
      upsertLocalProject({
        id: projectId,
        name: projectName,
        createdAt,
        updatedAt: now,
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
      setView("infographic");
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
    setQuality(null);
  }

  function addItem(index: number) {
    if (!result || result.layout === "comparison" || result.items.length >= 8) return;
    const items = [...result.items];
    items.splice(index + 1, 0, {
      title: "Nouveau bloc",
      description: "À compléter.",
      blockType: "list",
      claimType: "interpretation",
    });
    setResult({ ...result, items });
  }

  function deleteItem(index: number) {
    if (!result || result.layout === "comparison" || result.items.length <= 2) return;
    setResult({ ...result, items: result.items.filter((_, itemIndex) => itemIndex !== index) });
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
      setRetouchTarget(null);
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
    const now = new Date().toISOString();
    return {
      id: projectId ?? crypto.randomUUID(),
      name: projectName === "Sans titre" ? result.title : projectName,
      createdAt,
      updatedAt: now,
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
        { name: `${base}/diagram.mmd`, data: mermaid },
        { name: `${base}/mindmap.json`, data: JSON.stringify(mindmap, null, 2) },
        { name: `${base}/sources.md`, data: buildSourcesMarkdown(result) },
        { name: `${base}/project.json`, data: JSON.stringify(project, null, 2) },
      ];

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

  function exportCurrentText() {
    if (!result) return;
    const base = safeSlug(result.title);
    if (view === "mermaid") downloadBlob(mermaid, "text/plain;charset=utf-8", `${base}.mmd`);
    if (view === "markdown") downloadBlob(markdown, "text/markdown;charset=utf-8", `${base}.md`);
    if (view === "mindmap") downloadBlob(JSON.stringify(mindmap, null, 2), "application/json;charset=utf-8", `${base}.mindmap.json`);
  }

  const activeQuality = quality ?? localReview;

  return (
    <main className="aug-app" style={{ "--aug-primary": brand.primary, "--aug-accent": brand.accent, "--aug-bg": brand.background, fontFamily: fontStacks[brand.fontFamily] } as CSSProperties}>
      <header className="aug-topbar">
        <div className="aug-logo">IL</div>
        <div className="aug-brand-title">
          <span>INFOGRAPHIC LAB</span>
          <strong>Augmented Studio</strong>
        </div>
        <div className="aug-top-actions">
          <button type="button" onClick={newProject}>Nouveau</button>
          <button type="button" onClick={() => setLibraryOpen((value) => !value)}>Projets <span className="aug-count">{library.length}</span></button>
          <span className="aug-preview-pill">PREVIEW · 3092</span>
        </div>
      </header>

      <section className="aug-hero">
        <div>
          <span className="aug-kicker">UNE IDÉE · PLUSIEURS REPRÉSENTATIONS</span>
          <h1>Comprendre, composer, vérifier, publier.</h1>
          <p>L'IA prépare la structure. Vous gardez la décision. Le même modèle alimente l'infographie, Mermaid, la mindmap et le Markdown.</p>
        </div>
        <div className="aug-project-chip">
          <small>PROJET ACTIF</small>
          <input value={projectName} onChange={(event) => setProjectName(event.target.value.slice(0, 120))} aria-label="Nom du projet" />
          <span>{meta ?? "prêt"}</span>
        </div>
      </section>

      {libraryOpen && (
        <section className="aug-library">
          <div className="aug-section-head"><div><span className="aug-kicker">BIBLIOTHÈQUE LOCALE</span><h2>Mes projets</h2></div><button type="button" onClick={() => setLibraryOpen(false)}>Fermer</button></div>
          {!library.length && <p className="aug-muted">Aucun projet local pour le moment.</p>}
          <div className="aug-library-grid">
            {library.map((record) => (
              <article key={record.id} className={record.id === projectId ? "aug-project-card active" : "aug-project-card"}>
                <div><strong>{record.name}</strong><small>{formatDate(record.updatedAt)} · {record.infographic.items.length} blocs</small></div>
                <div className="aug-card-actions">
                  <button type="button" onClick={() => loadProject(record)}>Ouvrir</button>
                  <button type="button" onClick={() => { duplicateLocalProject(record.id); setLibraryVersion((value) => value + 1); }}>Dupliquer</button>
                  <button type="button" onClick={() => { const name = window.prompt("Nouveau nom", record.name); if (name) { renameLocalProject(record.id, name); setLibraryVersion((value) => value + 1); } }}>Renommer</button>
                  <button type="button" onClick={() => { if (window.confirm(`Supprimer « ${record.name} » ?`)) { deleteLocalProject(record.id); setLibraryVersion((value) => value + 1); } }}>Supprimer</button>
                </div>
                {record.snapshots.length > 0 && (
                  <details><summary>{record.snapshots.length} version(s)</summary><div className="aug-version-list">{record.snapshots.map((snapshot, index) => <button key={snapshot.id} type="button" onClick={() => restoreSnapshot(record, index)}>{formatDate(snapshot.savedAt)} · restaurer</button>)}</div></details>
                )}
              </article>
            ))}
          </div>
        </section>
      )}

      <section className="aug-workspace">
        <aside className="aug-panel aug-brief-panel">
          <div className="aug-panel-head"><span>01</span><div><small>BRIEF</small><h2>Donnez la matière</h2></div></div>
          <label className="aug-label" htmlFor="aug-source">Idée / contenu source</label>
          <textarea id="aug-source" value={sourceText} onChange={(event) => setSourceText(event.target.value)} maxLength={12000} placeholder="Collez le contenu à expliquer, décider, convaincre, former ou synthétiser…" />
          <div className="aug-counter">{sourceText.length.toLocaleString("fr-FR")} / 12 000</div>

          <span className="aug-label">Objectif</span>
          <div className="aug-intent-grid">
            {intentOptions.map((option) => <button key={option.value} type="button" className={intent === option.value ? "aug-choice active" : "aug-choice"} onClick={() => setIntent(option.value)}><span>{option.label}</span><small>{option.hint}</small></button>)}
          </div>

          <span className="aug-label">Moteur IA</span>
          <ProviderPicker value={provider} onChange={setProvider} providers={providers} />

          <div className="aug-two-cols">
            <label>Structure<select value={type} onChange={(event) => setType(event.target.value as InfographicKind)}>{layoutOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
            <label>Style<select value={style} onChange={(event) => setStyle(event.target.value as InfographicStyle)}>{styleOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
          </div>

          <button type="button" className="aug-primary-button" disabled={loading} onClick={() => void handleGenerate()}>{loading ? "Structuration…" : result ? "Régénérer le modèle" : "Construire le modèle"}</button>
          {error && <p className="aug-error">{error}</p>}
          {warnings.map((warning) => <p key={warning} className="aug-warning">{warning}</p>)}
        </aside>

        <section className="aug-panel aug-structure-panel">
          <div className="aug-panel-head"><span>02</span><div><small>MODÈLE D'IDÉE</small><h2>Composez la structure</h2></div></div>
          {!result ? <div className="aug-empty"><strong>Le modèle partagé apparaîtra ici.</strong><span>Il deviendra la source de vérité de toutes les représentations.</span></div> : (
            <>
              <div className="aug-global-fields">
                <label>Titre<input value={result.title} onChange={(event) => setResult({ ...result, title: event.target.value.slice(0, 120) })} /></label>
                <label>Sous-titre<input value={result.subtitle ?? ""} onChange={(event) => setResult({ ...result, subtitle: event.target.value.slice(0, 180) || undefined })} /></label>
              </div>
              <div className="aug-block-list">
                {result.items.map((item, index) => (
                  <article key={`${index}-${item.title}`} className="aug-block-card">
                    <div className="aug-block-head"><span className="aug-block-number">{String(index + 1).padStart(2, "0")}</span><div className="aug-block-actions"><button type="button" onClick={() => moveItem(index, -1)} disabled={index === 0}>↑</button><button type="button" onClick={() => moveItem(index, 1)} disabled={index === result.items.length - 1}>↓</button><button type="button" onClick={() => addItem(index)} disabled={result.layout === "comparison" || result.items.length >= 8}>＋</button><button type="button" onClick={() => deleteItem(index)} disabled={result.layout === "comparison" || result.items.length <= 2}>×</button></div></div>
                    <input className="aug-block-title" value={item.title} maxLength={60} onChange={(event) => updateItem(index, { title: event.target.value })} />
                    <textarea className="aug-block-description" value={item.description} maxLength={180} onChange={(event) => updateItem(index, { description: event.target.value })} />
                    <div className="aug-block-meta">
                      <label>Bloc<select value={item.blockType ?? "list"} onChange={(event) => updateItem(index, { blockType: event.target.value as BlockKind })}>{blockOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
                      <label>Statut<select value={item.claimType ?? "interpretation"} onChange={(event) => updateItem(index, { claimType: event.target.value as ClaimKind })}>{claimOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
                    </div>
                    {item.claimType === "fact" && <label className="aug-evidence">Preuve source<input value={item.evidence ?? ""} maxLength={260} onChange={(event) => updateItem(index, { evidence: event.target.value || undefined })} placeholder="Extrait exact du texte source" /></label>}
                    <button type="button" className="aug-ai-button" onClick={() => { setRetouchTarget(index); setRetouchInstruction(""); }}>Retoucher ce bloc avec l'IA</button>
                    {retouchTarget === index && <div className="aug-retouch"><input value={retouchInstruction} onChange={(event) => setRetouchInstruction(event.target.value.slice(0, 500))} placeholder="Ex. simplifie, rends plus exécutif, fusionne l'idée…" /><button type="button" disabled={retouchLoading} onClick={() => void handleRetouch(index)}>{retouchLoading ? "…" : "Appliquer"}</button><button type="button" onClick={() => setRetouchTarget(null)}>Annuler</button></div>}
                  </article>
                ))}
              </div>
              {retouchHistory && <button type="button" className="aug-undo" onClick={undoRetouch}>↶ Annuler la dernière retouche IA</button>}
            </>
          )}
        </section>

        <section className="aug-panel aug-output-panel">
          <div className="aug-panel-head"><span>03</span><div><small>REPRÉSENTATION</small><h2>Exprimez la même idée</h2></div></div>
          <div className="aug-tabs">{viewOptions.map((option) => <button key={option.value} type="button" className={view === option.value ? "active" : ""} onClick={() => setView(option.value)} disabled={!result}>{option.label}</button>)}</div>
          {!result ? <div className="aug-empty"><strong>Une idée, plusieurs lectures.</strong><span>Infographie, diagramme, mindmap et document partageront le même modèle.</span></div> : (
            <div className="aug-output-content">
              {view === "infographic" && <InfographicPreview data={result} style={style} brand={brand} variantIndex={variantIndex} onVariantIndexChange={setVariantIndex} onExporter={registerExporter} />}
              {view === "mermaid" && <div className="aug-code-view"><div className="aug-diagram-preview"><div className="aug-diagram-root">{result.title}</div>{result.items.map((item, index) => <div key={index} className="aug-diagram-node"><span>{index + 1}</span><strong>{item.title}</strong><small>{item.description}</small></div>)}</div><pre>{mermaid}</pre></div>}
              {view === "mindmap" && <div className="aug-mindmap"><div className="aug-mind-root"><strong>{mindmap?.title}</strong><small>{mindmap?.subtitle}</small></div><div className="aug-mind-branches">{result.items.map((item, index) => <article key={index}><span>{item.blockType}</span><strong>{item.title}</strong><small>{item.description}</small></article>)}</div></div>}
              {view === "markdown" && <div className="aug-markdown-view"><pre>{markdown}</pre></div>}
            </div>
          )}

          {result && <div className="aug-export-bar">{view === "infographic" ? <><button type="button" onClick={() => void exportSvg()}>SVG</button><button type="button" onClick={() => void exportPng()}>PNG</button></> : <button type="button" onClick={exportCurrentText}>Exporter {view === "mermaid" ? ".mmd" : view === "markdown" ? ".md" : "JSON"}</button>}<button type="button" className="aug-pack-button" disabled={exporting} onClick={() => void exportPack()}>{exporting ? "Pack…" : "Publication Pack ZIP"}</button></div>}
        </section>
      </section>

      {result && (
        <section className="aug-bottom-grid">
          <article className="aug-panel aug-brand-panel">
            <div className="aug-panel-head"><span>04</span><div><small>IDENTITÉ</small><h2>Votre signature visuelle</h2></div></div>
            <label className="aug-label">Profil<select value={brand.id} onChange={(event) => { const selected = brands.find((item) => item.id === event.target.value); if (selected) setBrand(selected); }}>{brands.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
            <div className="aug-brand-form">
              <label>Nom<input value={brand.name} onChange={(event) => setBrand({ ...brand, name: event.target.value.slice(0, 80) })} /></label>
              <label>Principale<input type="color" value={brand.primary} onChange={(event) => setBrand({ ...brand, primary: event.target.value })} /></label>
              <label>Accent<input type="color" value={brand.accent} onChange={(event) => setBrand({ ...brand, accent: event.target.value })} /></label>
              <label>Fond<input type="color" value={brand.background} onChange={(event) => setBrand({ ...brand, background: event.target.value })} /></label>
              <label>Typographie<select value={brand.fontFamily} onChange={(event) => setBrand({ ...brand, fontFamily: event.target.value as BrandProfile["fontFamily"] })}><option value="system">Sans serif</option><option value="serif">Serif</option><option value="mono">Mono</option></select></label>
              <label>Footer<input value={brand.footer ?? ""} onChange={(event) => setBrand({ ...brand, footer: event.target.value.slice(0, 120) })} /></label>
              <label className="aug-logo-input">Logo<input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" onChange={(event) => handleLogo(event.target.files?.[0] ?? null)} /></label>
            </div>
            <button type="button" className="aug-secondary-button" onClick={saveBrand}>{defaultBrands.some((item) => item.id === brand.id) ? "Créer mon profil" : "Enregistrer le profil"}</button>
          </article>

          <article className="aug-panel aug-quality-panel">
            <div className="aug-panel-head"><span>05</span><div><small>QUALITY GATE</small><h2>Vérifiez avant de publier</h2></div></div>
            {activeQuality && <div className="aug-quality-score"><strong>{activeQuality.score}</strong><span>/ 100</span><p>{activeQuality.summary}</p></div>}
            <button type="button" className="aug-secondary-button" disabled={qualityLoading} onClick={() => void handleQualityReview()}>{qualityLoading ? "Analyse…" : "Analyser avec le moteur IA"}</button>
            {qualityError && <p className="aug-warning">{qualityError} · contrôle local affiché.</p>}
            <div className="aug-issue-list">{activeQuality?.issues.map((issue, index) => <div key={`${issue.message}-${index}`} className={`aug-issue ${issue.severity}`}><span>{issue.category}</span><strong>{issue.message}</strong>{issue.suggestion && <small>{issue.suggestion}</small>}{issue.itemIndex !== undefined && (issue.proposedTitle || issue.proposedDescription) && <button type="button" onClick={() => applyQualityIssue(issue)}>Appliquer la correction proposée</button>}</div>)}</div>
          </article>
        </section>
      )}

      <footer className="aug-footer"><span>Infographic Lab · Augmented Preview</span><span>Local-first · Provider Gateway · humain décisionnaire</span></footer>
    </main>
  );
}
