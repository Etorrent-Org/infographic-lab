import { useEffect, useState } from "react";
import { AugmentedStudioV2 } from "./AugmentedStudio.v2";
import { MarketingStudio } from "./MarketingStudio";
import "./marketing.css";

type WorkspaceMode = "structure" | "visuals";

function initialMode(): WorkspaceMode {
  const stored = localStorage.getItem("infographic-lab-workspace-mode");
  return stored === "visuals" || stored === "structure" ? stored : "structure";
}

export function StudioSuite() {
  const [mode, setMode] = useState<WorkspaceMode>(initialMode);

  useEffect(() => {
    localStorage.setItem("infographic-lab-workspace-mode", mode);
  }, [mode]);

  return (
    <div className="suite-root" data-workspace={mode}>
      <nav className="suite-rail" aria-label="Studios Infographic Lab">
        <div className="suite-rail-brand" title="Infographic Lab">IL</div>
        <button type="button" className={mode === "structure" ? "active" : ""} onClick={() => setMode("structure")} title="Studio Structure">
          <span className="suite-icon">◇</span>
          <small>Structure</small>
        </button>
        <button type="button" className={mode === "visuals" ? "active" : ""} onClick={() => setMode("visuals")} title="Visual Campaign Studio">
          <span className="suite-icon">▣</span>
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
