import React, { useMemo } from "react";
import { t } from "ttag";

import _ from "underscore";
import {
  GRAPH_DATA_SETTINGS,
  GRAPH_GOAL_SETTINGS,
} from "metabase/visualizations/lib/settings/graph";
import { DatasetData, VisualizationSettings } from "metabase-types/api";
import { isDimension, isMetric } from "metabase/lib/schema_metadata";
import { RowChart } from "metabase/visualizations/components/RowChart";
import { getSeries } from "metabase/visualizations/components/RowChart/utils/data";
import { getChartColumns } from "metabase/visualizations/lib/graph/columns";
import { getFormatters } from "metabase/visualizations/visualizations/RowChart/utils/format";
import { measureText } from "metabase/lib/measure-text";
import { getSeriesColors } from "metabase/visualizations/components/RowChart/utils/colors";
import ExplicitSize from "metabase/components/ExplicitSize";
import {
  RowVisualizationRoot,
  RowChartContainer,
  RowChartLegendLayout,
} from "./RowChart.styled";

type $FIXME = any;

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const RowChartRenderer = ExplicitSize({
  wrapped: true,
  refreshMode: "throttle",
})((props: any) => (
  <RowChartContainer>
    <RowChart {...props} />
  </RowChartContainer>
));

// FIXME: fix the props type
interface RowChartVisualizationProps extends Record<string, any> {
  className: string;
  width: number;
  height: number;
  data: DatasetData;
  settings: VisualizationSettings;
  visualizationIsClickable: $FIXME;
  onVisualizationClick: $FIXME;
}

const RowChartVisualization = ({
  card,
  className,
  width,
  height,
  settings,
  data,
  visualizationIsClickable,
  onVisualizationClick,
  series,
  hovered,
  headerIcon,
  actionButtons,
  isFullscreen,
  isQueryBuilder,
  onHoverChange,
  onAddSeries,
  onRemoveSeries,
  ...props
}: RowChartVisualizationProps) => {
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

  const chartSeries = useMemo(
    () => getSeries(data, chartColumns, seriesOrder),
    [chartColumns, data, seriesOrder],
  );

  const seriesColors = useMemo(
    () => getSeriesColors(settings, chartSeries),
    [chartSeries, settings],
  );

  return (
    <RowVisualizationRoot className={className}>
      <RowChartLegendLayout
        hasLegend={chartSeries.length > 1}
        labels={chartSeries.map(s => s.seriesKey)}
        colors={Object.values(seriesColors)}
        hovered={hovered}
        onHoverChange={onHoverChange}
        isFullscreen={isFullscreen}
        isQueryBuilder={isQueryBuilder}
      >
        <RowChartRenderer
          className="flex-full"
          settings={settings}
          data={data}
          measureText={measureText}
          getFormatters={getFormatters}
          onVisualizationClick={onVisualizationClick}
          onHoverChange={onHoverChange}
          hovered={hovered}
        />
      </RowChartLegendLayout>
    </RowVisualizationRoot>
  );
};

RowChartVisualization.uiName = t`Row`;
RowChartVisualization.identifier = "row";
RowChartVisualization.iconName = "horizontal_bar";
RowChartVisualization.noun = t`row chart`;

const stackingSettings = {
  "stackable.stack_type": {
    section: t`Display`,
    title: t`Stacking`,
    widget: "radio",
    default: null,
    props: {
      options: [
        { name: t`Don't stack`, value: null },
        { name: t`Stack`, value: "stacked" },
        { name: t`Stack - 100%`, value: "normalized" },
      ],
    },
  },
};

RowChartVisualization.settings = {
  ...stackingSettings,
  "graph.show_values": {
    section: t`Display`,
    title: t`Show values on data points`,
    widget: "toggle",
    getHidden: (_series: any[], vizSettings: VisualizationSettings) =>
      vizSettings["stackable.stack_type"] === "normalized",
    default: false,
  },
  ...GRAPH_GOAL_SETTINGS,
  ...GRAPH_DATA_SETTINGS,
};

RowChartVisualization.isSensible = ({ cols, rows }: $FIXME) => {
  return (
    rows.length > 1 &&
    cols.length >= 2 &&
    cols.filter(isDimension).length > 0 &&
    cols.filter(isMetric).length > 0
  );
};

RowChartVisualization.isLiveResizable = (series: any[]) => {
  const totalRows = series.reduce((sum, s) => sum + s.data.rows.length, 0);
  return totalRows < 10;
};

// rename these settings
RowChartVisualization.settings["graph.metrics"] = {
  ...RowChartVisualization.settings["graph.metrics"],
  title: t`X-axis`,
};
RowChartVisualization.settings["graph.dimensions"] = {
  ...RowChartVisualization.settings["graph.dimensions"],
  title: t`Y-axis`,
};

/**
 * Required to make it compatible with series settings without rewriting them fully
 * It expands a single card + dataset into multiple "series" and sets _seriesKey which is needed for settings to work
 */
RowChartVisualization.transformSeries = (originalMultipleSeries: any) => {
  const [series] = originalMultipleSeries;

  if (series.card._transformed) {
    return originalMultipleSeries;
  }

  const { card, data } = series;
  const chartColumns = getChartColumns(data, card.visualization_settings);

  return getSeries(data, chartColumns)
    .map(s => s.seriesKey)
    .map(seriesKey => {
      const seriesCard = {
        ...card,
        name: seriesKey,
        _seriesKey: seriesKey,
        _transformed: true,
      };
      return { card: seriesCard, data };
    });
};

export default RowChartVisualization;
