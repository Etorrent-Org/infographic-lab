import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import "./preview-modal.css";

type PreviewSnapshot = {
  src: string;
  title: string;
  brand: string;
  variant: string;
  theme: "light" | "dark";
};

function capturePreview(): PreviewSnapshot | null {
  const frame = document.querySelector<HTMLElement>(".studio-visual-frame");
  const svg = frame?.querySelector<SVGSVGElement>(".studio-infographic-canvas svg");
  if (!frame || !svg) return null;

  const clone = svg.cloneNode(true) as SVGSVGElement;
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  clone.setAttribute("preserveAspectRatio", clone.getAttribute("preserveAspectRatio") || "xMidYMid meet");
  clone.style.fontFamily = window.getComputedStyle(frame).fontFamily;

  const source = new XMLSerializer().serializeToString(clone);
  const title = document.querySelector<HTMLElement>(".studio-output-heading h1")?.textContent?.trim() || "Aperçu de l’infographie";
  const brand = frame.querySelector<HTMLElement>(".studio-brand-lockup span")?.textContent?.trim() || "Infographic Lab";
  const variant = frame.querySelector<HTMLElement>(".studio-variant-control span")?.textContent?.trim() || "Aperçu";
  const theme = document.querySelector<HTMLElement>(".studio-app")?.dataset.theme === "dark" ? "dark" : "light";

  return {
    src: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(source)}`,
    title,
    brand,
    variant,
    theme,
  };
}

export function PreviewModalEnhancement() {
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);
  const [previewReady, setPreviewReady] = useState(false);
  const [snapshot, setSnapshot] = useState<PreviewSnapshot | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const scanFrameRef = useRef<number | null>(null);

  const scanPreview = useCallback(() => {
    if (scanFrameRef.current !== null) window.cancelAnimationFrame(scanFrameRef.current);
    scanFrameRef.current = window.requestAnimationFrame(() => {
      scanFrameRef.current = null;
      const frame = document.querySelector<HTMLElement>(".studio-visual-frame");
      const meta = frame?.querySelector<HTMLElement>(".studio-visual-meta") ?? null;
      const svg = frame?.querySelector<SVGSVGElement>(".studio-infographic-canvas svg") ?? null;
      setPortalTarget(meta);
      setPreviewReady(Boolean(svg));
    });
  }, []);

  useEffect(() => {
    scanPreview();
    const observer = new MutationObserver(scanPreview);
    observer.observe(document.getElementById("root") ?? document.body, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["data-theme", "style"],
    });
    window.addEventListener("resize", scanPreview);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", scanPreview);
      if (scanFrameRef.current !== null) window.cancelAnimationFrame(scanFrameRef.current);
    };
  }, [scanPreview]);

  const closeModal = useCallback(() => {
    setSnapshot(null);
    window.requestAnimationFrame(() => {
      const target = returnFocusRef.current;
      if (target && document.contains(target)) target.focus();
    });
  }, []);

  function openModal() {
    const next = capturePreview();
    if (!next) return;
    returnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setSnapshot(next);
  }

  useEffect(() => {
    if (!snapshot) return;
    const frame = window.requestAnimationFrame(() => closeButtonRef.current?.focus());
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeModal();
        return;
      }
      if (event.key === "Tab") {
        event.preventDefault();
        closeButtonRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeModal, snapshot]);

  return (
    <>
      {portalTarget && createPortal(
        <button
          type="button"
          className="studio-preview-expand-button"
          onClick={openModal}
          disabled={!previewReady}
          aria-haspopup="dialog"
          aria-label="Agrandir l’aperçu de l’infographie"
          title="Ouvrir l’aperçu en grand"
        >
          <span aria-hidden="true">⛶</span>
          Agrandir
        </button>,
        portalTarget,
      )}

      {snapshot && createPortal(
        <div
          className={`studio-preview-modal-backdrop preview-theme-${snapshot.theme}`}
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeModal();
          }}
        >
          <section
            className="studio-preview-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="studio-preview-modal-title"
          >
            <header className="studio-preview-modal-header">
              <div>
                <span>{snapshot.brand} · {snapshot.variant}</span>
                <h2 id="studio-preview-modal-title">{snapshot.title}</h2>
              </div>
              <button
                ref={closeButtonRef}
                type="button"
                className="studio-preview-modal-close"
                onClick={closeModal}
                aria-label="Fermer l’aperçu grand format"
              >
                <span aria-hidden="true">×</span>
                Fermer
              </button>
            </header>
            <div className="studio-preview-modal-canvas">
              <img src={snapshot.src} alt={`Aperçu grand format : ${snapshot.title}`} />
            </div>
          </section>
        </div>,
        document.body,
      )}
    </>
  );
}
