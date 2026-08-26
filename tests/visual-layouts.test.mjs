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

function itemsFor(kind, count) {
  if (kind === "iceberg") {
    const result = Array.from({ length: count }, (_, index) => item(index, {
      category: index < Math.min(2, Math.max(1, count - 2)) ? "visible" : "deep",
      title: index < 2 ? `Signal visible ${index + 1}` : `Cause profonde ${index - 1}`,
    }));
    if (count >= 6) result[result.length - 1] = item(count - 1, { category: "objective", title: "Objectif", description: "Fiabiliser le traitement sans remplacer tous les outils existants." });
    return result;
  }
  if (["kpi", "chart-bar", "chart-column", "chart-line", "chart-donut", "chart-waterfall"].includes(kind)) {
    return Array.from({ length: count }, (_, index) => numericItem(index, 120 + index * 35));
  }
  return Array.from({ length: count }, (_, index) => item(index));
}

function defaultCount(kind) {
  if (["matrix", "swot", "impact", "eisenhower", "risk"].includes(kind)) return 4;
  if (kind === "venn") return 3;
  if (kind === "architecture") return 5;
  if (kind === "tree") return 7;
  return 6;
}

function dataFor(kind, orientation = "landscape", count = defaultCount(kind)) {
  return {
    title: "Transformation structurée et lisible d'un sujet métier complexe",
    subtitle: "Fixture de validation visuelle utilisée pour contrôler les collisions, les marges et la densité.",
    layout: "list",
    items: itemsFor(kind, count),
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

const variableCounts = {
  iceberg: [3, 4, 5, 6, 7],
  cycle: [3, 4, 5, 6, 7],
  sankey: [3, 4, 5, 6, 7],
  architecture: [3, 4, 5, 6],
  hub: [3, 4, 5, 6],
  tree: [2, 3, 4, 5, 6, 7, 8],
  venn: [2, 3],
  table: [2, 3, 4, 5, 6, 7, 8],
  kpi: [2, 3, 4, 5, 6],
  "chart-bar": [2, 3, 4, 5, 6, 7, 8],
  "chart-column": [2, 3, 4, 5, 6, 7, 8],
  "chart-line": [2, 3, 4, 5, 6, 7, 8],
  "chart-donut": [2, 3, 4, 5, 6],
  "chart-waterfall": [2, 3, 4, 5, 6, 7, 8],
};

for (const [kind, counts] of Object.entries(variableCounts)) {
  for (const count of counts) {
    for (const orientation of ["landscape", "square", "portrait"]) {
      test(`${kind} / ${count} items / ${orientation} reste stable`, () => {
        const plan = buildVisualPlan(kind, dataFor(kind, orientation, count));
        const issues = auditVisualPlan(plan);
        assert.deepEqual(issues, [], issues.join(" | "));
        assert.ok(structuralScore(plan) >= 9, `score structurel insuffisant : ${structuralScore(plan)}`);
      });
    }
  }
}

test("les presets business imposent quatre quadrants", () => {
  for (const kind of ["matrix", "swot", "impact", "eisenhower", "risk"]) {
    const plan = buildVisualPlan(kind, dataFor(kind, "landscape", 4));
    assert.equal(plan.boxes.filter((box) => box.role === "item").length, 4);
    assert.deepEqual(auditVisualPlan(plan), []);
  }
});

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
