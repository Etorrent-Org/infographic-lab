import type { Data, InfographicOptions, ThemeConfig } from "@antv/infographic";
import { iconDataUri } from "./icons";
import type {
  CanonicalInfographic,
  CustomVisualKind,
  InfographicAppearance,
  InfographicItem,
  InfographicStyle,
} from "./types";

export type AntvVisualVariant = {
  label: string;
  template: string;
  engine?: "antv" | "custom";
  customKind?: CustomVisualKind;
};

type ThemeDefinition = { theme: string; config: ThemeConfig };

const cleanTheme: ThemeDefinition = {
  theme: "default",
  config: {
    colorPrimary: "#315A78",
    colorBg: "#FFFFFF",
    palette: ["#315A78", "#5E7C8F", "#8AA6B4", "#C0D0D8"],
  },
};

const softTheme: ThemeDefinition = {
  theme: "default",
  config: {
    colorPrimary: "#7B6751",
    colorBg: "#F7F3EB",
    palette: ["#7B6751", "#9C876F", "#71837B", "#C1A77F"],
  },
};

const darkTheme: ThemeDefinition = {
  theme: "dark",
  config: {
    colorPrimary: "#74D3C5",
    colorBg: "#111827",
    palette: ["#74D3C5", "#7AA7E8", "#B18AE8", "#E3B86B"],
  },
};

const sketchTheme: ThemeDefinition = {
  theme: "default",
  config: {
    colorPrimary: "#4F5B66",
    colorBg: "#FBF8F0",
    palette: ["#4F5B66", "#8A6D55", "#6A7D70", "#A88F6A"],
  },
};

const chalkTheme: ThemeDefinition = {
  theme: "dark",
  config: {
    colorPrimary: "#F4F0DC",
    colorBg: "#27302E",
    palette: ["#F4F0DC", "#D7C77D", "#91C3AF", "#C79BB5", "#9AB8D0"],
  },
};

const styleThemes: Record<InfographicStyle, ThemeDefinition> = {
  clean: cleanTheme,
  soft: softTheme,
  dark: darkTheme,
  sketch: sketchTheme,
  chalk: chalkTheme,
  zen: softTheme,
  pro: cleanTheme,
  minimal: cleanTheme,
  tech: darkTheme,
};

export const styleAppearanceDefaults: Record<
  InfographicStyle,
  Required<Pick<InfographicAppearance, "accent" | "background">>
> = {
  clean: { accent: "#315A78", background: "#FFFFFF" },
  soft: { accent: "#7B6751", background: "#F7F3EB" },
  dark: { accent: "#74D3C5", background: "#111827" },
  sketch: { accent: "#4F5B66", background: "#FBF8F0" },
  chalk: { accent: "#F4F0DC", background: "#27302E" },
  zen: { accent: "#7B6751", background: "#F7F3EB" },
  pro: { accent: "#315A78", background: "#FFFFFF" },
  minimal: { accent: "#27272A", background: "#FFFFFF" },
  tech: { accent: "#74D3C5", background: "#111827" },
};

export function getVisualColors(style: InfographicStyle, value: CanonicalInfographic) {
  const theme = styleThemes[style];
  const defaults = styleAppearanceDefaults[style];
  const accent = value.appearance?.accent ?? defaults.accent;
  const background = value.appearance?.background ?? defaults.background;
  const basePalette = Array.isArray(theme.config.palette)
    ? theme.config.palette
    : [accent];
  return {
    accent,
    background,
    palette: [accent, ...basePalette.slice(1)] as string[],
    dark: style === "dark" || style === "chalk" || style === "tech",
  };
}

function dataIcon(item: InfographicItem) {
  return item.icon ? iconDataUri(item.icon) : undefined;
}

function listData(value: CanonicalInfographic): Data {
  return {
    title: value.title,
    desc: value.subtitle,
    lists: value.items.map((item) => ({
      label: item.title,
      desc: item.description,
      icon: dataIcon(item),
    })),
  };
}

