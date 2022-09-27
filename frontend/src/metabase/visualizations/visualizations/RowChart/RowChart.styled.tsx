import styled from "@emotion/styled";
import LegendLayout from "metabase/visualizations/components/legend/LegendLayout";

export const RowVisualizationRoot = styled.div`
  overflow: hidden;
  padding: 1rem 1rem 1rem 2rem;
`;

export const RowChartContainer = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
`;

export const RowChartLegendLayout = styled(LegendLayout)`
  height: 100%;
`;
