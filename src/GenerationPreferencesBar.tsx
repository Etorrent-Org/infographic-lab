import { useState } from "react";
import { loadGenerationPreferences, saveGenerationPreferences } from "./generation-preferences";
import type { GenerationPreferences } from "./types";
import "./generation-preferences.css";

const visualOptions: { value: GenerationPreferences["visual"]; label: string }[] = [
  { value: "auto", label: "Automatique" },
  { value: "iceberg", label: "Iceberg" },
  { value: "cycle", label: "Cycle" },
  { value: "sankey", label: "Sankey narratif" },
  { value: "matrix", label: "Matrice 2×2" },
  { value: "swot", label: "SWOT" },
  { value: "impact", label: "Impact / Effort" },
  { value: "eisenhower", label: "Eisenhower" },
  { value: "risk", label: "Matrice de risque" },
  { value: "architecture", label: "Architecture" },
  { value: "hub", label: "Hub / radial" },
  { value: "tree", label: "Hiérarchie / arbre" },
  { value: "venn", label: "Venn" },
  { value: "table", label: "Table visuelle" },
  { value: "kpi", label: "KPI" },
  { value: "bar", label: "Barres" },
  { value: "column", label: "Colonnes" },
  { value: "line", label: "Courbe" },
  { value: "donut", label: "Donut" },
  { value: "waterfall", label: "Waterfall chiffré" },
];

export function GenerationPreferencesBar() {
  const [preferences, setPreferences] = useState<GenerationPreferences>(loadGenerationPreferences);

  function update<K extends keyof GenerationPreferences>(key: K, value: GenerationPreferences[K]) {
    const next = { ...preferences, [key]: value };
    setPreferences(next);
    saveGenerationPreferences(next);
  }

  return (
    <details className="generation-preferences">
      <summary>
        <span>Génération</span>
        <small>{visualOptions.find((item) => item.value === preferences.visual)?.label ?? "Automatique"}</small>
      </summary>
      <div className="generation-preferences-panel">
        <div className="generation-preferences-head">
          <strong>Préférences de génération</strong>
          <p>Le contenu reste structuré ; ces réglages guident le rendu et la reformulation.</p>
        </div>

        <label>
          <span>Visuel cible</span>
          <select value={preferences.visual} onChange={(event) => update("visual", event.target.value as GenerationPreferences["visual"])}>
            {visualOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>

        <label>
          <span>Orientation</span>
          <select value={preferences.orientation} onChange={(event) => update("orientation", event.target.value as GenerationPreferences["orientation"])}>
            <option value="auto">Auto</option>
            <option value="portrait">Portrait</option>
            <option value="landscape">Paysage</option>
            <option value="square">Carré</option>
          </select>
        </label>

        <label>
          <span>Niveau de détail</span>
          <select value={preferences.detail} onChange={(event) => update("detail", event.target.value as GenerationPreferences["detail"])}>
            <option value="summary">Synthétique</option>
            <option value="balanced">Équilibré</option>
            <option value="detailed">Détaillé</option>
          </select>
        </label>

        <label>
          <span>Texte</span>
          <select value={preferences.wording} onChange={(event) => update("wording", event.target.value as GenerationPreferences["wording"])}>
            <option value="rephrase">Reformuler intelligemment</option>
            <option value="close">Rester proche du texte source</option>
          </select>
        </label>

        <p className="generation-preferences-note">Les graphiques chiffrés n'inventent jamais de valeurs : ils n'apparaissent que lorsque la source contient des données numériques exploitables.</p>
      </div>
    </details>
  );
}
