import React, { useMemo } from "react";

import _ from "underscore";

import { DatasetData, VisualizationSettings } from "metabase-types/api";
import { getStackingOffset } from "metabase/visualizations/lib/settings/stacking";
import { getChartGoal } from "metabase/visualizations/lib/settings/goal";
import { ChartColumns } from "metabase/visualizations/lib/graph/columns";
import { TextMeasurer } from "metabase/visualizations/types/measure-text";
import { RowChartView } from "./RowChartView/RowChartView";
import { getMaxYValuesCount, getChartMargin } from "./utils/layout";
import { getClickData, getHoverData } from "./utils/events";
import { getChartTheme } from "./utils/theme";
import { ChartTicksFormatters } from "./RowChartView/types/format";
import { useChartSeries } from "./hooks/use-chart-series";
import { useChartDataset } from "./hooks/use-chart-dataset";

const MIN_BAR_HEIGHT = 24;

type $FIXME = any;

interface RowChartProps {
  width: number;
  height: number;
  data: DatasetData;
  settings: VisualizationSettings;
  measureText: TextMeasurer;
  getFormatters: (
    chartColumns: ChartColumns,
    settings: VisualizationSettings,
  ) => ChartTicksFormatters;
  hovered: $FIXME;
  onVisualizationClick?: $FIXME;
  onHoverChange?: $FIXME;
}

export const RowChart = ({
  width,
  height,
  settings,
  data,
  getFormatters,
  measureText,
  hovered,
  onVisualizationClick,
  onHoverChange,
}: RowChartProps) => {
  const { chartColumns, series, seriesColors } = useChartSeries(data, settings);
  const goal = useMemo(() => getChartGoal(settings), [settings]);
  const theme = useMemo(getChartTheme, []);
  const stackingOffset = getStackingOffset(settings);

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

  const { trimmedData } = useChartDataset(chartColumns, data, maxYValues);

  const { xTickFormatter, yTickFormatter } = useMemo(
    () => getFormatters(chartColumns, settings),
    [chartColumns, getFormatters, settings],
  );

  const margin = useMemo(
    () =>
      getChartMargin(
        trimmedData,
        yTickFormatter,
        theme.axis.ticks,
        goal != null,
        measureText,
      ),
    [goal, measureText, theme.axis.ticks, trimmedData, yTickFormatter],
  );

  const shouldShowLabels =
    settings["graph.show_values"] && stackingOffset !== "expand";

  const handleClick = (
    event: React.MouseEvent,
    seriesIndex: number,
    datumIndex: number,
  ) => {
    const clickData = getClickData(
      seriesIndex,
      datumIndex,
      series,
      trimmedData,
      settings,
      chartColumns,
    );

    onVisualizationClick({ ...clickData, element: event.target });
  };

  const handleHoverChange = (
    event: React.MouseEvent,
    seriesIndex: number | null,
    datumIndex: number | null,
  ) => {
    if (seriesIndex == null || datumIndex == null) {
      onHoverChange(null);
      return;
    }
    const hoverData = getHoverData(
      seriesIndex,
      datumIndex,
      series,
      trimmedData,
      chartColumns,
    );
    onHoverChange({ ...hoverData, event: event.nativeEvent });
  };

  // FIXME: unify-transform different shapes of the hover object on the upper level
  const hoveredSeriesIndex: number | undefined =
    hovered?.seriesIndex || hovered?.index;

  return (
    <RowChartView
      margin={margin}
      theme={theme}
      width={width}
      height={height}
      data={trimmedData}
      series={series}
      goal={goal}
      onClick={handleClick}
      hoveredSeriesIndex={hoveredSeriesIndex}
      onHoverChange={handleHoverChange}
      yTickFormatter={yTickFormatter}
      xTickFormatter={xTickFormatter}
      shouldShowLabels={shouldShowLabels}
      stackingOffset={stackingOffset}
      seriesColors={seriesColors}
    />
  );
};
