import { RowValue } from "metabase-types/api";
import { TextMeasurer } from "metabase/visualizations/types/measure-text";
import { Margin } from "../RowChartView/types/margin";
import { ChartFont } from "../RowChartView/types/style";
import { GroupedDataset } from "./data";

const CHART_PADDING = 10;
const TICKS_OFFSET = 10;
const GOAL_LINE_PADDING = 14;

export const getMaxWidth = (
  formattedYTicks: string[],
  ticksFont: ChartFont,
  measureText: TextMeasurer,
): number => {
  return Math.max(
    ...formattedYTicks.map(tick =>
      measureText(tick, {
        size: `${ticksFont.size}px`,
        family: "Lato",
        weight: String(ticksFont.weight ?? 400),
      }),
    ),
  );
};

export const getChartMargin = (
  data: GroupedDataset,
  yTickFormatter: (value: RowValue) => string,
  ticksFont: ChartFont,
  hasGoalLine: boolean,
  measureText: TextMeasurer,
): Margin => {
  const yTicksWidth = getMaxWidth(
    data.map(datum => yTickFormatter(datum.dimensionValue)),
    ticksFont,
    measureText,
  );

  const margin: Margin = {
    top: hasGoalLine ? GOAL_LINE_PADDING : CHART_PADDING,
    left: yTicksWidth + TICKS_OFFSET + CHART_PADDING,
    bottom: CHART_PADDING + TICKS_OFFSET + ticksFont.size,
    right: CHART_PADDING,
  };

  return margin;
};

export const getMaxYValuesCount = (
  viewportHeight: number,
  minBarWidth: number,
  isStacked: boolean,
  seriesCount: number,
) => {
  const singleValueHeight = isStacked ? minBarWidth : minBarWidth * seriesCount;

  return Math.max(Math.floor(viewportHeight / singleValueHeight), 1);
};
