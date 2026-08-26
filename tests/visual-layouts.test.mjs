import test from "node:test";
import assert from "node:assert/strict";
import { auditVisualPlan, buildVisualPlan, cleanVisualText, structuralScore, wrapVisualText } from "../src/visual-layout.ts";
import { AUDITED_ANTV_TEMPLATES, CUSTOM_VISUAL_KINDS, buildVariantCatalog } from "../src/visual-catalog.ts";

const baseDescriptions = [
  "Un point essentiel expliqué avec une formulation courte, claire et directement exploitable.",
  "Une information complémentaire utile à la compréhension sans surcharge inutile du visuel.",
  "Un troisième élément synthétique qui doit rester lisible quelle que soit l'orientation choisie.",
  "Une cause ou un axe formulé en moins de quatre-vingt-dix caractères pour une lecture rapide.",
  "Un levier concret qui complète la structure et permet de vérifier les espacements de la composition.",
  "Un dernier point de contrôle pour tester les cas les plus denses du catalogue de représentations.",
  "Une information additionnelle volontairement concise pour tester les grilles comportant sept éléments.",
  "Un huitième élément utilisé uniquement par les rendus capables de gérer cette densité sans collision.",
];

function item(index, extra = {}) {
  return {
    title: `Élément ${index + 1} structuré`,
    description: baseDescriptions[index % baseDescriptions.length],
    blockType: "list",
    claimType: "interpretation",
    ...extra,
  };
}

function numericItem(index, value) {
  return item(index, { value, unit: "k€", category: `T${index + 1}` });
}

function dataFor(kind, orientation = "landscape") {
  let items;
  if (["matrix", "swot", "impact", "eisenhower", "risk"].includes(kind)) {
    items = Array.from({ length: 4 }, (_, index) => item(index));
  } else if (kind === "venn") {
    items = Array.from({ length: 3 }, (_, index) => item(index));
  } else if (kind === "architecture") {
    items = Array.from({ length: 5 }, (_, index) => item(index));
  } else if (kind === "hub" || kind === "cycle" || kind === "sankey") {
    items = Array.from({ length: 6 }, (_, index) => item(index));
  } else if (kind === "tree") {
    items = Array.from({ length: 7 }, (_, index) => item(index));
  } else if (kind === "iceberg") {
    items = [
      item(0, { category: "visible", title: "Délais de réponse", description: "Les délais s'allongent et les relances clients deviennent plus fréquentes." }),
      item(1, { category: "visible", title: "Relances répétées", description: "Les clients doivent recontacter plusieurs fois l'entreprise pour obtenir une réponse." }),
      item(2, { category: "deep", title: "Canaux dispersés" }),
      item(3, { category: "deep", title: "Recopies manuelles" }),
      item(4, { category: "deep", title: "Responsabilités floues" }),
      item(5, { category: "deep", title: "Suivi fragmenté" }),
      item(6, { category: "objective", title: "Objectif", description: "Fiabiliser le traitement des demandes sans remplacer tous les outils existants." }),
    ];
  } else if (["kpi", "chart-bar", "chart-column", "chart-line", "chart-donut", "chart-waterfall"].includes(kind)) {
    items = [240, 280, 310, 370, 420, 455].map((value, index) => numericItem(index, value));
  } else {
    items = Array.from({ length: 6 }, (_, index) => item(index));
  }

  return {
    title: "Transformation structurée et lisible d'un sujet métier complexe",
    subtitle: "Fixture de validation visuelle utilisée pour contrôler les collisions, les marges et la densité.",
    layout: "list",
    items,
    appearance: { orientation },
  };
}

for (const kind of CUSTOM_VISUAL_KINDS) {
  for (const orientation of ["landscape", "square", "portrait"]) {
    test(`${kind} / ${orientation} respecte la grille sans collision`, () => {
      const plan = buildVisualPlan(kind, dataFor(kind, orientation));
      const issues = auditVisualPlan(plan);
      assert.deepEqual(issues, [], issues.join(" | "));
      assert.ok(structuralScore(plan) >= 9, `score structurel insuffisant : ${structuralScore(plan)}`);
      assert.ok(plan.spec.contentTop > 100);
      assert.ok(plan.boxes.length > 0);
    });
  }
}

test("le catalogue custom contient chaque famille une seule fois", () => {
  assert.equal(new Set(CUSTOM_VISUAL_KINDS).size, CUSTOM_VISUAL_KINDS.length);
  assert.equal(CUSTOM_VISUAL_KINDS.length, 19);
});

test("tous les templates AntV exposés appartiennent à la liste auditée", () => {
  const layouts = ["process", "timeline", "list", "comparison"];
  for (const layout of layouts) {
    const count = layout === "comparison" ? 2 : 4;
    const value = {
      title: "Test AntV",
      subtitle: layout === "list" ? undefined : "Sous-titre",
      layout,
      items: Array.from({ length: count }, (_, index) => item(index, { title: `Bloc ${index + 1}`, description: "Texte court compatible avec les gabarits audités." })),
      appearance: { orientation: "landscape" },
    };
    const variants = buildVariantCatalog(value);
    for (const variant of variants.filter((candidate) => candidate.engine !== "custom")) {
      assert.ok(AUDITED_ANTV_TEMPLATES.includes(variant.template), `template non audité : ${variant.template}`);
    }
  }
});

test("les graphiques ne sont exposés qu'avec des valeurs numériques explicites", () => {
  const plain = dataFor("cycle");
  const plainVariants = buildVariantCatalog(plain);
  assert.equal(plainVariants.some((variant) => variant.customKind?.startsWith("chart-")), false);

  const numeric = dataFor("chart-bar");
  const numericVariants = buildVariantCatalog(numeric);
  const numericKinds = numericVariants.map((variant) => variant.customKind).filter(Boolean);
  for (const kind of ["kpi", "chart-bar", "chart-column", "chart-line", "chart-donut", "chart-waterfall"]) {
    assert.ok(numericKinds.includes(kind), `rendu numérique absent : ${kind}`);
  }
});

test("le visuel demandé passe en première position lorsqu'il est compatible", () => {
  const value = dataFor("iceberg");
  value.appearance.visual = "iceberg";
  const variants = buildVariantCatalog(value);
  assert.equal(variants[0]?.customKind, "iceberg");
});

test("le nettoyage de texte supprime les ponctuations aberrantes", () => {
  assert.equal(cleanVisualText("Titre :....   test"), "Titre : test");
  assert.equal(cleanVisualText("Texte   avec   espaces"), "Texte avec espaces");
});

test("le wrapping reste borné et signale la troncature", () => {
  const wrapped = wrapVisualText("Un texte volontairement très long qui doit être limité sans jamais produire une ligne vide ou une collision dans le composant.", 24, 2);
  assert.ok(wrapped.lines.length <= 2);
  assert.ok(wrapped.lines.every((line) => line.trim().length > 0));
  assert.equal(wrapped.truncated, true);
});
