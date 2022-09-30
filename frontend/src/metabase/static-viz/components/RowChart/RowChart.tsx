import React from "react";
import { RowChart } from "metabase/visualizations/components/RowChart";
import {
  FontStyle,
  TextMeasurer,
} from "metabase/visualizations/types/measure-text";
import { measureText } from "metabase/static-viz/lib/text";
import { getStackingOffset } from "metabase/visualizations/lib/settings/stacking";
import { useChartSeries } from "metabase/visualizations/components/RowChart/hooks/use-chart-series";
import {
  getGroupedDataset,
  trimData,
} from "metabase/visualizations/components/RowChart/utils/data";
import { getChartGoal } from "metabase/visualizations/lib/settings/goal";
import { getChartTheme } from "metabase/visualizations/components/RowChart/utils/theme";
import { getStaticFormatters } from "./utils/format";

interface RowChartProps {
  data: any;
  card: any;
}

const staticTextMeasurer: TextMeasurer = (text: string, style: FontStyle) =>
  measureText(text, parseInt(style.size, 10), parseInt(style.weight));

const StaticRowChart = ({ data, card }: RowChartProps) => {
  const settings = card.visualization_settings;

  const { chartColumns, series, seriesColors } = useChartSeries(data, settings);
  const groupedData = getGroupedDataset(data, chartColumns);
  const goal = getChartGoal(settings);
  const theme = getChartTheme();
  const stackingOffset = getStackingOffset(settings);
  const shouldShowDataLabels =
    settings["graph.show_values"] && stackingOffset !== "expand";

  const tickFormatters = getStaticFormatters(chartColumns, settings);

  const width = 620;
  const height = 440;

  return (
    <svg width={width} height={height} fontFamily="Lato">
      <RowChart
        width={width}
        height={height}
        data={groupedData}
        trimData={trimData}
        series={series}
        seriesColors={seriesColors}
        goal={goal}
        theme={theme}
        stackingOffset={stackingOffset}
        shouldShowDataLabels={shouldShowDataLabels}
        tickFormatters={tickFormatters}
        measureText={staticTextMeasurer}
      />
    </svg>
  );
};

export default StaticRowChart;
