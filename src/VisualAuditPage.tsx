import { Infographic } from "@antv/infographic";
import { useEffect, useMemo, useRef, useState } from "react";
import { buildAntvOptions, getAntvVariants } from "./antv";
import { CustomVisual } from "./CustomVisual";
import { svgDataUrlToPng, svgElementToDataUrl } from "./project";
import type { CanonicalInfographic, CustomVisualKind, InfographicItem, InfographicStyle, VisualOrientation } from "./types";

const CUSTOM_KINDS: CustomVisualKind[] = [
  "iceberg", "cycle", "sankey", "matrix", "swot", "impact", "eisenhower", "risk", "architecture", "hub",
  "tree", "venn", "table", "kpi", "chart-bar", "chart-column", "chart-line", "chart-donut", "chart-waterfall",
];

const LONG_DESCRIPTIONS = [
  "Une information structurée, concise et suffisamment longue pour vérifier la tenue du texte dans le composant.",
  "Un deuxième point métier qui doit rester lisible sans chevauchement ni rupture de hiérarchie.",
  "Une formulation réaliste pour contrôler les espacements et la densité de la composition.",
  "Un axe complémentaire présenté avec une description courte et exploitable en contexte professionnel.",
  "Un levier concret qui complète la structure sans ajouter de surcharge décorative au visuel.",
  "Un dernier point de contrôle destiné à éprouver le rendu dans les configurations plus denses.",
  "Une information additionnelle utilisée pour tester la capacité du rendu à accueillir sept éléments.",
  "Un huitième bloc présent uniquement dans les familles capables de conserver une lecture confortable.",
];

type AuditExport = { svg: string; png: string };
type AuditWindow = Window & {
  __VISUAL_AUDIT_READY__?: boolean;
  __VISUAL_AUDIT_EXPORT__?: () => Promise<AuditExport>;
};

function textItem(index: number, extra: Partial<InfographicItem> = {}): InfographicItem {
  return {
    title: `Élément ${index + 1} structuré`,
    description: LONG_DESCRIPTIONS[index % LONG_DESCRIPTIONS.length],
    blockType: "list",
    claimType: "interpretation",
    ...extra,
  };
}

function numericItem(index: number, value: number): InfographicItem {
  return textItem(index, {
    title: `Trimestre ${index + 1}`,
    description: `Valeur observée pour le trimestre ${index + 1} dans le jeu chiffré de validation.`,
    value,
    unit: "k€",
    category: `T${index + 1}`,
  });
}