function sequenceData(value: CanonicalInfographic): Data {
  return {
    title: value.title,
    desc: value.subtitle,
    sequences: value.items.map((item) => ({
      label: item.title,
      desc: item.description,
      icon: dataIcon(item),
    })),
    order: "asc",
  };
}

function timelineData(value: CanonicalInfographic): Data {
  return {
    title: value.title,
    desc: value.subtitle,
    sequences: value.items.map((item, index) => ({
      time: String(index + 1).padStart(2, "0"),
      label: item.title,
      desc: item.description,
      icon: dataIcon(item),
    })),
    order: "asc",
  };
}

function comparisonData(value: CanonicalInfographic): Data {
  const [left, right] = value.items;
  return {
    title: value.title,
    compares: [left, right].map((item) => ({
      label: item.title,
      icon: dataIcon(item),
      children: [
        {
          label: item.title,
          desc: item.description,
          icon: dataIcon(item),
        },
      ],
    })),
  };
}

function supportsCompactCards(value: CanonicalInfographic) {
  return value.items.every(
    (item) => item.title.trim().length <= 28 && item.description.trim().length <= 60,
  );
}

function supportsTightGeometry(value: CanonicalInfographic) {
  return value.items.every(
    (item) => item.title.trim().length <= 26 && item.description.trim().length <= 42,
  );
}

function supportsCustomNarrative(value: CanonicalInfographic) {
  return (
    value.items.length >= 3 &&
    value.items.length <= 7 &&
    value.items.every(
      (item) => item.title.trim().length <= 30 && item.description.trim().length <= 90,
    )
  );
}

function resolveTheme(style: InfographicStyle, value: CanonicalInfographic) {
  const visual = styleThemes[style];
  const { accent, background } = getVisualColors(style, value);
  const density = value.appearance?.density ?? "balanced";

  const densityTypography =
    density === "compact"
      ? {
          label: { "font-size": 13, "line-height": "17px" },
          desc: { "font-size": 11, "line-height": "15px" },
        }
      : density === "airy"
        ? {
            label: { "font-size": 14, "line-height": "19px" },
            desc: { "font-size": 12, "line-height": "19px" },
          }
        : {
            label: { "font-size": 14, "line-height": "18px" },
            desc: { "font-size": 12, "line-height": "17px" },
          };

  const family =
    style === "chalk"
      ? "Segoe Print, Comic Sans MS, cursive"
      : style === "sketch"
        ? "Segoe Print, Comic Sans MS, cursive"
        : "Segoe UI, Arial, sans-serif";

  const config: ThemeConfig = {
    ...visual.config,
    colorPrimary: accent,
    colorBg: background,
    palette: getVisualColors(style, value).palette,
    item: {
      ...(visual.config.item ?? {}),
      label: {
        ...(visual.config.item?.label ?? {}),
        ...densityTypography.label,
        "font-family": family,
      },
      desc: {
        ...(visual.config.item?.desc ?? {}),
        ...densityTypography.desc,
        "font-family": family,
      },
    },
  };

  return { theme: visual.theme, config };
}

function customVariant(label: string, customKind: CustomVisualKind): AntvVisualVariant {
  return {
    label,
    template: `custom-${customKind}`,
    engine: "custom",
    customKind,
  };
}

