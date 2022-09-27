import { useMemo } from "react";
import { DatasetData } from "metabase-types/api";
import { ChartColumns } from "metabase/visualizations/lib/graph/columns";
import { getGroupedDataset, groupExcessiveData } from "../utils/data";

export const useChartDataset = (
  chartColumns: ChartColumns,
  data: DatasetData,
  maxYValues: number,
) => {
  const groupedData = useMemo(
    () => getGroupedDataset(data, chartColumns),
    [chartColumns, data],
  );

  const trimmedData = useMemo(
    () => groupExcessiveData(groupedData, maxYValues),
    [groupedData, maxYValues],
  );

  return { groupedData, trimmedData };
};