function customItems(kind: CustomVisualKind): InfographicItem[] {
  if (["matrix", "swot", "impact", "eisenhower", "risk"].includes(kind)) {
    return Array.from({ length: 4 }, (_, index) => textItem(index));
  }
  if (kind === "venn") {
    return [
      textItem(0, { title: "Approche locale", description: "Contrôle des données et fonctionnement autonome sur l'infrastructure de l'entreprise." }),
      textItem(1, { title: "Approche cloud", description: "Accès simple, collaboration immédiate et maintenance opérée par le fournisseur." }),
      textItem(2, { title: "Approche hybride", description: "Combinaison des usages locaux et cloud selon les contraintes du projet." }),
    ];
  }
  if (kind === "architecture") return ["Infrastructure", "Données", "Services", "Applications", "Expérience utilisateur"].map((title, index) => textItem(index, { title }));
  if (kind === "hub") return ["Clients", "Processus", "Données", "Équipe", "Outils", "Pilotage"].map((title, index) => textItem(index, { title }));
  if (kind === "cycle") return ["Observer", "Analyser", "Décider", "Agir", "Mesurer", "Améliorer"].map((title, index) => textItem(index, { title }));
  if (kind === "sankey") return ["Demande", "Qualification", "Traitement", "Contrôle", "Validation", "Livraison"].map((title, index) => textItem(index, { title }));
  if (kind === "tree") return ["Expérience client", "Opérations", "Données", "Collaborateurs", "Sécurité", "Pilotage"].map((title, index) => textItem(index, { title }));
  if (kind === "iceberg") {
    return [
      textItem(0, { category: "visible", title: "Délais en hausse", description: "Les délais de réponse augmentent et les clients relancent davantage les équipes." }),
      textItem(1, { category: "visible", title: "Relances répétées", description: "Les demandes nécessitent plusieurs contacts avant d'obtenir une réponse complète." }),
      textItem(2, { category: "deep", title: "Canaux dispersés", description: "Les demandes arrivent par email, téléphone et messagerie sans point d'entrée unique." }),
      textItem(3, { category: "deep", title: "Recopies manuelles", description: "Certaines informations sont ressaisies dans plusieurs outils par les équipes." }),
      textItem(4, { category: "deep", title: "Responsabilités floues", description: "Les rôles entre commerce, administration et support sont parfois mal définis." }),
      textItem(5, { category: "deep", title: "Suivi fragmenté", description: "Les données de suivi sont dispersées et aucun tableau partagé ne révèle vite les blocages." }),
      textItem(6, { category: "objective", title: "Fiabiliser le traitement", description: "Réduire les retards sans remplacer l'ensemble des outils existants." }),
    ];
  }
  if (["kpi", "chart-bar", "chart-column", "chart-line", "chart-donut", "chart-waterfall"].includes(kind)) {
    return [240, 280, 310, 370].map((value, index) => numericItem(index, value));
  }
  return Array.from({ length: 6 }, (_, index) => textItem(index));
}

function customFixture(kind: CustomVisualKind, orientation: VisualOrientation): CanonicalInfographic {
  return {
    title: kind === "iceberg" ? "Retards dans le traitement des demandes clients" : "Transformation structurée d'un sujet métier",
    subtitle: kind === "iceberg"
      ? "Distinguer les signaux visibles des causes profondes et du cap recherché."
      : "Fixture navigateur destinée à valider la lisibilité du rendu final.",
    layout: "list",
    items: customItems(kind),
    appearance: { orientation },
  };
}

function antvFixture(layout: CanonicalInfographic["layout"], template: string): CanonicalInfographic {
  const count = layout === "comparison" ? 2 : template === "list-pyramid-compact-card" ? 3 : 4;
  return {
    title: "Programme de transformation numérique",
    subtitle: layout === "list" ? undefined : "Structure claire et compacte.",
    layout,
    items: Array.from({ length: count }, (_, index) => textItem(index, {
      title: layout === "timeline" ? `Jalon ${index + 1}` : `Axe ${index + 1}`,
      description: "Texte court et lisible pour ce gabarit.",
    })),
    appearance: { orientation: "landscape" },
  };
}

function readStyle(params: URLSearchParams): InfographicStyle {
  const style = params.get("style") ?? "clean";
  return (["clean", "soft", "dark", "sketch", "chalk"] as InfographicStyle[]).includes(style as InfographicStyle)
    ? style as InfographicStyle
    : "clean";
}

function readOrientation(params: URLSearchParams): VisualOrientation {
  const orientation = params.get("orientation") ?? "landscape";
  return (["portrait", "landscape", "square"] as VisualOrientation[]).includes(orientation as VisualOrientation)
    ? orientation as VisualOrientation
    : "landscape";
}

function markReady(ready: boolean) {
  (window as AuditWindow).__VISUAL_AUDIT_READY__ = ready;
}

