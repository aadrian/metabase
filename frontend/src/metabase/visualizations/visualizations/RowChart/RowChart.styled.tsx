import styled from "@emotion/styled";
import LegendLayout from "metabase/visualizations/components/legend/LegendLayout";

export const RowVisualizationRoot = styled.div`
  overflow: hidden;
  padding: 1rem 1rem 1rem 2rem;
`;

export const RowChartContainer = styled.div`
  height: 100%;
`;

export const RowChartLegendLayout = styled(LegendLayout)`
  height: 100%;
`;
