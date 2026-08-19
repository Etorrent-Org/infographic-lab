import type {
  CanonicalInfographic,
  InfographicKind,
  InfographicStyle,
} from "./types";

export type StudioTemplate = {
  id: string;
  label: string;
  description: string;
  type: InfographicKind;
  style: InfographicStyle;
  variantIndex: number;
  sourceText: string;
  infographic: CanonicalInfographic;
};

const templates: StudioTemplate[] = [
  {
    id: "diagnostic-ia",
    label: "Diagnostic IA",
    description: "5 étapes pour cadrer et prioriser un diagnostic.",
    type: "process",
    style: "soft",
    variantIndex: 0,
    sourceText: "Template local de diagnostic IA. Remplacez ce texte par vos informations métier avant toute retouche Vibe ciblée.",
    infographic: {
      title: "Diagnostic IA",
      subtitle: "Du besoin au plan d'action",
      layout: "process",
      items: [
        { title: "Cadrer", description: "Définir le besoin et le résultat attendu.", icon: "target" },
        { title: "Observer", description: "Comprendre le processus et les irritants actuels.", icon: "search" },
        { title: "Prioriser", description: "Choisir les cas d'usage à plus forte valeur.", icon: "data" },
        { title: "Tester", description: "Valider rapidement la solution sur un périmètre réduit.", icon: "automation" },
        { title: "Déployer", description: "Transformer le test concluant en plan d'action.", icon: "growth" },
      ],
    },
  },
  {
    id: "roadmap",
    label: "Roadmap",
    description: "Une trajectoire simple en cinq jalons.",
    type: "timeline",
    style: "clean",
    variantIndex: 1,
    sourceText: "Template local de roadmap. Remplacez ce texte par vos jalons, échéances et contraintes avant toute retouche Vibe ciblée.",
    infographic: {
      title: "Roadmap",
      subtitle: "Une progression en cinq jalons",
      layout: "timeline",
      items: [
        { title: "Maintenant", description: "Clarifier le point de départ et l'objectif.", icon: "target" },
        { title: "Jalon 1", description: "Lancer la première action prioritaire.", icon: "process" },
        { title: "Jalon 2", description: "Mesurer les premiers résultats et ajuster.", icon: "data" },
        { title: "Jalon 3", description: "Étendre ce qui fonctionne au bon périmètre.", icon: "growth" },
        { title: "Ensuite", description: "Préparer la prochaine étape de développement.", icon: "calendar" },
      ],
    },
  },
  {
    id: "checklist",
    label: "Checklist",
    description: "6 contrôles avant de passer à l'action.",
    type: "list",
    style: "clean",
    variantIndex: 1,
    sourceText: "Template local de checklist. Remplacez ce texte par vos critères réels avant toute retouche Vibe ciblée.",
    infographic: {
      title: "Checklist",
      subtitle: "Les points à vérifier",
      layout: "list",
      items: [
        { title: "Objectif", description: "Le résultat attendu est clair et mesurable.", icon: "target" },
        { title: "Données", description: "Les informations nécessaires sont disponibles.", icon: "data" },
        { title: "Outils", description: "Les moyens techniques sont identifiés.", icon: "tools" },
        { title: "Sécurité", description: "Les contraintes et risques sont pris en compte.", icon: "security" },
        { title: "Test", description: "Un scénario de validation simple est prévu.", icon: "check" },
        { title: "Mesure", description: "Les indicateurs de réussite sont définis.", icon: "growth" },
      ],
    },
  },
  {
    id: "comparatif",
    label: "Comparatif",
    description: "Deux options face à face.",
    type: "comparison",
    style: "clean",
    variantIndex: 0,
    sourceText: "Template local de comparaison. Remplacez ce texte par les faits concernant les deux options avant toute retouche Vibe ciblée.",
    infographic: {
      title: "Comparer deux options",
      subtitle: "Mettre en évidence les différences utiles",
      layout: "comparison",
      items: [
        { title: "Option A", description: "Décrivez ici le premier choix.", icon: "idea" },
        { title: "Option B", description: "Décrivez ici le second choix.", icon: "spark" },
      ],
    },
  },
  {
    id: "processus",
    label: "Processus",
    description: "Un flux opérationnel prêt à personnaliser.",
    type: "process",
    style: "clean",
    variantIndex: 0,
    sourceText: "Template local de processus. Remplacez ce texte par votre processus réel avant toute retouche Vibe ciblée.",
    infographic: {
      title: "Processus",
      subtitle: "De l'entrée au résultat",
      layout: "process",
      items: [
        { title: "Entrée", description: "Identifier le déclencheur du processus.", icon: "idea" },
        { title: "Préparer", description: "Rassembler les éléments nécessaires.", icon: "tools" },
        { title: "Exécuter", description: "Réaliser l'action principale.", icon: "process" },
        { title: "Contrôler", description: "Vérifier le résultat obtenu.", icon: "check" },
        { title: "Finaliser", description: "Clore et transmettre le résultat.", icon: "target" },
      ],
    },
  },
  {
    id: "plan-action",
    label: "Plan d'action",
    description: "4 axes simples, orientés exécution.",
    type: "process",
    style: "soft",
    variantIndex: 0,
    sourceText: "Template local de plan d'action. Remplacez ce texte par vos actions, responsables et contraintes réelles avant toute retouche Vibe ciblée.",
    infographic: {
      title: "Plan d'action",
      subtitle: "Passer de l'intention à l'exécution",
      layout: "process",
      items: [
        { title: "Prioriser", description: "Sélectionner l'action la plus utile à lancer.", icon: "target" },
        { title: "Organiser", description: "Définir les moyens et la séquence de travail.", icon: "calendar" },
        { title: "Exécuter", description: "Mettre en œuvre sur un périmètre maîtrisé.", icon: "process" },
        { title: "Mesurer", description: "Contrôler l'effet et décider de la suite.", icon: "data" },
      ],
    },
  },
  {
    id: "offre",
    label: "Présentation d'offre",
    description: "Une offre en quatre messages clés.",
    type: "list",
    style: "clean",
    variantIndex: 0,
    sourceText: "Template local de présentation d'offre. Remplacez ce texte par votre proposition de valeur réelle avant toute retouche Vibe ciblée.",
    infographic: {
      title: "Notre offre",
      subtitle: "Une proposition claire et lisible",
      layout: "list",
      items: [
        { title: "Problème", description: "Formulez le besoin auquel l'offre répond.", icon: "warning" },
        { title: "Solution", description: "Présentez la réponse proposée simplement.", icon: "spark" },
        { title: "Bénéfices", description: "Mettez en avant les effets utiles pour le client.", icon: "growth" },
        { title: "Prochaine étape", description: "Indiquez l'action simple pour avancer.", icon: "customer" },
      ],
    },
  },
  {
    id: "iceberg",
    label: "Iceberg",
    description: "Visible en surface, causes et leviers en profondeur.",
    type: "list",
    style: "chalk",
    variantIndex: 2,
    sourceText: "Template local Iceberg. Les deux premiers éléments représentent ce qui est visible ; les suivants décrivent les causes, mécanismes ou leviers sous la surface.",
    infographic: {
      title: "Le modèle de l'Iceberg",
      subtitle: "Ce que l'on voit n'est qu'une partie du système",
      layout: "list",
      items: [
        { title: "Symptôme visible", description: "Le signal observable au premier regard.", icon: "warning" },
        { title: "Résultat apparent", description: "La conséquence directement mesurable.", icon: "data" },
        { title: "Processus", description: "Les mécanismes qui produisent le résultat.", icon: "process" },
        { title: "Données", description: "Les informations qui orientent les décisions.", icon: "data" },
        { title: "Compétences", description: "Les savoir-faire et habitudes qui influencent l'exécution.", icon: "team" },
        { title: "Hypothèses", description: "Les croyances ou règles implicites les plus profondes.", icon: "idea" },
      ],
    },
  },
  {
    id: "cycle",
    label: "Cycle",
    description: "Une boucle d'amélioration continue.",
    type: "process",
    style: "sketch",
    variantIndex: 4,
    sourceText: "Template local de cycle. Décrivez des étapes qui se répètent et s'améliorent à chaque boucle.",
    infographic: {
      title: "Cycle d'amélioration",
      subtitle: "Observer, décider, agir, mesurer, recommencer",
      layout: "process",
      items: [
        { title: "Observer", description: "Collecter les faits et signaux utiles.", icon: "search" },
        { title: "Décider", description: "Choisir l'action la plus pertinente.", icon: "target" },
        { title: "Agir", description: "Mettre en œuvre sur un périmètre maîtrisé.", icon: "process" },
        { title: "Mesurer", description: "Comparer le résultat à l'objectif.", icon: "data" },
        { title: "Ajuster", description: "Capitaliser et préparer la boucle suivante.", icon: "growth" },
      ],
    },
  },
  {
    id: "sankey-simple",
    label: "Sankey simple",
    description: "Un flux narratif entre plusieurs étapes.",
    type: "process",
    style: "dark",
    variantIndex: 5,
    sourceText: "Template local de Sankey narratif. Il représente un enchaînement qualitatif ; les épaisseurs ne codent pas de données quantitatives en V1.",
    infographic: {
      title: "Flux de valeur",
      subtitle: "De l'entrée au résultat",
      layout: "process",
      items: [
        { title: "Entrées", description: "Les éléments qui alimentent le flux.", icon: "idea" },
        { title: "Tri", description: "La première qualification des informations.", icon: "search" },
        { title: "Transformation", description: "L'étape où la valeur est réellement créée.", icon: "process" },
        { title: "Contrôle", description: "La vérification avant transmission.", icon: "check" },
        { title: "Sortie", description: "Le résultat remis à l'utilisateur ou au client.", icon: "customer" },
      ],
    },
  },
];

export const studioTemplates = templates.map(({ infographic, ...template }) => ({
  ...template,
  infographic,
}));

export function getStudioTemplate(id: string): StudioTemplate | null {
  const template = templates.find((item) => item.id === id);
  if (!template) return null;
  return JSON.parse(JSON.stringify(template)) as StudioTemplate;
}