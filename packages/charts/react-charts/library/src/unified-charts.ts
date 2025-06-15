// New unified chart components - separate export file to avoid conflicts
export { UnifiedChart } from './components/CommonComponents/Chart';
export type {
  CoordinateSystem,
  AxisType,
  ScaleType,
  ChartStyleProps,
  ChartStyles,
  AxisConfig,
  ChartSeries,
  UnifiedChartProps,
  ChartRenderProps,
  Chart as UnifiedChartInterface,
  UseChartDimensionsProps,
  UseChartDimensionsReturn,
  UseChartScalesProps,
  UseChartScalesReturn,
  UseChartInteractionProps,
  UseChartInteractionReturn,
} from './components/CommonComponents/Chart.types';
export { Axis } from './components/CommonComponents/Axis';
export { useChartDimensions } from './components/CommonComponents/hooks/useChartDimensions';
export { useChartScales } from './components/CommonComponents/hooks/useChartScales';
export { useChartInteraction } from './components/CommonComponents/hooks/useChartInteraction';
