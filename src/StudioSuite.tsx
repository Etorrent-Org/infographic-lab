import { useEffect, useState } from "react";
import { AugmentedStudioV2 } from "./AugmentedStudio.v2";
import { MarketingStudio } from "./MarketingStudio";
import "./marketing.css";

type WorkspaceMode = "structure" | "visuals";

function initialMode(): WorkspaceMode {
  const stored = localStorage.getItem("infographic-lab-workspace-mode");
  return stored === "visuals" || stored === "structure" ? stored : "structure";
}

function StructureIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <rect x="3" y="4" width="7" height="5" rx="1.5" />
      <rect x="14" y="4" width="7" height="5" rx="1.5" />
      <rect x="8.5" y="15" width="7" height="5" rx="1.5" />
      <path d="M6.5 9v2.5H17.5V9M12 11.5V15" />
    </svg>
  );
}

function VisualsIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <rect x="3" y="4" width="18" height="16" rx="2.5" />
      <circle cx="8" cy="9" r="1.5" />
      <path d="M5.5 17l4.5-4.5 3 3 2.5-2.5 3 4" />
    </svg>
  );
}

export function StudioSuite() {
  const [mode, setMode] = useState<WorkspaceMode>(initialMode);

  useEffect(() => {
    localStorage.setItem("infographic-lab-workspace-mode", mode);
  }, [mode]);

  return (
    <div className="suite-root" data-workspace={mode}>
      <nav className="suite-rail" aria-label="Studios Infographic Lab">
        <div className="suite-rail-brand" title="Infographic Lab" aria-label="Infographic Lab">IL</div>
        <button
          type="button"
          className={mode === "structure" ? "active" : ""}
          onClick={() => setMode("structure")}
          title="Studio Structure"
          aria-current={mode === "structure" ? "page" : undefined}
        >
          <span className="suite-icon"><StructureIcon /></span>
          <small>Structure</small>
        </button>
        <button
          type="button"
          className={mode === "visuals" ? "active" : ""}
          onClick={() => setMode("visuals")}
          title="Studio Visuels"
          aria-current={mode === "visuals" ? "page" : undefined}
        >
          <span className="suite-icon"><VisualsIcon /></span>
          <small>Visuels</small>
        </button>
        <div className="suite-rail-spacer" />
        <span className="suite-version">V2</span>
      </nav>
      <div className="suite-content">
        {mode === "structure" ? <AugmentedStudioV2 /> : <MarketingStudio />}
      </div>
    </div>
  );
}
