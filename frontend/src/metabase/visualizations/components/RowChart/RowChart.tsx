import React, { useMemo } from "react";

import _ from "underscore";

import { DatasetData, VisualizationSettings } from "metabase-types/api";
import { getStackingOffset } from "metabase/visualizations/lib/settings/stacking";
import { getChartGoal } from "metabase/visualizations/lib/settings/goal";
import {
  ChartColumns,
  getChartColumns,
} from "metabase/visualizations/lib/graph/columns";
import { TextMeasurer } from "metabase/visualizations/types/measure-text";
import { getGroupedDataset, getSeries, groupExcessiveData } from "./utils/data";
import { RowChartView } from "./RowChartView/RowChartView";
import { getMaxYValuesCount } from "./utils/layout";
import { getChartMargin } from "./utils/margin";
import { getClickData } from "./utils/events";
import { getChartTheme } from "./utils/theme";
import { getSeriesColors } from "./utils/colors";
import { ChartTicksFormatters } from "./RowChartView/types/format";

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
  onVisualizationClick?: $FIXME;
}

export const RowChart = ({
  width,
  height,
  settings,
  data,
  getFormatters,
  measureText,
  onVisualizationClick,
}: RowChartProps) => {
  const chartColumns = useMemo(
    () => getChartColumns(data, settings),
    [data, settings],
  );

  const seriesOrder = useMemo(() => {
    const seriesOrderSettings = settings["graph.series_order"];
    if (!seriesOrderSettings) {
      return;
    }

    return seriesOrderSettings
      .filter(setting => setting.enabled)
      .map(setting => setting.name);
  }, [settings]);

  const groupedData = useMemo(
    () => getGroupedDataset(data, chartColumns),
    [chartColumns, data],
  );
  const series = useMemo(
    () => getSeries(data, chartColumns, seriesOrder),
    [chartColumns, data, seriesOrder],
  );

  const seriesColors = useMemo(
    () => getSeriesColors(settings, series),
    [series, settings],
  );

  const goal = useMemo(() => getChartGoal(settings), [settings]);

  const theme = useMemo(getChartTheme, []);

  const stackingOffset = getStackingOffset(settings);

  const maxYValues = getMaxYValuesCount(
    height,
    MIN_BAR_HEIGHT,
    stackingOffset != null,
    series.length,
  );

  const trimmedData = useMemo(
    () => groupExcessiveData(groupedData, maxYValues),
    [groupedData, maxYValues],
  );

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
      groupedData,
      settings,
      chartColumns,
    );

    onVisualizationClick({ ...clickData, element: event.target });
  };

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
      yTickFormatter={yTickFormatter}
      xTickFormatter={xTickFormatter}
      shouldShowLabels={shouldShowLabels}
      stackingOffset={stackingOffset}
      seriesColors={seriesColors}
    />
  );
};
