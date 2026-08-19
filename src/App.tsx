import { FormEvent, useMemo, useState } from "react";
import { generateInfographic, regenerateInfographicItem } from "./api";
import { InfographicCanvas } from "./InfographicCanvas";
import { StudioControls } from "./StudioControls";
import {
  createInfographicProject,
  downloadBlob,
  MAX_PROJECT_FILE_BYTES,
  parseInfographicProject,
  projectFileName,
  projectStateFingerprint,
} from "./project";
import { getStudioTemplate } from "./templates";
import type {
  CanonicalInfographic,
  InfographicAppearance,
  InfographicIcon,
  InfographicItem,
  InfographicKind,
  InfographicStyle,
} from "./types";

const types: { value: InfographicKind; label: string }[] = [
  { value: "auto", label: "Auto" },
  { value: "process", label: "Processus" },
  { value: "comparison", label: "Comparaison" },
  { value: "timeline", label: "Timeline" },
  { value: "list", label: "Liste" },
];

const styles: { value: InfographicStyle; label: string }[] = [
  { value: "clean", label: "Clean" },
  { value: "soft", label: "Soft" },
  { value: "dark", label: "Dark" },
  { value: "sketch", label: "Sketch" },
  { value: "chalk", label: "Chalk" },
];

type RetouchHistory = {
  itemIndex: number;
  before: InfographicItem;
  after: InfographicItem;
};

