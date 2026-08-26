import { CustomVisual as CatalogCustomVisual } from "./CustomVisualCatalog";
import { IcebergVisual } from "./IcebergVisual";
import type { CanonicalInfographic, CustomVisualKind, InfographicStyle } from "./types";

type Props = {
  kind: CustomVisualKind;
  data: CanonicalInfographic;
  style: InfographicStyle;
};

export function CustomVisual({ kind, data, style }: Props) {
  if (kind === "iceberg") return <IcebergVisual data={data} style={style} />;
  return <CatalogCustomVisual kind={kind} data={data} style={style} />;
}
