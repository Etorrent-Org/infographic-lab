import mermaid from "mermaid";
import { useEffect, useRef, useState } from "react";

type Props = {
  code: string;
  theme: "light" | "dark";
  onSvg?: (svg: string | null) => void;
};

export function MermaidView({ code, theme, onSvg }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const renderTokenRef = useRef(0);
  const [error, setError] = useState<string | null>(null);
  const [rendering, setRendering] = useState(false);

  useEffect(() => {
    const token = ++renderTokenRef.current;
    const host = hostRef.current;
    if (!host || !code.trim()) return;

    setRendering(true);
    setError(null);
    onSvg?.(null);

    mermaid.initialize({
      startOnLoad: false,
      securityLevel: "strict",
      theme: theme === "dark" ? "dark" : "neutral",
      fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
      flowchart: {
        htmlLabels: true,
        curve: "basis",
        useMaxWidth: true,
      },
      themeVariables:
        theme === "dark"
          ? {
              background: "#151922",
              primaryColor: "#252b38",
              primaryTextColor: "#f4f7fb",
              primaryBorderColor: "#4d5a70",
              lineColor: "#91a0b8",
              secondaryColor: "#202632",
              tertiaryColor: "#1b202a",
            }
          : {
              background: "#ffffff",
              primaryColor: "#f5f7fb",
              primaryTextColor: "#172033",
              primaryBorderColor: "#cfd7e4",
              lineColor: "#667085",
              secondaryColor: "#eef2f7",
              tertiaryColor: "#ffffff",
            },
    });

    const renderId = `infographic-lab-${crypto.randomUUID().replace(/-/g, "")}`;
    void mermaid
      .render(renderId, code)
      .then(({ svg, bindFunctions }) => {
        if (token !== renderTokenRef.current || !hostRef.current) return;
        hostRef.current.innerHTML = svg;
        bindFunctions?.(hostRef.current);
        onSvg?.(svg);
        setRendering(false);
      })
      .catch((caught: unknown) => {
        if (token !== renderTokenRef.current) return;
        host.innerHTML = "";
        setError(caught instanceof Error ? caught.message : "Le diagramme Mermaid est invalide.");
        setRendering(false);
      });

    return () => {
      renderTokenRef.current += 1;
    };
  }, [code, theme, onSvg]);

  return (
    <div className="engine-surface mermaid-engine">
      {rendering && <div className="engine-loading">Rendu Mermaid…</div>}
      {error && <div className="engine-error">Mermaid : {error}</div>}
      <div ref={hostRef} className="mermaid-render" aria-label="Diagramme Mermaid rendu" />
    </div>
  );
}
