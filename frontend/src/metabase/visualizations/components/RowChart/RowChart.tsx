import React, { useMemo } from "react";

import _ from "underscore";

import { TextMeasurer } from "metabase/visualizations/types/measure-text";
import { RowChartView, RowChartViewProps } from "./RowChartView/RowChartView";
import { getMaxYValuesCount, getChartMargin } from "./utils/layout";
import {
  ChartGoal,
  ChartTheme,
  ChartTicksFormatters,
  HoveredData,
  Series,
} from "./types";

const MIN_BAR_HEIGHT = 24;

export interface RowChartProps<TDatum> {
  width: number;
  height: number;

  data: TDatum[];
  series: Series<TDatum>[];
  seriesColors: Record<string, string>;

  trimData: (data: TDatum[], maxLength: number) => TDatum[];

  goal: ChartGoal | null;
  theme: ChartTheme;
  stackingOffset: "none" | "expand" | null;
  shouldShowDataLabels?: boolean;

  tickFormatters: ChartTicksFormatters;
  measureText: TextMeasurer;

  hoveredData?: HoveredData | null;

  onClick: RowChartViewProps<TDatum>["onClick"];
  onHover: RowChartViewProps<TDatum>["onHover"];
}

export const RowChart = <TDatum,>({
  width,
  height,

  data,
  trimData,
  series,
  seriesColors,

  goal,
  theme,
  stackingOffset,
  shouldShowDataLabels,

  tickFormatters,
  measureText,

  hoveredData,

  onClick,
  onHover,
}: RowChartProps<TDatum>) => {
  const maxYValues = useMemo(
    () =>
      getMaxYValuesCount(
        height,
        MIN_BAR_HEIGHT,
        stackingOffset != null,
        series.length,
      ),
    [height, series.length, stackingOffset],
  );

  const trimmedData = trimData(data, maxYValues);

  const { xTickFormatter, yTickFormatter } = tickFormatters;

  const margin = useMemo(
    () =>
      getChartMargin(
        trimmedData,
        series,
        yTickFormatter,
        theme.axis.ticks,
        goal != null,
        measureText,
      ),
    [trimmedData, series, yTickFormatter, theme.axis.ticks, goal, measureText],
  );

  return (
    <RowChartView<TDatum>
      margin={margin}
      theme={theme}
      width={width}
      height={height}
      data={trimmedData}
      series={series}
      goal={goal}
      hoveredData={hoveredData}
      yTickFormatter={yTickFormatter}
      xTickFormatter={xTickFormatter}
      shouldShowDataLabels={shouldShowDataLabels}
      stackingOffset={stackingOffset}
      seriesColors={seriesColors}
      onClick={onClick}
      onHover={onHover}
    />
  );
};
