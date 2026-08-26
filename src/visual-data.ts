import type { InfographicItem } from "./types";

export function numericValue(item: InfographicItem) {
  return typeof item.value === "number" && Number.isFinite(item.value) ? item.value : null;
}

export function numericItems(items: InfographicItem[]) {
  return items.filter((item) => numericValue(item) !== null);
}

export function formatNumericValue(item: InfographicItem, value = numericValue(item)) {
  if (value === null || !Number.isFinite(value)) return "—";
  const formatted = new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: Math.abs(value) < 10 ? 2 : 1,
  }).format(value);
  return `${formatted}${item.unit ? ` ${item.unit}` : ""}`;
}

export function consistentUnit(items: InfographicItem[]) {
  const units = [...new Set(items.map((item) => item.unit?.trim()).filter((unit): unit is string => Boolean(unit)))];
  return units.length === 1 ? units[0] : null;
}

export function positiveNumericItems(items: InfographicItem[]) {
  return numericItems(items).filter((item) => (numericValue(item) ?? 0) > 0);
}
