import { t } from "ttag";
import { DatasetData, RowValue, RowValues } from "metabase-types/api";

import {
  ChartColumns,
  ColumnDescriptor,
  getColumnDescriptors,
} from "metabase/visualizations/lib/graph/columns";
import {
  GroupedDataset,
  GroupedDatum,
  MetricDatum,
  MetricValue,
  Series,
  SeriesInfo,
  SeriesOrder,
} from "../types";

// FIXME: use import { isMetric } from "metabase/lib/schema_metadata" but make it work for the static viz
const isMetric = (col: any) => col && col.source !== "breakout";

const getMetricValue = (value: RowValue): MetricValue => {
  if (typeof value === "number") {
    return value;
  }

  return null;
};

const sumMetrics = (left: MetricDatum, right: MetricDatum): MetricDatum => {
  const keys = new Set([...Object.keys(left), ...Object.keys(right)]);
  return Array.from(keys).reduce<MetricDatum>((datum, metricKey) => {
    const leftValue = left[metricKey];
    const rightValue = right[metricKey];

    if (typeof leftValue === "number" || typeof rightValue === "number") {
      datum[metricKey] = (leftValue ?? 0) + (rightValue ?? 0);
    } else {
      datum[metricKey] = null;
    }

    return datum;
  }, {});
};

const groupDataByDimensions = (
  rows: RowValues[],
  chartColumns: ChartColumns,
  allMetrics: ColumnDescriptor[],
): GroupedDataset => {
  const { dimension } = chartColumns;

  const groupedData = new Map<RowValue, GroupedDatum>();

  for (const row of rows) {
    const dimensionValue = row[dimension.index];

    const datum = groupedData.get(dimensionValue) ?? {
      dimensionValue,
      metrics: {},
    };

    const rowMetrics = allMetrics.reduce<MetricDatum>((datum, metric) => {
      datum[metric.column.name] = getMetricValue(row[metric.index]);
      return datum;
    }, {});

    datum.metrics = sumMetrics(rowMetrics, datum.metrics);

    if ("breakout" in chartColumns) {
      const breakoutName = String(row[chartColumns.breakout.index]);

      datum.breakout ??= {};
      datum.breakout = {
        ...datum.breakout,
        [breakoutName]: sumMetrics(
          rowMetrics,
          datum.breakout[breakoutName] ?? {},
        ),
      };
    }

    groupedData.set(dimensionValue, datum);
  }

  return Array.from(groupedData.values());
};

export const getGroupedDataset = (
  data: DatasetData,
  chartColumns: ChartColumns,
): GroupedDataset => {
  const allMetricColumns = data.cols
    .filter(isMetric)
    .map(column => column.name);
  const allMetricDescriptors = getColumnDescriptors(
    allMetricColumns,
    data.cols,
  );

  return groupDataByDimensions(data.rows, chartColumns, allMetricDescriptors);
};

export const trimData = (
  dataset: GroupedDataset,
  valuesLimit: number,
): GroupedDataset => {
  if (dataset.length <= valuesLimit) {
    return dataset;
  }

  const groupStartingFromIndex = valuesLimit - 1;
  const result = dataset.slice();
  const dataToGroup = result.splice(groupStartingFromIndex);

  const groupedDatumDimensionValue =
    dataToGroup.length === dataset.length
      ? t`All values (${dataToGroup.length})`
      : t`Other (${dataToGroup.length})`;

  const groupedValuesDatum = dataToGroup.reduce(
    (groupedValue, currentValue) => {
      groupedValue.metrics = sumMetrics(
        groupedValue.metrics,
        currentValue.metrics,
      );

      Object.keys(currentValue.breakout ?? {}).map(breakoutName => {
        groupedValue.breakout ??= {};

        groupedValue.breakout[breakoutName] = sumMetrics(
          groupedValue.breakout[breakoutName] ?? {},
          currentValue.breakout?.[breakoutName] ?? {},
        );
      });

      return groupedValue;
    },
    {
      dimensionValue: groupedDatumDimensionValue,
      metrics: {},
      breakout: {},
    },
  );

  return [...result, groupedValuesDatum];
};

const getBreakoutDistinctValues = (
  data: DatasetData,
  breakout: ColumnDescriptor,
) => {
  return Array.from(new Set(data.rows.map(row => row[breakout.index])));
};

const getBreakoutSeries = (
  breakoutValues: RowValue[],
  metric: ColumnDescriptor,
  dimension: ColumnDescriptor,
): Series<GroupedDatum, SeriesInfo>[] => {
  return breakoutValues.map((breakoutValue, seriesIndex) => {
    const breakoutName = String(breakoutValue);
    return {
      seriesKey: breakoutName,
      yAccessor: (datum: GroupedDatum) => String(datum.dimensionValue),
      xAccessor: (datum: GroupedDatum) =>
        datum.breakout?.[breakoutName]?.[metric.column.name] ?? null,
      seriesInfo: {
        metricColumn: metric.column,
        dimensionColumn: dimension.column,
        breakoutValue,
      },
    };
  });
};

const getMultipleMetricSeries = (
  dimension: ColumnDescriptor,
  metrics: ColumnDescriptor[],
): Series<GroupedDatum, SeriesInfo>[] => {
  return metrics.map((metric, seriesIndex) => {
    return {
      seriesKey: metric.column.name,
      yAccessor: (datum: GroupedDatum) => String(datum.dimensionValue),
      xAccessor: (datum: GroupedDatum) => datum.metrics[metric.column.name],
      seriesInfo: {
        dimensionColumn: dimension.column,
        metricColumn: metric.column,
      },
    };
  });
};

export const getSeries = (
  data: DatasetData,
  chartColumns: ChartColumns,
  seriesOrder?: SeriesOrder,
): Series<GroupedDatum, SeriesInfo>[] => {
  let series: Series<GroupedDatum, SeriesInfo>[];

  if ("breakout" in chartColumns) {
    const breakoutValues = getBreakoutDistinctValues(
      data,
      chartColumns.breakout,
    );

    series = getBreakoutSeries(
      breakoutValues,
      chartColumns.metric,
      chartColumns.dimension,
    );
  } else {
    series = getMultipleMetricSeries(
      chartColumns.dimension,
      chartColumns.metrics,
    );
  }

  if (seriesOrder) {
    return seriesOrder
      .map(
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        seriesKey => series.find(series => series.seriesKey === seriesKey)!,
      )
      .filter(Boolean);
  }

  return series;
};