export function VisualAuditPage() {
  const params = useMemo(() => new URLSearchParams(window.location.search), []);
  const mode = params.get("mode") === "antv" ? "antv" : "custom";
  const style = readStyle(params);
  const orientation = readOrientation(params);
  const requestedKind = params.get("kind") as CustomVisualKind | null;
  const kind = requestedKind && CUSTOM_KINDS.includes(requestedKind) ? requestedKind : "iceberg";
  const requestedLayout = params.get("layout") as CanonicalInfographic["layout"];
  const layout = (["process", "timeline", "list", "comparison"] as CanonicalInfographic["layout"][]).includes(requestedLayout)
    ? requestedLayout
    : "list";
  const template = params.get("template") ?? "";
  const customData = useMemo(() => customFixture(kind, orientation), [kind, orientation]);
  const antvData = useMemo(() => antvFixture(layout, template), [layout, template]);
  const antvRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<Infographic | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    markReady(false);
    setReady(false);
    setError(null);
    if (mode === "custom") {
      const frame = requestAnimationFrame(() => {
        setReady(true);
        markReady(true);
      });
      return () => cancelAnimationFrame(frame);
    }

    const container = antvRef.current;
    if (!container) return;
    const variants = getAntvVariants(antvData);
    const variantIndex = variants.findIndex((variant) => variant.engine !== "custom" && variant.template === template);
    if (variantIndex < 0) {
      setError(`Template AntV non exposé : ${template}`);
      markReady(true);
      setReady(true);
      return;
    }
    try {
      const infographic = new Infographic({
        ...buildAntvOptions(antvData, style, variantIndex),
        container,
        width: 1200,
        height: 760,
        padding: 48,
        editable: false,
      });
      infographic.on("error", (reason) => setError(reason instanceof Error ? reason.message : "Erreur de rendu AntV"));
      instanceRef.current = infographic;
      Promise.resolve(infographic.render()).then(() => {
        requestAnimationFrame(() => {
          setReady(true);
          markReady(true);
        });
      }).catch((reason) => {
        setError(reason instanceof Error ? reason.message : String(reason));
        setReady(true);
        markReady(true);
      });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : String(reason));
      setReady(true);
      markReady(true);
    }
    return () => {
      instanceRef.current?.destroy();
      instanceRef.current = null;
    };
  }, [mode, style, template, antvData]);

  useEffect(() => {
    const auditWindow = window as AuditWindow;
    auditWindow.__VISUAL_AUDIT_EXPORT__ = async () => {
      let svg: string;
      if (mode === "custom") {
        const node = document.querySelector("[data-visual-audit-root] svg");
        if (!(node instanceof SVGSVGElement)) throw new Error("SVG custom indisponible pour l'export.");
        svg = svgElementToDataUrl(node);
      } else {
        const instance = instanceRef.current;
        if (!instance) throw new Error("Instance AntV indisponible pour l'export.");
        svg = await instance.toDataURL({ type: "svg", embedResources: true });
      }
      if (!svg.startsWith("data:image/svg+xml")) throw new Error("Export SVG invalide.");
      const png = await svgDataUrlToPng(svg, 1);
      if (!png.startsWith("data:image/png")) throw new Error("Export PNG invalide.");
      return { svg, png };
    };
    return () => {
      auditWindow.__VISUAL_AUDIT_EXPORT__ = undefined;
    };
  }, [mode, ready]);

  const maxWidth = mode === "custom"
    ? orientation === "portrait" ? 860 : orientation === "square" ? 980 : 1200
    : 1200;

  return (
    <main
      data-visual-audit-root
      data-audit-ready={ready ? "true" : "false"}
      data-audit-error={error ?? ""}
      style={{ minHeight: "100vh", background: style === "dark" ? "#0B0F16" : "#EEF2F7", padding: 24, boxSizing: "border-box" }}
    >
      <section style={{ width: maxWidth, margin: "0 auto", background: "transparent" }}>
        {error && <div data-audit-error-message style={{ padding: 16, background: "#FEE2E2", color: "#991B1B", marginBottom: 16 }}>{error}</div>}
        {mode === "custom"
          ? <CustomVisual kind={kind} data={customData} style={style} />
          : <div ref={antvRef} data-antv-audit-canvas style={{ width: 1200, height: 760, overflow: "hidden", background: style === "dark" ? "#111827" : "#FFFFFF", borderRadius: 24 }} />}
      </section>
    </main>
  );
}
