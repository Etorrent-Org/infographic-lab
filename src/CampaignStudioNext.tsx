import * as fabric from "fabric";
import { useEffect, useRef, useState } from "react";

const CANVAS_WIDTH = 1080;
const CANVAS_HEIGHT = 1350;

function downloadDataUrl(dataUrl: string, fileName: string) {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = fileName;
  link.click();
}

function downloadText(content: string, mime: string, fileName: string) {
  const url = URL.createObjectURL(new Blob([content], { type: mime }));
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

function addDefaultScene(canvas: fabric.Canvas) {
  canvas.backgroundColor = "#F2F0EA";

  const accent = new fabric.Rect({
    left: 70,
    top: 72,
    width: 18,
    height: 1206,
    rx: 9,
    ry: 9,
    fill: "#4D76D9",
    selectable: false,
    evented: false,
  });

  const brand = new fabric.Textbox("INFOGRAPHIC LAB", {
    left: 126,
    top: 78,
    width: 430,
    fontFamily: "Arial",
    fontSize: 24,
    fontWeight: "700",
    charSpacing: 120,
    fill: "#151B2B",
  });

  const eyebrow = new fabric.Textbox("CAMPAGNE / DIRECTION CRÉATIVE", {
    left: 126,
    top: 250,
    width: 620,
    fontFamily: "Arial",
    fontSize: 19,
    fontWeight: "700",
    charSpacing: 90,
    fill: "#4D76D9",
  });

  const title = new fabric.Textbox("Votre message doit être fort avant d'être décoré.", {
    left: 126,
    top: 318,
    width: 820,
    fontFamily: "Georgia",
    fontSize: 78,
    fontWeight: "700",
    lineHeight: 0.98,
    fill: "#151B2B",
    splitByGrapheme: false,
  });

  const subtitle = new fabric.Textbox(
    "Ce prototype repart sur un vrai canvas éditable. Le texte, les formes et la hiérarchie deviennent des objets manipulables, pas un SVG figé.",
    {
      left: 126,
      top: 690,
      width: 760,
      fontFamily: "Arial",
      fontSize: 28,
      lineHeight: 1.18,
      fill: "#303849",
    },
  );

  const card = new fabric.Rect({
    left: 126,
    top: 930,
    width: 820,
    height: 176,
    rx: 28,
    ry: 28,
    fill: "#151B2B",
  });

  const benefit = new fabric.Textbox("STRUCTURE → CRÉATION → DÉCLINAISONS", {
    left: 170,
    top: 975,
    width: 700,
    fontFamily: "Arial",
    fontSize: 28,
    fontWeight: "700",
    charSpacing: 55,
    fill: "#FFFFFF",
  });

  const cta = new fabric.Textbox("Découvrir", {
    left: 126,
    top: 1185,
    width: 260,
    fontFamily: "Arial",
    fontSize: 27,
    fontWeight: "700",
    fill: "#151B2B",
  });

  const ctaLine = new fabric.Rect({
    left: 126,
    top: 1231,
    width: 260,
    height: 7,
    rx: 3.5,
    ry: 3.5,
    fill: "#4D76D9",
  });

  canvas.add(accent, brand, eyebrow, title, subtitle, card, benefit, cta, ctaLine);
  canvas.requestRenderAll();
}

export function CampaignStudioNext() {
  const elementRef = useRef<HTMLCanvasElement>(null);
  const canvasRef = useRef<fabric.Canvas | null>(null);
  const [selectedType, setSelectedType] = useState("Aucun objet");

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const canvas = new fabric.Canvas(element, {
      width: CANVAS_WIDTH,
      height: CANVAS_HEIGHT,
      preserveObjectStacking: true,
      selection: true,
    });
    canvasRef.current = canvas;
    addDefaultScene(canvas);

    const syncSelection = () => {
      const active = canvas.getActiveObject();
      setSelectedType(active?.type ?? "Aucun objet");
    };

    canvas.on("selection:created", syncSelection);
    canvas.on("selection:updated", syncSelection);
    canvas.on("selection:cleared", syncSelection);

    return () => {
      canvasRef.current = null;
      void canvas.dispose();
    };
  }, []);

  function addText() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const text = new fabric.Textbox("Nouveau texte", {
      left: 170,
      top: 560,
      width: 520,
      fontFamily: "Arial",
      fontSize: 44,
      fontWeight: "700",
      fill: "#151B2B",
    });
    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.requestRenderAll();
  }

  function addShape() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const shape = new fabric.Rect({
      left: 730,
      top: 920,
      width: 190,
      height: 120,
      rx: 24,
      ry: 24,
      fill: "#4D76D9",
    });
    canvas.add(shape);
    canvas.setActiveObject(shape);
    canvas.requestRenderAll();
  }

  function removeSelected() {
    const canvas = canvasRef.current;
    const active = canvas?.getActiveObject();
    if (!canvas || !active) return;
    canvas.remove(active);
    canvas.discardActiveObject();
    canvas.requestRenderAll();
  }

  function moveSelected(direction: "front" | "back") {
    const canvas = canvasRef.current;
    const active = canvas?.getActiveObject();
    if (!canvas || !active) return;
    if (direction === "front") canvas.bringObjectForward(active);
    else canvas.sendObjectBackwards(active);
    canvas.requestRenderAll();
  }

  function exportPng() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    downloadDataUrl(
      canvas.toDataURL({ format: "png", multiplier: 2 }),
      "campaign-studio-fabric.png",
    );
  }

  function exportSvg() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    downloadText(canvas.toSVG(), "image/svg+xml;charset=utf-8", "campaign-studio-fabric.svg");
  }

  function exportScene() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    downloadText(
      JSON.stringify(canvas.toJSON(), null, 2),
      "application/json;charset=utf-8",
      "campaign-studio-scene.json",
    );
  }

  return (
    <main className="campaign-next-shell">
      <header className="campaign-next-header">
        <div>
          <strong>Visual Campaign Studio</strong>
          <span>RESTART · FABRIC.JS</span>
        </div>
        <div className="campaign-next-status">Prototype séparé · pas une DA finale</div>
      </header>

      <section className="campaign-next-workspace">
        <aside className="campaign-next-tools" aria-label="Outils du prototype">
          <p className="campaign-next-kicker">CANVAS ÉDITABLE</p>
          <h1>Fondation vNext</h1>
          <p>
            Cette branche ne réutilise plus le moteur de placement marketing comme fondation.
            Les éléments du visuel sont de vrais objets Fabric éditables.
          </p>

          <div className="campaign-next-tool-grid">
            <button type="button" onClick={addText}>+ Texte</button>
            <button type="button" onClick={addShape}>+ Forme</button>
            <button type="button" onClick={() => moveSelected("front")}>Avancer</button>
            <button type="button" onClick={() => moveSelected("back")}>Reculer</button>
            <button type="button" onClick={removeSelected}>Supprimer</button>
          </div>

          <div className="campaign-next-selection">
            <span>Sélection</span>
            <strong>{selectedType}</strong>
          </div>

          <div className="campaign-next-export">
            <button type="button" onClick={exportPng}>PNG ×2</button>
            <button type="button" onClick={exportSvg}>SVG</button>
            <button type="button" onClick={exportScene}>Scène JSON</button>
          </div>

          <small>
            Étape suivante : templates JSON, Brand Kit, calques, undo/redo et adaptation multi-format.
          </small>
        </aside>

        <div className="campaign-next-stage-wrap">
          <div className="campaign-next-stage" aria-label="Canvas Campaign Studio Fabric.js">
            <canvas ref={elementRef} />
          </div>
        </div>
      </section>
    </main>
  );
}
