export type TickFormatter = (value: any) => string;

export type ChartTicksFormatters = {
  xTickFormatter: TickFormatter;
  yTickFormatter: TickFormatter;
};
