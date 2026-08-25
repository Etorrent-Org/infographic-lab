import { useEffect, useRef, useState } from "react";
import { AugmentedStudioV2 } from "./AugmentedStudio.v2";
import { MarketingStudio } from "./MarketingStudio";
import "./marketing.css";

type WorkspaceMode = "structure" | "visuals";

type PanelScrollContext = {
  key: string;
  scroll: HTMLElement;
};

function initialMode(): WorkspaceMode {
  const stored = localStorage.getItem("infographic-lab-workspace-mode");
  return stored === "visuals" || stored === "structure" ? stored : "structure";
}

function currentPanelScrollContext(): PanelScrollContext | null {
  const studio = document.querySelector<HTMLElement>(".suite-content > .studio-app, .suite-content > .marketing-app");
  if (!studio) return null;

  const structure = studio.classList.contains("studio-app");
  const nav = studio.querySelector<HTMLElement>(structure ? ".studio-inspector-tabs" : ".marketing-panel-tabs");
  const scroll = studio.querySelector<HTMLElement>(structure ? ".studio-inspector-scroll" : ".marketing-inspector-scroll");
  const active = nav?.querySelector<HTMLButtonElement>("button.active");
  if (!scroll || !active) return null;

  const label = active.textContent?.trim().replace(/\s+/g, " ") || "panel";
  return {
    key: `${structure ? "structure" : "visuals"}:${label}`,
    scroll,
  };
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
  const panelScrollPositions = useRef(new Map<string, number>());

  useEffect(() => {
    localStorage.setItem("infographic-lab-workspace-mode", mode);
  }, [mode]);

  useEffect(() => {
    let lastPanelKey: string | null = null;
    let frame = 0;

    const restoreActivePanel = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        const context = currentPanelScrollContext();
        if (!context || context.key === lastPanelKey) return;
        lastPanelKey = context.key;
        context.scroll.scrollTop = panelScrollPositions.current.get(context.key) ?? 0;
      });
    };

    const rememberPanelScroll = (event: Event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      if (!target.classList.contains("studio-inspector-scroll") && !target.classList.contains("marketing-inspector-scroll")) return;

      const context = currentPanelScrollContext();
      if (context?.scroll === target) panelScrollPositions.current.set(context.key, target.scrollTop);
    };

    const suite = document.querySelector(".suite-root");
    const observer = new MutationObserver(restoreActivePanel);
    if (suite) {
      observer.observe(suite, {
        subtree: true,
        childList: true,
        attributes: true,
        attributeFilter: ["class"],
      });
    }

    document.addEventListener("scroll", rememberPanelScroll, true);
    restoreActivePanel();

    return () => {
      observer.disconnect();
      document.removeEventListener("scroll", rememberPanelScroll, true);
      window.cancelAnimationFrame(frame);
    };
  }, []);

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
