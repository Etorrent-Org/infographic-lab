import { Infographic } from "@antv/infographic";
import { type ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { buildAntvOptions, getAntvVariants } from "./antv";
import { CustomVisual } from "./CustomVisual";
import {
  buildStandaloneHtml,
  downloadBlob,
  downloadHref,
  htmlFileName,
  safeFilenameBase,
  svgDataUrlToPng,
  svgElementToDataUrl,
} from "./project";
import type { CanonicalInfographic, InfographicItem, InfographicStyle } from "./types";

type RetouchHistory = {
  itemIndex: number;
  before: InfographicItem;
  after: InfographicItem;
};

type StructureAction = "move-prev" | "move-next" | "add-after" | "delete";

const layoutOptions: { value: CanonicalInfographic["layout"]; label: string }[] = [
  { value: "process", label: "Processus" },
  { value: "timeline", label: "Timeline" },
  { value: "list", label: "Liste" },
  { value: "comparison", label: "Comparaison" },
];

type Props = {
  data: CanonicalInfographic | null;
  style: InfographicStyle;
  resetKey: number;
  busy: boolean;
  variantIndex: number;
  onVariantIndexChange: (next: number) => void;
  onNewProject: () => boolean;
  onSaveProject: () => void;
  onOpenProject: (file: File) => Promise<void> | void;
  projectError: string | null;
  projectMeta: string | null;
  onRegenerateItem: (itemIndex: number, instruction: string) => Promise<void> | void;
  regeneratingIndex: number | null;
  regenerationError: string | null;
  regenerationMeta: string | null;
  retouchHistory: RetouchHistory | null;
  onUndoRetouch: () => void;
  onStructureChange: (next: CanonicalInfographic) => void;
  onItemEdit: (itemIndex: number, nextItem: InfographicItem) => void;
  onInfographicEdit: (next: CanonicalInfographic) => void;
};

function getCanvasHeight(data: CanonicalInfographic | null) {
  if (!data) return 650;
  if (data.layout === "timeline") {
    return Math.max(650, 260 + data.items.length * 90);
  }
  if (data.layout === "process" && data.items.length > 4) {
    return 780;
  }
  if (data.layout === "list" && data.items.length > 4) {
    return 720;
  }
  return 650;
}

export function InfographicCanvas({
  data,
  style,
  resetKey,
  busy,
  variantIndex,
  onVariantIndexChange,
  onNewProject,
  onSaveProject,
  onOpenProject,
  projectError,
  projectMeta,
  onRegenerateItem,
  regeneratingIndex,
  regenerationError,
  regenerationMeta,
  retouchHistory,
  onUndoRetouch,
  onStructureChange,
  onItemEdit,
  onInfographicEdit,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const customVisualRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<Infographic | null>(null);
  const projectInputRef = useRef<HTMLInputElement>(null);
  const actionMenuRef = useRef<HTMLDetailsElement>(null);
  const [renderError, setRenderError] = useState<string | null>(null);
  const [exporting, setExporting] = useState<"svg" | "png" | "html" | null>(null);
  const [selectedItemIndex, setSelectedItemIndex] = useState(0);
  const [instruction, setInstruction] = useState("");
  const [manualTitle, setManualTitle] = useState("");
  const [manualDescription, setManualDescription] = useState("");
  const [globalTitle, setGlobalTitle] = useState("");
  const [globalSubtitle, setGlobalSubtitle] = useState("");
  const [globalLayout, setGlobalLayout] = useState<CanonicalInfographic["layout"]>("list");
  const canvasHeight = useMemo(() => getCanvasHeight(data), [data]);
  const variants = useMemo(() => (data ? getAntvVariants(data) : []), [data]);
  const safeVariantIndex = variants.length
    ? ((variantIndex % variants.length) + variants.length) % variants.length
    : 0;
  const activeVariant = variants[safeVariantIndex];
  const customMode = activeVariant?.engine === "custom" && Boolean(activeVariant.customKind);
  const selectedItem = data?.items[selectedItemIndex] ?? null;
  const retouchChanged = retouchHistory
    ? retouchHistory.before.title !== retouchHistory.after.title ||
      retouchHistory.before.description !== retouchHistory.after.description
    : false;
  const isComparison = data?.layout === "comparison";
  const itemCount = data?.items.length ?? 0;
  const manualDirty = selectedItem
    ? manualTitle !== selectedItem.title || manualDescription !== selectedItem.description
    : false;
  const manualValid = manualTitle.trim().length > 0 && manualDescription.trim().length > 0;
  const globalDirty = data
    ? globalTitle !== data.title ||
      globalSubtitle !== (data.subtitle ?? "") ||
      globalLayout !== data.layout
    : false;
  const comparisonBlocked = globalLayout === "comparison" && itemCount !== 2;
  const globalValid = globalTitle.trim().length > 0 && !comparisonBlocked;

  useEffect(() => {
    setSelectedItemIndex(0);
    setInstruction("");
  }, [resetKey]);

  useEffect(() => {
    if (variants.length && variantIndex !== safeVariantIndex) {
      onVariantIndexChange(safeVariantIndex);
    }
  }, [variantIndex, safeVariantIndex, variants.length, onVariantIndexChange]);

  useEffect(() => {
    const count = data?.items.length ?? 0;
    if (!count) {
      setSelectedItemIndex(0);
      return;
    }
    setSelectedItemIndex((current) => Math.min(current, count - 1));
  }, [data?.items.length]);

  useEffect(() => {
    setManualTitle(selectedItem?.title ?? "");
    setManualDescription(selectedItem?.description ?? "");
  }, [selectedItemIndex, selectedItem?.title, selectedItem?.description, resetKey]);

  useEffect(() => {
    if (!data) {
      setGlobalTitle("");
      setGlobalSubtitle("");
      setGlobalLayout("list");
      return;
    }
    setGlobalTitle(data.title);
    setGlobalSubtitle(data.subtitle ?? "");
    setGlobalLayout(data.layout);
  }, [data?.title, data?.subtitle, data?.layout, resetKey]);

  useEffect(() => {
    instanceRef.current?.destroy();
    instanceRef.current = null;
    setRenderError(null);

    if (!data || customMode || !containerRef.current) return;

    try {
      const infographic = new Infographic({
        ...buildAntvOptions(data, style, safeVariantIndex),
        container: containerRef.current,
        width: "100%",
        height: canvasHeight,
        padding: 44,
        editable: true,
      });
      infographic.on("error", (error) => {
        setRenderError(error instanceof Error ? error.message : "Erreur de rendu AntV.");
      });
      infographic.render();
      instanceRef.current = infographic;
    } catch (error) {
      setRenderError(error instanceof Error ? error.message : "Erreur de rendu AntV.");
    }

    return () => {
      instanceRef.current?.destroy();
      instanceRef.current = null;
    };
  }, [data, style, canvasHeight, safeVariantIndex, customMode]);

  function cycleVariant(delta: number) {
    if (variants.length < 2) return;
    onVariantIndexChange((safeVariantIndex + delta + variants.length) % variants.length);
  }

  function selectItem(index: number) {
    if (regeneratingIndex !== null) return;
    setSelectedItemIndex(index);
    setInstruction("");
  }

  function applyGlobalEdit() {
    if (!data || regeneratingIndex !== null || !globalDirty || !globalValid) return;
    const cleanSubtitle = globalSubtitle.trim();
    const next: CanonicalInfographic = {
      title: globalTitle.trim(),
      layout: globalLayout,
      items: data.items,
      ...(cleanSubtitle ? { subtitle: cleanSubtitle } : {}),
    };
    onInfographicEdit(next);
    setGlobalTitle(next.title);
    setGlobalSubtitle(next.subtitle ?? "");
    setGlobalLayout(next.layout);
  }

  function applyManualEdit() {
    if (!selectedItem || regeneratingIndex !== null || !manualDirty || !manualValid) return;
    const nextItem = {
      title: manualTitle.trim(),
      description: manualDescription.trim(),
    };
    onItemEdit(selectedItemIndex, nextItem);
    setManualTitle(nextItem.title);
    setManualDescription(nextItem.description);
  }

  function manageStructure(action: StructureAction) {
    if (!data || regeneratingIndex !== null) return;
    const currentIndex = selectedItemIndex;
    if (currentIndex < 0 || currentIndex >= data.items.length) return;

    const nextItems = data.items.map((item) => ({ ...item }));
    let nextSelectedIndex = currentIndex;

    if (action === "move-prev") {
      if (currentIndex === 0) return;
      [nextItems[currentIndex - 1], nextItems[currentIndex]] = [
        nextItems[currentIndex],
        nextItems[currentIndex - 1],
      ];
      nextSelectedIndex = currentIndex - 1;
    }

    if (action === "move-next") {
      if (currentIndex >= nextItems.length - 1) return;
      [nextItems[currentIndex], nextItems[currentIndex + 1]] = [
        nextItems[currentIndex + 1],
        nextItems[currentIndex],
      ];
      nextSelectedIndex = currentIndex + 1;
    }

    if (action === "add-after") {
      if (isComparison || nextItems.length >= 8) return;
      nextItems.splice(currentIndex + 1, 0, {
        title: "Nouveau bloc",
        description: "À compléter manuellement ou avec Vibe.",
      });
      nextSelectedIndex = currentIndex + 1;
    }

    if (action === "delete") {
      if (isComparison || nextItems.length <= 2) return;
      nextItems.splice(currentIndex, 1);
      nextSelectedIndex = Math.min(currentIndex, nextItems.length - 1);
    }

    onStructureChange({ ...data, items: nextItems });
    setSelectedItemIndex(nextSelectedIndex);
    setInstruction("");
  }

  async function getCurrentSvgDataUrl() {
    if (customMode) {
      const svg = customVisualRef.current?.querySelector("svg");
      if (!(svg instanceof SVGSVGElement)) {
        throw new Error("SVG local indisponible.");
      }
      return svgElementToDataUrl(svg);
    }

    const infographic = instanceRef.current;
    if (!infographic) throw new Error("Rendu AntV indisponible.");
    return infographic.toDataURL({ type: "svg", embedResources: true });
  }

  async function exportVisual(type: "svg" | "png" | "html") {
    if (!data) return;
    setExporting(type);
    setRenderError(null);
    try {
      const svgDataUrl = await getCurrentSvgDataUrl();

      if (type === "html") {
        const html = buildStandaloneHtml({
          svgDataUrl,
          title: data.title,
          subtitle: data.subtitle,
          style,
        });
        downloadBlob(html, "text/html;charset=utf-8", htmlFileName(data.title));
        return;
      }

      if (type === "svg") {
        downloadHref(svgDataUrl, `${safeFilenameBase(data.title)}.svg`);
        return;
      }

      const url = customMode
        ? await svgDataUrlToPng(svgDataUrl, 2)
        : await instanceRef.current!.toDataURL({ type: "png", dpr: 2 });
      downloadHref(url, `${safeFilenameBase(data.title)}.png`);
    } catch (error) {
      setRenderError(error instanceof Error ? `Export : ${error.message}` : "L'export a échoué.");
    } finally {
      setExporting(null);
    }
  }

  function closeActionMenu() {
    if (actionMenuRef.current) {
      actionMenuRef.current.open = false;
    }
  }

  function handleNewProjectClick() {
    if (onNewProject()) {
      closeActionMenu();
    }
  }

  function handleSaveProjectClick() {
    onSaveProject();
    closeActionMenu();
  }

  function handleOpenProjectClick() {
    closeActionMenu();
    projectInputRef.current?.click();
  }

  function handleExportClick(type: "svg" | "png" | "html") {
    closeActionMenu();
    void exportVisual(type);
  }

  function handleProjectFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0] ?? null;
    event.currentTarget.value = "";
    if (file) {
      void onOpenProject(file);
    }
  }

  return (
    <section className="preview-card" aria-live="polite">
      <div className="preview-head">
        <div>
          <span className="eyebrow">APERÇU</span>
          <h2>{data ? data.title : "Votre infographie apparaîtra ici"}</h2>
        </div>
        <div className="preview-actions">
          {data && variants.length > 1 && activeVariant && (
            <div className="variant-control" title="Change la mise en page sans relancer Vibe">
              <button
                type="button"
                className="variant-arrow"
                aria-label="Variante précédente"
                onClick={() => cycleVariant(-1)}
              >
                ‹
              </button>
              <div className="variant-copy">
                <span>VARIANTE</span>
                <strong>{activeVariant.label}</strong>
                <small>{safeVariantIndex + 1}/{variants.length}</small>
              </div>
              <button
                type="button"
                className="variant-arrow"
                aria-label="Variante suivante"
                onClick={() => cycleVariant(1)}
              >
                ›
              </button>
            </div>
          )}

          <details ref={actionMenuRef} className="project-menu">
            <summary
              className="project-menu-trigger"
              aria-disabled={busy}
              onClick={(event) => {
                if (busy) event.preventDefault();
              }}
            >
              <span>Projet</span>
              <span className="project-menu-chevron" aria-hidden="true">⌄</span>
            </summary>

            <div className="project-menu-panel">
              <div className="project-menu-section">
                <span className="project-menu-label">PROJET</span>
                <button
                  type="button"
                  className="project-menu-item"
                  disabled={busy}
                  onClick={handleNewProjectClick}
                >
                  <span>Nouveau</span>
                  <small>projet vierge</small>
                </button>
                <button
                  type="button"
                  className="project-menu-item"
                  disabled={busy}
                  onClick={handleOpenProjectClick}
                >
                  <span>Ouvrir JSON…</span>
                  <small>reprendre</small>
                </button>
                <button
                  type="button"
                  className="project-menu-item"
                  disabled={!data || busy}
                  onClick={handleSaveProjectClick}
                >
                  <span>Sauvegarder JSON</span>
                  <small>projet éditable</small>
                </button>
              </div>

              <div className="project-menu-section visual-section">
                <span className="project-menu-label">VISUELS</span>
                <button
                  type="button"
                  className="project-menu-item"
                  disabled={!data || exporting !== null || busy}
                  onClick={() => handleExportClick("svg")}
                >
                  <span>{exporting === "svg" ? "Export…" : "Exporter SVG"}</span>
                  <small>vectoriel</small>
                </button>
                <button
                  type="button"
                  className="project-menu-item"
                  disabled={!data || exporting !== null || busy}
                  onClick={() => handleExportClick("png")}
                >
                  <span>{exporting === "png" ? "Export…" : "Exporter PNG"}</span>
                  <small>image</small>
                </button>
                <button
                  type="button"
                  className="project-menu-item"
                  disabled={!data || exporting !== null || busy}
                  onClick={() => handleExportClick("html")}
                >
                  <span>{exporting === "html" ? "Export…" : "Exporter HTML"}</span>
                  <small>autonome</small>
                </button>
              </div>
            </div>
          </details>

          <input
            ref={projectInputRef}
            className="project-file-input"
            type="file"
            accept=".json,application/json"
            onChange={handleProjectFileChange}
          />
        </div>
      </div>

      {projectMeta && <p className="project-status">{projectMeta}</p>}
      {projectError && <p className="project-status error">{projectError}</p>}

      <div className={`canvas-shell canvas-${style}`} style={{ minHeight: canvasHeight }}>
        {!data && (
          <div className="empty-state">
            <div className="enso">○</div>
            <strong>Une idée, puis un visuel.</strong>
            <span>Le rendu reste local dans votre navigateur.</span>
          </div>
        )}
        {data && customMode && activeVariant?.customKind ? (
          <div ref={customVisualRef} className="custom-visual-host">
            <CustomVisual kind={activeVariant.customKind} data={data} style={style} />
          </div>
        ) : (
          <div ref={containerRef} className="antv-canvas" />
        )}
      </div>
      {renderError && <p className="error-message">Rendu : {renderError}</p>}

      {data && (
        <div className="global-editor">
          <div className="global-editor-head">
            <div>
              <span className="eyebrow">ÉDITION DE L'INFOGRAPHIE</span>
              <strong>Titre, sous-titre et type de visuel</strong>
            </div>
            <span className="retouch-cost">0 appel Vibe</span>
          </div>

          <div className="global-editor-grid">
            <div className="global-editor-fields">
              <label htmlFor="global-title">Titre</label>
              <input
                id="global-title"
                value={globalTitle}
                onChange={(event) => setGlobalTitle(event.target.value)}
                maxLength={120}
                disabled={regeneratingIndex !== null}
              />

              <label htmlFor="global-subtitle">Sous-titre <small>optionnel</small></label>
              <textarea
                id="global-subtitle"
                value={globalSubtitle}
                onChange={(event) => setGlobalSubtitle(event.target.value)}
                maxLength={180}
                placeholder="Ajoutez un contexte court, ou laissez vide."
                disabled={regeneratingIndex !== null}
              />
            </div>

            <div className="global-layout-editor">
              <div className="global-layout-head">
                <span>TYPE / LAYOUT</span>
                <small>{itemCount} bloc{itemCount > 1 ? "s" : ""}</small>
              </div>
              <div className="global-layout-options">
                {layoutOptions.map((option) => {
                  const blocked = option.value === "comparison" && itemCount !== 2;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      className={globalLayout === option.value ? "global-layout-button active" : "global-layout-button"}
                      onClick={() => setGlobalLayout(option.value)}
                      disabled={regeneratingIndex !== null || blocked}
                      title={blocked ? "Comparaison disponible uniquement avec exactement deux blocs" : undefined}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
              <small className="global-layout-note">
                {itemCount === 2
                  ? "Le layout change sans toucher aux deux blocs existants."
                  : "Comparaison nécessite exactement 2 blocs pour éviter toute perte de contenu."}
              </small>
            </div>
          </div>

          <div className="global-editor-action-row">
            <small>Les blocs, le style et la variante active restent inchangés.</small>
            <button
              type="button"
              className="button button-primary"
              onClick={applyGlobalEdit}
              disabled={regeneratingIndex !== null || !globalDirty || !globalValid}
            >
              Appliquer à l'infographie
            </button>
          </div>
        </div>
      )}

      {data && selectedItem && (
        <div className="retouch-panel">
          <div className="retouch-head">
            <div>
              <span className="eyebrow">ÉDITION DU BLOC</span>
              <strong>Modifier, structurer ou réécrire</strong>
            </div>
            <span className="retouch-cost">manuel 0 · Vibe 1 appel</span>
          </div>

          <div className="retouch-items" aria-label="Choisir le bloc à modifier">
            {data.items.map((item, index) => (
              <button
                key={`${index}-${item.title}`}
                type="button"
                className={selectedItemIndex === index ? "retouch-item active" : "retouch-item"}
                onClick={() => selectItem(index)}
                disabled={regeneratingIndex !== null}
              >
                <small>{String(index + 1).padStart(2, "0")}</small>
                <span>{item.title}</span>
              </button>
            ))}
          </div>

          <div className="retouch-compose">
            <div className="retouch-target">
              <span>BLOC SÉLECTIONNÉ</span>

              <div className="manual-editor">
                <div className="manual-editor-head">
                  <span>ÉDITION MANUELLE</span>
                  <small>0 appel Vibe</small>
                </div>
                <label htmlFor="manual-title">Titre</label>
                <input
                  id="manual-title"
                  className="manual-title"
                  value={manualTitle}
                  onChange={(event) => setManualTitle(event.target.value)}
                  maxLength={60}
                  disabled={regeneratingIndex !== null}
                />
                <label htmlFor="manual-description">Texte</label>
                <textarea
                  id="manual-description"
                  className="manual-description"
                  value={manualDescription}
                  onChange={(event) => setManualDescription(event.target.value)}
                  maxLength={180}
                  disabled={regeneratingIndex !== null}
                />
                <button
                  type="button"
                  className="block-manager-button manual-apply"
                  onClick={applyManualEdit}
                  disabled={regeneratingIndex !== null || !manualDirty || !manualValid}
                >
                  Appliquer au visuel
                </button>
                <small className="manual-editor-note">
                  Modifie uniquement ce bloc et le rendu, sans appel IA.
                </small>
              </div>

              <div className="block-manager">
                <div className="block-manager-head">
                  <span>STRUCTURE</span>
                  <small>{itemCount} bloc{itemCount > 1 ? "s" : ""}</small>
                </div>
                <div className="block-manager-actions">
                  <button
                    type="button"
                    className="block-manager-button"
                    onClick={() => manageStructure("move-prev")}
                    disabled={regeneratingIndex !== null || selectedItemIndex === 0}
                    title="Déplacer ce bloc avant le précédent"
                  >
                    ← Avant
                  </button>
                  <button
                    type="button"
                    className="block-manager-button"
                    onClick={() => manageStructure("move-next")}
                    disabled={regeneratingIndex !== null || selectedItemIndex >= itemCount - 1}
                    title="Déplacer ce bloc après le suivant"
                  >
                    Après →
                  </button>
                  <button
                    type="button"
                    className="block-manager-button add"
                    onClick={() => manageStructure("add-after")}
                    disabled={regeneratingIndex !== null || isComparison || itemCount >= 8}
                    title={isComparison ? "Une comparaison reste limitée à deux options" : "Ajouter un bloc juste après"}
                  >
                    + Ajouter
                  </button>
                  <button
                    type="button"
                    className="block-manager-button danger"
                    onClick={() => manageStructure("delete")}
                    disabled={regeneratingIndex !== null || isComparison || itemCount <= 2}
                    title={isComparison ? "Une comparaison doit conserver deux options" : "Supprimer le bloc sélectionné"}
                  >
                    Supprimer
                  </button>
                </div>
                <small className="block-manager-note">
                  {isComparison
                    ? "Comparaison : deux options fixes. Vous pouvez seulement inverser leur ordre."
                    : "2 à 8 blocs · ajout, suppression et ordre sans appel Vibe."}
                </small>
              </div>
            </div>
            <div className="retouch-request">
              <label htmlFor="retouch-instruction">Instruction IA facultative</label>
              <textarea
                id="retouch-instruction"
                className="retouch-instruction"
                value={instruction}
                onChange={(event) => setInstruction(event.target.value)}
                maxLength={500}
                placeholder="Ex. plus concret, plus court, davantage orienté action…"
                disabled={regeneratingIndex !== null}
              />
              <div className="retouch-action-row">
                <small>Vibe réécrit seulement le bloc sélectionné.</small>
                <button
                  type="button"
                  className="button button-primary"
                  disabled={regeneratingIndex !== null}
                  onClick={() => void onRegenerateItem(selectedItemIndex, instruction)}
                >
                  {regeneratingIndex === selectedItemIndex ? "Réécriture…" : "Réécrire avec Vibe"}
                </button>
              </div>
            </div>
          </div>

          {regenerationMeta && <p className="generation-meta retouch-meta">{regenerationMeta}</p>}
          {regenerationError && <p className="error-message">{regenerationError}</p>}

          {retouchHistory && (
            <div className="retouch-result">
              <div className="retouch-result-head">
                <div className="retouch-result-title">
                  <span className={retouchChanged ? "retouch-result-status changed" : "retouch-result-status"}>
                    {retouchChanged ? "✓ MODIFICATION APPLIQUÉE" : "AUCUN CHANGEMENT VISIBLE"}
                  </span>
                  <strong>
                    {retouchChanged
                      ? `Bloc ${String(retouchHistory.itemIndex + 1).padStart(2, "0")} réécrit par Vibe`
                      : `Vibe n'a pas modifié le bloc ${String(retouchHistory.itemIndex + 1).padStart(2, "0")}`}
                  </strong>
                </div>
                <button
                  type="button"
                  className="button button-ghost undo-button"
                  onClick={onUndoRetouch}
                  disabled={regeneratingIndex !== null}
                >
                  Annuler
                </button>
              </div>

              <div className="retouch-diff">
                <div className="retouch-diff-card before">
                  <span>AVANT</span>
                  <strong>{retouchHistory.before.title}</strong>
                  <p>{retouchHistory.before.description}</p>
                </div>
                <div className="retouch-diff-arrow" aria-hidden="true">→</div>
                <div className="retouch-diff-card after">
                  <span>APRÈS</span>
                  <strong>{retouchHistory.after.title}</strong>
                  <p>{retouchHistory.after.description}</p>
                </div>
              </div>

              <p className="retouch-result-note">
                Annuler restaure uniquement ce bloc, sans nouvel appel Vibe et sans changer la variante.
              </p>
            </div>
          )}
        </div>
      )}

      {data && (
        <p className="edit-hint">
          Variante = même contenu, sans nouvel appel IA. HTML exporte le rendu affiché ; JSON sauvegarde le projet éditable.
        </p>
      )}
    </section>
  );
}