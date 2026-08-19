import { getAntvVariants, styleAppearanceDefaults } from "./antv";
import { iconCatalog, iconDataUri } from "./icons";
import { studioTemplates } from "./templates";
import type {
  CanonicalInfographic,
  InfographicAppearance,
  InfographicIcon,
  InfographicStyle,
  VisualDensity,
} from "./types";

type Props = {
  data: CanonicalInfographic | null;
  style: InfographicStyle;
  busy: boolean;
  variantIndex: number;
  onVariantIndexChange: (next: number) => void;
  onApplyTemplate: (id: string) => void;
  onAppearanceChange: (next: InfographicAppearance) => void;
  onItemIconChange: (itemIndex: number, icon?: InfographicIcon) => void;
};

export function StudioControls({
  data,
  style,
  busy,
  variantIndex,
  onVariantIndexChange,
  onApplyTemplate,
  onAppearanceChange,
  onItemIconChange,
}: Props) {
  const variants = data ? getAntvVariants(data) : [];
  const safeVariantIndex = variants.length
    ? ((variantIndex % variants.length) + variants.length) % variants.length
    : 0;
  const defaults = styleAppearanceDefaults[style];
  const accent = data?.appearance?.accent ?? defaults.accent;
  const background = data?.appearance?.background ?? defaults.background;
  const density = data?.appearance?.density ?? "balanced";

  function updateAppearance(patch: Partial<InfographicAppearance>) {
    if (!data) return;
    onAppearanceChange({
      accent,
      background,
      density,
      ...patch,
    });
  }

  function setDensity(next: VisualDensity) {
    updateAppearance({ density: next });
  }

  return (
    <div className="studio-tools">
      <details className="studio-panel" open={!data}>
        <summary>
          <span>TEMPLATES</span>
          <small>sans Vibe</small>
        </summary>
        <div className="template-grid">
          {studioTemplates.map((template) => (
            <button
              key={template.id}
              type="button"
              className="template-card"
              disabled={busy}
              onClick={() => onApplyTemplate(template.id)}
            >
              <strong>{template.label}</strong>
              <small>{template.description}</small>
            </button>
          ))}
        </div>
      </details>

      {data && (
        <details className="studio-panel">
          <summary>
            <span>PICTOGRAMMES</span>
            <small>{data.items.length} blocs · local</small>
          </summary>
          <div className="icon-editor-list">
            {data.items.map((item, index) => (
              <label className="icon-editor-row" key={`${index}-${item.title}`}>
                <span className="icon-editor-title">
                  {item.icon ? (
                    <img src={iconDataUri(item.icon)} alt="" aria-hidden="true" />
                  ) : (
                    <span className="icon-empty" aria-hidden="true">○</span>
                  )}
                  <span>{String(index + 1).padStart(2, "0")} · {item.title}</span>
                </span>
                <select
                  value={item.icon ?? ""}
                  disabled={busy}
                  onChange={(event) =>
                    onItemIconChange(
                      index,
                      event.target.value ? (event.target.value as InfographicIcon) : undefined,
                    )
                  }
                >
                  <option value="">Aucun pictogramme</option>
                  {iconCatalog.map((icon) => (
                    <option key={icon.key} value={icon.key}>{icon.label}</option>
                  ))}
                </select>
              </label>
            ))}
          </div>
          <p className="studio-note">Les icônes sont embarquées localement dans le rendu ; aucune requête externe.</p>
        </details>
      )}

      {data && variants.length > 0 && (
        <details className="studio-panel">
          <summary>
            <span>AUTRES VISUELS</span>
            <small>{variants.length} rendus</small>
          </summary>
          <div className="visual-picker">
            <label htmlFor="visual-variant">Rendu AntV</label>
            <select
              id="visual-variant"
              value={safeVariantIndex}
              disabled={busy}
              onChange={(event) => onVariantIndexChange(Number(event.target.value))}
            >
              {variants.map((variant, index) => (
                <option key={`${variant.template}-${index}`} value={index}>
                  {String(index + 1).padStart(2, "0")} · {variant.label}
                </option>
              ))}
            </select>
            <p className="studio-note">Même contenu, nouveau rendu, zéro appel Vibe.</p>
          </div>
        </details>
      )}

      {data && (
        <details className="studio-panel">
          <summary>
            <span>PERSONNALISATION</span>
            <small>couleurs · densité</small>
          </summary>
          <div className="appearance-grid">
            <label className="color-control">
              <span>Accent</span>
              <span className="color-input-wrap">
                <input
                  type="color"
                  value={accent}
                  disabled={busy}
                  onChange={(event) => updateAppearance({ accent: event.target.value.toUpperCase() })}
                />
                <code>{accent}</code>
              </span>
            </label>
            <label className="color-control">
              <span>Fond</span>
              <span className="color-input-wrap">
                <input
                  type="color"
                  value={background}
                  disabled={busy}
                  onChange={(event) => updateAppearance({ background: event.target.value.toUpperCase() })}
                />
                <code>{background}</code>
              </span>
            </label>
          </div>

          <div className="density-control">
            <span>Densité</span>
            <div className="density-buttons">
              {(["compact", "balanced", "airy"] as VisualDensity[]).map((value) => (
                <button
                  key={value}
                  type="button"
                  disabled={busy}
                  className={density === value ? "density-button active" : "density-button"}
                  onClick={() => setDensity(value)}
                >
                  {value === "compact" ? "Compact" : value === "balanced" ? "Équilibré" : "Aéré"}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            className="studio-reset"
            disabled={busy}
            onClick={() => onAppearanceChange({ density: "balanced" })}
          >
            Réinitialiser le style personnalisé
          </button>
        </details>
      )}
    </div>
  );
}
