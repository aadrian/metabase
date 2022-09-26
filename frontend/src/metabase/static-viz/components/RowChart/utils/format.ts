import { RowValue, VisualizationSettings } from "metabase-types/api";
import { ChartColumns } from "metabase/visualizations/lib/graph/columns";
import { getStackingOffset } from "metabase/visualizations/lib/settings/stacking";
import { ChartTicksFormatters } from "metabase/visualizations/components/RowChart/RowChartView/types/format";

// TODO: implement formatting that does not import any code not supported by static viz SSR env
export const getStaticFormatters = (
  _chartColumns: ChartColumns,
  settings: VisualizationSettings,
): ChartTicksFormatters => {
  const yTickFormatter = (value: RowValue) => {
    return String(value);
  };

  const percentXTicksFormatter = (percent: any) => String(percent);

  const xTickFormatter = (value: any) => value;

  const shouldFormatXTicksAsPercent = getStackingOffset(settings) === "expand";

  return {
    yTickFormatter,
    xTickFormatter: shouldFormatXTicksAsPercent
      ? percentXTicksFormatter
      : xTickFormatter,
  };
};