export function getAntvVariants(value: CanonicalInfographic): AntvVisualVariant[] {
  const compactCards = supportsCompactCards(value);
  const tightGeometry = supportsTightGeometry(value);
  const customNarrative = supportsCustomNarrative(value);

  if (value.layout === "process") {
    const variants: AntvVisualVariant[] =
      value.items.length <= 4
        ? [
            { label: "Etapes", template: "sequence-steps-simple" },
            { label: "Serpent", template: "sequence-snake-steps-simple" },
            { label: "Ligne", template: "sequence-timeline-simple" },
            { label: "Cylindres", template: "sequence-cylinders-3d-simple" },
            { label: "Icones", template: "sequence-color-snake-steps-horizontal-icon-line" },
          ]
        : [
            { label: "Serpent", template: "sequence-snake-steps-simple" },
            { label: "Roadmap", template: "sequence-roadmap-vertical-simple" },
            { label: "Cylindres", template: "sequence-cylinders-3d-simple" },
            { label: "Icones", template: "sequence-color-snake-steps-horizontal-icon-line" },
          ];

    if (customNarrative) {
      variants.push(customVariant("Cycle", "cycle"), customVariant("Sankey simple", "sankey"));
    }

    if (compactCards) {
      variants.push(
        value.items.length <= 4
          ? { label: "Cartes", template: "sequence-stairs-front-compact-card" }
          : { label: "Cartes", template: "sequence-snake-steps-compact-card" },
      );
    }

    if (tightGeometry) {
      variants.push(
        { label: "Ascendant", template: "sequence-ascending-steps" },
        { label: "Entonnoir", template: "sequence-funnel-simple" },
        { label: "Pyramide", template: "sequence-pyramid-simple" },
      );
    }

    return variants;
  }

  if (value.layout === "timeline") {
    const variants: AntvVisualVariant[] = [
      { label: "Ligne", template: "sequence-timeline-simple" },
      { label: "Roadmap", template: "sequence-roadmap-vertical-simple" },
      { label: "Serpent", template: "sequence-snake-steps-simple" },
      { label: "Texte", template: "sequence-horizontal-zigzag-underline-text" },
      { label: "Icones", template: "sequence-horizontal-zigzag-horizontal-icon-line" },
    ];
    if (customNarrative) variants.push(customVariant("Cycle", "cycle"));
    return variants;
  }

  if (value.layout === "comparison") {
    const variants: AntvVisualVariant[] = [
      { label: "VS simple", template: "compare-binary-horizontal-simple-vs" },
      { label: "VS texte", template: "compare-binary-horizontal-underline-text-vs" },
    ];

    if (compactCards) {
      variants.push(
        { label: "VS cartes", template: "compare-binary-horizontal-badge-card-vs" },
        { label: "VS compact", template: "compare-binary-horizontal-compact-card-vs" },
      );
    }

    return variants;
  }

  const variants: AntvVisualVariant[] = [
    { label: "Epure", template: "list-grid-simple" },
    { label: "Icones", template: "list-grid-horizontal-icon-arrow" },
  ];

  if (value.items.length <= 4) {
    variants.push({ label: "Ligne", template: "list-row-horizontal-icon-line" });
  }

  if (customNarrative) {
    variants.push(customVariant("Iceberg", "iceberg"));
  }

  if (!value.subtitle?.trim() && tightGeometry) {
    variants.push({ label: "Radial", template: "list-sector-simple" });
  }

  if (compactCards) {
    variants.push(
      { label: "Cartes", template: "list-grid-badge-card" },
      { label: "Compact", template: "list-grid-compact-card" },
      { label: "Pyramide", template: "list-pyramid-compact-card" },
      { label: "Waterfall", template: "list-waterfall-compact-card" },
    );
  }

  return variants;
}

export function buildAntvOptions(
  value: CanonicalInfographic,
  style: InfographicStyle,
  variantIndex = 0,
): Partial<InfographicOptions> {
  const visual = resolveTheme(style, value);
  const variants = getAntvVariants(value);
  const safeIndex = ((variantIndex % variants.length) + variants.length) % variants.length;
  const variant = variants[safeIndex];

  if (variant.engine === "custom") {
    throw new Error("Ce rendu est géré par le moteur SVG local.");
  }

  if (value.layout === "process") {
    return {
      template: variant.template,
      theme: visual.theme,
      themeConfig: visual.config,
      data: sequenceData(value),
    };
  }

  if (value.layout === "timeline") {
    return {
      template: variant.template,
      theme: visual.theme,
      themeConfig: visual.config,
      data: timelineData(value),
    };
  }

  if (value.layout === "comparison") {
    return {
      template: variant.template,
      theme: visual.theme,
      themeConfig: visual.config,
      data: comparisonData(value),
    };
  }

  return {
    template: variant.template,
    theme: visual.theme,
    themeConfig: visual.config,
    data: listData(value),
  };
}
