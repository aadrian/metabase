import { DatasetColumn, RowValue } from "metabase-types/api";

export type TickFormatter = (value: any) => string;

export type ChartTicksFormatters = {
  xTickFormatter: TickFormatter;
  yTickFormatter: TickFormatter;
};

export type Margin = {
  top: number;
  bottom: number;
  right: number;
  left: number;
};

export type XValue = number | null;
export type yValue = string;

export type ChartFont = {
  size: number;
  family?: string;
  weight?: number;
  color?: string;
};

export type ChartTheme = {
  axis: {
    color: string;
    minTicksInterval: number;
    ticks: ChartFont;
  };
  dataLabels: ChartFont;
  goal: {
    lineStroke: string;
    label: ChartFont;
  };
  grid: {
    color: string;
  };
};

export type MetricValue = number | null;
export type MetricName = string;
export type BreakoutName = string;
export type MetricDatum = { [key: MetricName]: MetricValue };
export type SeriesOrder = string[];

export type Series<TDatum, TSeriesInfo = unknown> = {
  seriesKey: string;
  xAccessor: (datum: TDatum) => XValue;
  yAccessor: (datum: TDatum) => yValue;
  seriesInfo?: TSeriesInfo;
};

export type SeriesInfo = {
  metricColumn: DatasetColumn;
  dimensionColumn: DatasetColumn;
  breakoutValue?: RowValue;
};

export type GroupedDatum = {
  dimensionValue: RowValue;
  metrics: MetricDatum;
  breakout?: { [key: BreakoutName]: MetricDatum };
};

export type GroupedDataset = GroupedDatum[];

export type HoveredData = {
  seriesIndex: number;
  datumIndex: number;
};

export type ChartGoal = {
  label: string;
  value: number;
};
