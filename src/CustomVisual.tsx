import {
  ArchitectureVisual,
  CycleVisual,
  HubVisual,
  IcebergVisual,
  SankeyVisual,
  TreeVisual,
  VennVisual,
} from "./ConceptVisuals";
import { KPIVisual, MatrixVisual, TableVisual } from "./BusinessVisuals";
import { BarVisual, ColumnVisual, DonutVisual, LineVisual, WaterfallVisual } from "./DataVisuals";
import type { CanonicalInfographic, CustomVisualKind, InfographicStyle } from "./types";

type Props = {
  kind: CustomVisualKind;
  data: CanonicalInfographic;
  style: InfographicStyle;
};

export function CustomVisual({ kind, data, style }: Props) {
  if (kind === "iceberg") return <IcebergVisual data={data} style={style} />;
  if (kind === "cycle") return <CycleVisual data={data} style={style} />;
  if (kind === "sankey") return <SankeyVisual data={data} style={style} />;
  if (kind === "matrix") return <MatrixVisual kind="matrix" data={data} style={style} />;
  if (kind === "swot") return <MatrixVisual kind="swot" data={data} style={style} />;
  if (kind === "impact") return <MatrixVisual kind="impact" data={data} style={style} />;
  if (kind === "eisenhower") return <MatrixVisual kind="eisenhower" data={data} style={style} />;
  if (kind === "risk") return <MatrixVisual kind="risk" data={data} style={style} />;
  if (kind === "architecture") return <ArchitectureVisual data={data} style={style} />;
  if (kind === "hub") return <HubVisual data={data} style={style} />;
  if (kind === "tree") return <TreeVisual data={data} style={style} />;
  if (kind === "venn") return <VennVisual data={data} style={style} />;
  if (kind === "table") return <TableVisual data={data} style={style} />;
  if (kind === "kpi") return <KPIVisual data={data} style={style} />;
  if (kind === "chart-bar") return <BarVisual data={data} style={style} />;
  if (kind === "chart-column") return <ColumnVisual data={data} style={style} />;
  if (kind === "chart-line") return <LineVisual data={data} style={style} />;
  if (kind === "chart-donut") return <DonutVisual data={data} style={style} />;
  return <WaterfallVisual data={data} style={style} />;
}
