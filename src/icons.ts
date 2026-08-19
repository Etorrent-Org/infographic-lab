import type { InfographicIcon } from "./types";

type IconDefinition = {
  key: InfographicIcon;
  label: string;
  body: string;
};

const stroke = "#5f5a52";

const definitions: IconDefinition[] = [
  { key: "idea", label: "Idée", body: '<path d="M9 18h6M10 22h4M8.5 14.5C7 13.4 6 11.6 6 9.5a6 6 0 1 1 12 0c0 2.1-1 3.9-2.5 5-.9.7-1.5 1.6-1.5 2.5h-4c0-.9-.6-1.8-1.5-2.5Z"/>' },
  { key: "search", label: "Recherche", body: '<circle cx="11" cy="11" r="6"/><path d="m16 16 5 5"/>' },
  { key: "target", label: "Cible", body: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><path d="M12 2v4M22 12h-4"/>' },
  { key: "process", label: "Processus", body: '<path d="M4 7h11l-3-3M20 17H9l3 3M15 4l3 3-3 3M9 14l-3 3 3 3"/>' },
  { key: "team", label: "Équipe", body: '<circle cx="9" cy="9" r="3"/><circle cx="17" cy="10" r="2.5"/><path d="M3 20c.7-3.3 2.8-5 6-5s5.3 1.7 6 5M14 17c1-.9 2.2-1.3 3.7-1.3 2.1 0 3.5 1.1 4.3 3.3"/>' },
  { key: "data", label: "Données", body: '<path d="M5 20V10M12 20V4M19 20v-7M3 20h18"/>' },
  { key: "security", label: "Sécurité", body: '<path d="M12 3 5 6v5c0 4.6 2.7 8.1 7 10 4.3-1.9 7-5.4 7-10V6l-7-3Z"/><path d="m9 12 2 2 4-4"/>' },
  { key: "automation", label: "Automatisation", body: '<path d="M7 7h7l-2.5-2.5M17 17h-7l2.5 2.5M14 4.5 17 7l-3 3M10 14l-3 3 3 3"/><circle cx="12" cy="12" r="2.2"/>' },
  { key: "growth", label: "Croissance", body: '<path d="M4 19h16M6 16l4-5 3 2 5-7M15 6h3v3"/>' },
  { key: "money", label: "Finance", body: '<circle cx="12" cy="12" r="8"/><path d="M15 9.5c-.5-1-1.5-1.5-3-1.5-1.7 0-3 .8-3 2s1.1 1.8 3 2c1.9.2 3 1 3 2s-1.3 2-3 2c-1.5 0-2.5-.5-3-1.5M12 6v12"/>' },
  { key: "customer", label: "Client", body: '<circle cx="12" cy="8" r="3"/><path d="M5 21c.8-4.1 3.1-6 7-6s6.2 1.9 7 6"/>' },
  { key: "check", label: "Validation", body: '<circle cx="12" cy="12" r="9"/><path d="m8 12 2.5 2.5L16.5 9"/>' },
  { key: "warning", label: "Alerte", body: '<path d="M12 3 2.8 20h18.4L12 3Z"/><path d="M12 9v5M12 17h.01"/>' },
  { key: "calendar", label: "Planning", body: '<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M8 3v4M16 3v4M4 10h16M8 14h3M13 14h3"/>' },
  { key: "tools", label: "Outils", body: '<path d="M14.5 5.5a4 4 0 0 0-5 5L4 16l4 4 5.5-5.5a4 4 0 0 0 5-5l-3 3-3-3 2-4Z"/>' },
  { key: "spark", label: "Innovation", body: '<path d="m12 2 1.8 5.2L19 9l-5.2 1.8L12 16l-1.8-5.2L5 9l5.2-1.8L12 2ZM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8L19 16Z"/>' },
];

export const iconCatalog = definitions.map(({ key, label }) => ({ key, label }));

const iconBody = new Map(definitions.map((item) => [item.key, item.body]));

export function iconDataUri(key: InfographicIcon) {
  const body = iconBody.get(key);
  if (!body) return undefined;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="${stroke}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