export function App() {
  const [text, setText] = useState("");
  const [type, setType] = useState<InfographicKind>("auto");
  const [style, setStyle] = useState<InfographicStyle>("clean");
  const [result, setResult] = useState<CanonicalInfographic | null>(null);
  const [variantIndex, setVariantIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<string | null>(null);
  const [generationKey, setGenerationKey] = useState(0);
  const [regeneratingIndex, setRegeneratingIndex] = useState<number | null>(null);
  const [regenerationError, setRegenerationError] = useState<string | null>(null);
  const [regenerationMeta, setRegenerationMeta] = useState<string | null>(null);
  const [retouchHistory, setRetouchHistory] = useState<RetouchHistory | null>(null);
  const [projectError, setProjectError] = useState<string | null>(null);
  const [projectMeta, setProjectMeta] = useState<string | null>(null);
  const [activeFileName, setActiveFileName] = useState<string | null>(null);
  const [savedFingerprint, setSavedFingerprint] = useState<string | null>(null);
  const busy = loading || regeneratingIndex !== null;

  const currentFingerprint = useMemo(
    () =>
      result
        ? projectStateFingerprint({ sourceText: text, type, style, variantIndex, infographic: result })
        : null,
    [text, type, style, variantIndex, result],
  );

  const dirty = result
    ? savedFingerprint === null || savedFingerprint !== currentFingerprint
    : text.trim().length > 0;
  const hasWork = result !== null || text.trim().length > 0;
  const activeProjectName = activeFileName ?? (result ? projectFileName(result.title) : "Sans projet");
  const projectState = !hasWork
    ? "Prêt"
    : !result
      ? "Brouillon"
      : dirty
        ? activeFileName
          ? "Modifié"
          : "Non enregistré"
        : "Enregistré";
  const projectStateClass = !hasWork ? "" : dirty ? "dirty" : "saved";

  async function handleGenerate(event?: FormEvent) {
    event?.preventDefault();
    const cleanText = text.trim();
    if (cleanText.length < 10) {
      setError("Décrivez un peu plus l'idée à visualiser.");
      return;
    }

    setLoading(true);
    setError(null);
    setMeta(null);
    setProjectError(null);
    setProjectMeta(null);
    setRegenerationError(null);
    setRegenerationMeta(null);
    try {
      const response = await generateInfographic({ text: cleanText, type, style, language: "fr" });
      setResult(response.infographic);
      setVariantIndex(0);
      setRetouchHistory(null);
      setActiveFileName(null);
      setSavedFingerprint(null);
      setGenerationKey((current) => current + 1);
      const seconds = response.durationMs ? `${(response.durationMs / 1000).toFixed(1)} s` : null;
      setMeta([response.provider ?? "vibe", seconds].filter(Boolean).join(" · "));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "La génération a échoué.");
    } finally {
      setLoading(false);
    }
  }

  async function handleRegenerateItem(itemIndex: number, instruction: string) {
    if (!result) return;
    const sourceText = text.trim();
    if (sourceText.length < 10) {
      setRegenerationError("Le texte source n'est plus disponible pour réécrire ce bloc.");
      return;
    }

    const beforeItem = result.items[itemIndex];
    if (!beforeItem) {
      setRegenerationError("Le bloc sélectionné n'existe plus.");
      return;
    }

    setRegeneratingIndex(itemIndex);
    setRegenerationError(null);
    setRegenerationMeta(null);
    try {
      const response = await regenerateInfographicItem({
        sourceText,
        infographic: result,
        itemIndex,
        instruction: instruction.trim() || undefined,
      });
      const afterItem: InfographicItem = { ...beforeItem, ...response.item };
      setResult((current) => {
        if (!current || itemIndex < 0 || itemIndex >= current.items.length) return current;
        return {
          ...current,
          items: current.items.map((item, index) =>
            index === itemIndex ? { ...item, ...response.item } : item,
          ),
        };
      });
      setRetouchHistory({ itemIndex, before: { ...beforeItem }, after: afterItem });
      const seconds = response.durationMs ? `${(response.durationMs / 1000).toFixed(1)} s` : null;
      setRegenerationMeta(
        [response.provider ?? "vibe", seconds, `bloc ${itemIndex + 1}`].filter(Boolean).join(" · "),
      );
    } catch (caught) {
      setRegenerationError(
        caught instanceof Error ? caught.message : "La réécriture du bloc a échoué.",
      );
    } finally {
      setRegeneratingIndex(null);
    }
  }

  function handleUndoRetouch() {
    const history = retouchHistory;
    if (!history) return;
    setResult((current) => {
      if (!current || history.itemIndex < 0 || history.itemIndex >= current.items.length) return current;
      return {
        ...current,
        items: current.items.map((item, index) =>
          index === history.itemIndex ? history.before : item,
        ),
      };
    });
    setRegenerationError(null);
    setRegenerationMeta(`Annulation locale · bloc ${history.itemIndex + 1}`);
    setRetouchHistory(null);
  }

  function handleStructureChange(next: CanonicalInfographic) {
    setResult(next);
    setRetouchHistory(null);
    setRegenerationError(null);
    setRegenerationMeta("Structure modifiée localement · aucun appel Vibe");
  }

  function handleItemEdit(itemIndex: number, nextItem: InfographicItem) {
    setResult((current) => {
      if (!current || itemIndex < 0 || itemIndex >= current.items.length) return current;
      return {
        ...current,
        items: current.items.map((item, index) =>
          index === itemIndex ? { ...item, ...nextItem } : item,
        ),
      };
    });
    setRetouchHistory(null);
    setRegenerationError(null);
    setRegenerationMeta(`Bloc ${itemIndex + 1} modifié manuellement · aucun appel Vibe`);
  }

  function handleInfographicEdit(next: CanonicalInfographic) {
    if (result && result.layout !== next.layout) setType(next.layout);
    setResult((current) =>
      current ? { ...next, appearance: next.appearance ?? current.appearance } : next,
    );
    setRetouchHistory(null);
    setRegenerationError(null);
    setRegenerationMeta("Infographie modifiée localement · aucun appel Vibe");
  }

  function handleAppearanceChange(next: InfographicAppearance) {
    setResult((current) => (current ? { ...current, appearance: next } : current));
    setRetouchHistory(null);
    setRegenerationError(null);
    setRegenerationMeta("Style personnalisé localement · aucun appel Vibe");
  }

  function handleItemIconChange(itemIndex: number, icon?: InfographicIcon) {
    setResult((current) => {
      if (!current || itemIndex < 0 || itemIndex >= current.items.length) return current;
      return {
        ...current,
        items: current.items.map((item, index) => {
          if (index !== itemIndex) return item;
          if (icon) return { ...item, icon };
          const { icon: _removed, ...rest } = item;
          return rest;
        }),
      };
    });
    setRetouchHistory(null);
    setRegenerationError(null);
    setRegenerationMeta(`Pictogramme du bloc ${itemIndex + 1} modifié localement · aucun appel Vibe`);
  }

  function handleApplyTemplate(id: string) {
    if (busy) return;
    const template = getStudioTemplate(id);
    if (!template) return;
    if (
      hasWork &&
      !window.confirm(
        `Appliquer le template « ${template.label} » ? Le contenu actuellement affiché sera remplacé. Sauvegardez-le en JSON si vous souhaitez le conserver.`,
      )
    ) return;

    setText(template.sourceText);
    setType(template.type);
    setStyle(template.style);
    setResult(template.infographic);
    setVariantIndex(template.variantIndex);
    setError(null);
    setMeta(null);
    setRegenerationError(null);
    setRegenerationMeta(`Template ${template.label} chargé localement · aucun appel Vibe`);
    setRetouchHistory(null);
    setProjectError(null);
    setProjectMeta(`Template ${template.label} · projet non enregistré`);
    setActiveFileName(null);
    setSavedFingerprint(null);
    setGenerationKey((current) => current + 1);
  }

  function handleNewProject() {
    if (busy) return false;
    if (
      hasWork &&
      !window.confirm(
        "Créer un nouveau projet ? Le contenu actuellement affiché sera retiré. Sauvegardez-le en JSON si vous souhaitez le conserver.",
      )
    ) return false;

    setText("");
    setType("auto");
    setStyle("clean");
    setResult(null);
    setVariantIndex(0);
    setError(null);
    setMeta(null);
    setRegenerationError(null);
    setRegenerationMeta(null);
    setRetouchHistory(null);
    setProjectError(null);
    setProjectMeta("Nouveau projet · prêt à créer · aucun appel Vibe");
    setActiveFileName(null);
    setSavedFingerprint(null);
    setGenerationKey((current) => current + 1);
    return true;
  }

  function handleSaveProject() {
    if (!result) return;
    try {
      const project = createInfographicProject({ sourceText: text, type, style, variantIndex, infographic: result });
      const filename = projectFileName(result.title);
      downloadBlob(JSON.stringify(project, null, 2), "application/json;charset=utf-8", filename);
      setProjectError(null);
      setProjectMeta("Projet JSON sauvegardé · version 2 · aucun appel Vibe");
      setActiveFileName(filename);
      setSavedFingerprint(projectStateFingerprint({ sourceText: text, type, style, variantIndex, infographic: result }));
    } catch (caught) {
      setProjectMeta(null);
      setProjectError(caught instanceof Error ? caught.message : "La sauvegarde JSON a échoué.");
    }
  }

  async function handleOpenProject(file: File) {
    if (busy) {
      setProjectMeta(null);
      setProjectError("Attendez la fin de l'opération en cours avant d'ouvrir un projet.");
      return;
    }

    setProjectError(null);
    setProjectMeta(null);
    try {
      if (file.size > MAX_PROJECT_FILE_BYTES) throw new Error("Projet JSON refusé : fichier trop volumineux.");
      const project = parseInfographicProject(await file.text());
      if (
        dirty &&
        !window.confirm(
          "Ouvrir ce projet ? Les modifications non sauvegardées du projet actuel seront remplacées.",
        )
      ) {
        setProjectMeta("Ouverture annulée · projet actuel conservé");
        return;
      }

      setText(project.sourceText);
      setType(project.type);
      setStyle(project.style);
      setResult(project.infographic);
      setVariantIndex(project.variantIndex);
      setError(null);
      setMeta(null);
      setRegenerationError(null);
      setRegenerationMeta(null);
      setRetouchHistory(null);
      setActiveFileName(file.name);
      setSavedFingerprint(
        projectStateFingerprint({
          sourceText: project.sourceText,
          type: project.type,
          style: project.style,
          variantIndex: project.variantIndex,
          infographic: project.infographic,
        }),
      );
      setGenerationKey((current) => current + 1);
      setProjectMeta(
        `Projet JSON ouvert · ${file.name} · version ${project.version}${project.version === 1 ? " · prochaine sauvegarde en v2" : ""} · aucun appel Vibe`,
      );
    } catch (caught) {
      setProjectError(caught instanceof Error ? caught.message : "Impossible d'ouvrir ce projet JSON.");
    }
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand-mark">IL</div>
        <div>
          <span className="eyebrow">LOCAL-FIRST · ANT V · VIBE</span>
          <h1>Infographic Lab</h1>
        </div>
        <span className="version-pill">V1.0.0</span>
      </header>

      <section className="hero-copy">
        <span className="eyebrow">TRANSFORMER UNE IDÉE</span>
        <h2>Du texte au visuel, sans usine à gaz.</h2>
        <p>Vibe structure l'information ; AntV et le moteur SVG local construisent le visuel, puis vous gardez la main.</p>
      </section>

      <section className="project-active-bar" aria-label="Projet actif">
        <div className="project-active-copy">
          <span className="eyebrow">PROJET ACTIF</span>
          <strong>{activeProjectName}</strong>
        </div>
        <span className={`project-active-state ${projectStateClass}`}>{projectState}</span>
      </section>

      <div className="workspace-grid">
        <form className="control-card" onSubmit={handleGenerate}>
          <label className="field-label" htmlFor="idea">Que voulez-vous expliquer ?</label>
          <textarea
            id="idea"
            value={text}
            onChange={(event) => setText(event.target.value)}
            maxLength={12000}
            placeholder="Ex. Présente les cinq étapes d'un diagnostic IA pour une petite entreprise, de l'identification du besoin jusqu'au plan d'action."
          />
          <div className="counter">{text.length.toLocaleString("fr-FR")} / 12 000</div>

          <fieldset>
            <legend>Type</legend>
            <div className="segmented">
              {types.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  className={type === item.value ? "segment active" : "segment"}
                  onClick={() => setType(item.value)}
                  disabled={busy}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend>Style</legend>
            <div className="style-grid">
              {styles.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  className={style === item.value ? `style-choice active style-${item.value}` : `style-choice style-${item.value}`}
                  onClick={() => setStyle(item.value)}
                  disabled={busy}
                >
                  <span className="style-swatch" />
                  {item.label}
                </button>
              ))}
            </div>
          </fieldset>

          <button className="button button-primary generate-button" type="submit" disabled={busy}>
            {loading ? "Vibe structure l'idée…" : result ? "Régénérer" : "Générer"}
          </button>

          {meta && <p className="generation-meta">{meta}</p>}
          {error && <p className="error-message">{error}</p>}

          <StudioControls
            data={result}
            style={style}
            busy={busy}
            variantIndex={variantIndex}
            onVariantIndexChange={setVariantIndex}
            onApplyTemplate={handleApplyTemplate}
            onAppearanceChange={handleAppearanceChange}
            onItemIconChange={handleItemIconChange}
          />
        </form>

        <InfographicCanvas
          data={result}
          style={style}
          resetKey={generationKey}
          busy={busy}
          variantIndex={variantIndex}
          onVariantIndexChange={setVariantIndex}
          onNewProject={handleNewProject}
          onSaveProject={handleSaveProject}
          onOpenProject={handleOpenProject}
          projectError={projectError}
          projectMeta={projectMeta}
          onRegenerateItem={handleRegenerateItem}
          regeneratingIndex={regeneratingIndex}
          regenerationError={regenerationError}
          regenerationMeta={regenerationMeta}
          retouchHistory={retouchHistory}
          onUndoRetouch={handleUndoRetouch}
          onStructureChange={handleStructureChange}
          onItemEdit={handleItemEdit}
          onInfographicEdit={handleInfographicEdit}
        />
      </div>

      <footer>
        <span>Infographic Lab · V1.0.0 · local-first</span>
        <span>Vibe organise · AntV + SVG dessinent · vous gardez la main</span>
      </footer>
    </main>
  );
}