import { useMemo } from "react";
import { DatasetData, VisualizationSettings } from "metabase-types/api";
import { getChartColumns } from "metabase/visualizations/lib/graph/columns";
import { getSeries } from "../utils/data";
import { getSeriesColors } from "../utils/colors";

export const useChartSeries = (
  data: DatasetData,
  settings: VisualizationSettings,
) => {
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

  const series = useMemo(
    () => getSeries(data, chartColumns, seriesOrder),
    [chartColumns, data, seriesOrder],
  );

  const seriesColors = useMemo(
    () => getSeriesColors(settings, series),
    [series, settings],
  );

  return {
    chartColumns,
    series,
    seriesColors,
  };
};
