import {
  DatasetColumn,
  RowValue,
  VisualizationSettings,
} from "metabase-types/api";
import { Series } from "../RowChartView/types/series";
import { ChartColumns } from "../../../lib/graph/columns";
import { GroupedDataset, GroupedDatum, SeriesInfo } from "./data";

export const getClickData = (
  seriesIndex: number,
  datumIndex: number,
  series: Series<GroupedDatum, SeriesInfo>[],
  groupedData: GroupedDataset,
  visualizationSettings: VisualizationSettings,
  chartColumns: ChartColumns,
) => {
  const clickedSeries = series[seriesIndex];
  const datum = groupedData[datumIndex];

  const xValue = clickedSeries.xAccessor(datum);
  const yValue = clickedSeries.yAccessor(datum);

  const dimensions: { column: DatasetColumn; value?: RowValue }[] = [
    {
      column: chartColumns.dimension.column,
      value: yValue,
    },
  ];

  if ("breakout" in chartColumns) {
    dimensions.push({
      column: chartColumns.breakout.column,
      value: clickedSeries.seriesInfo?.breakoutValue,
    });
  }

  return {
    value: xValue,
    column: clickedSeries.seriesInfo?.metricColumn,
    dimensions,
    settings: visualizationSettings,
  };
};

export const getHoverData = (
  seriesIndex: number,
  datumIndex: number,
  series: Series<GroupedDatum, SeriesInfo>[],
  groupedData: GroupedDataset,
  chartColumns: ChartColumns,
) => {
  const currentSeries = series[seriesIndex];
  const currentDatum = groupedData[datumIndex];

  const data = [
    {
      key: chartColumns.dimension.column.display_name,
      value: currentDatum.dimensionValue,
    },
  ];

  if ("breakout" in chartColumns) {
    data.push({
      key: chartColumns.breakout.column.display_name,
      value: currentSeries.seriesKey,
    });

    data.push({
      key: chartColumns.metric.column.display_name,
      value: currentSeries.xAccessor(currentDatum),
    });
  }

  const result = {
    index: seriesIndex,
    seriesIndex,
    datumIndex,
    data,
  };

  return result;
};
