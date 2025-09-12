import type { JSXElement } from '@fluentui/react-utilities';
import { CartesianChartProps, CartesianChartStyleProps } from '../CommonComponents/index';
import { ChartDataPoint } from '../../types/index';
import { ChartPopoverProps } from '../CommonComponents/ChartPopover.types';
import { LegendsProps } from '../Legends/index';

export interface SunburstNode {
  id: string;
  label: string;
  value?: number;
  children?: SunburstNode[];
  color?: string; // token or hex; resolved via utilities in base component
  xAxisCalloutData?: string;
  yAxisCalloutData?: string;
  callOutAccessibilityData?: { ariaLabel?: string; ariaDescription?: string };
  onClick?: () => void;
}

export interface SunburstFlatData {
  ids: string[];
  parents: Array<string | null | ''>;
  labels: string[];
  values: number[];
  marker?: {
    colors?: string[];
    pattern?: {
      shape?: string[];
    };
  };
}

export interface SunburstChartData {
  root?: SunburstNode; // preferred
  flat?: SunburstFlatData; // optional alternate input
  chartTitle?: string;
}

export type BranchValues = 'total' | 'remainder';

/**
 * Sunburst Chart properties.
 * {@docCategory SunburstChart}
 */
export interface SunburstChartProps extends CartesianChartProps {
  /**
   * Data to render in the chart.
   */
  data: SunburstChartData;

  /**
   * Inner radius of the sunburst chart. Default is 0.
   */
  innerRadius?: number;

  /**
   * Thickness of each level. Can be a number or a function that takes level and returns thickness.
   * Default is 40.
   */
  levelThickness?: number | ((level: number) => number);

  /**
   * Maximum depth to render. Optional limit.
   */
  maxDepth?: number;

  /**
   * Start angle in radians. Default is 0.
   */
  startAngle?: number;

  /**
   * End angle in radians. Default is 2 * Math.PI.
   */
  endAngle?: number;

  /**
   * Padding angle between segments. Default is 0.
   */
  padAngle?: number;

  /**
   * How to calculate branch values. Default is 'remainder' (matches Plotly default).
   */
  branchValues?: BranchValues;

  /**
   * How to sort segments. Default is 'none'.
   */
  sort?: 'none' | 'asc' | 'desc' | ((a: SunburstNode, b: SunburstNode, depth: number) => number);

  /**
   * Color mode for segments.
   */
  colorMode?: 'distinct' | 'parent' | 'sequential';

  /**
   * Show labels as percentages instead of values.
   */
  showLabelsInPercent?: boolean;

  /**
   * Hide all labels on segments.
   */
  hideLabels?: boolean;

  /**
   * Enable gradient fill for segments.
   */
  enableGradient?: boolean;

  /**
   * Round corners of segments.
   */
  roundCorners?: boolean;

  /**
   * Props for the legends.
   */
  legendProps?: Partial<LegendsProps>;

  /**
   * Custom callout renderer for data points.
   */
  onRenderCalloutPerDataPoint?: (dataPointCalloutProps: ChartDataPoint) => JSXElement | undefined;

  /**
   * Props for the callout in the chart.
   */
  calloutProps?: ChartPopoverProps;

  /**
   * Culture for number formatting.
   */
  culture?: string;

  /**
   * Use UTC for date formatting.
   */
  useUTC?: boolean;

  /**
   * Pattern colors for hatched segments. When provided, render each segment using a white base fill
   * with a hatched SVG pattern colored by this palette. If omitted, solid colors are used.
   */
  patternColors?: string[];

  /**
   * Call to provide customized styling that will layer on top of the variant rules.
   */
  styles?: SunburstChartStyles;
}

export interface SunburstChartStyleProps extends CartesianChartStyleProps {
  /**
   * Width of the chart.
   */
  width: number;

  /**
   * Height of the chart.
   */
  height: number;
}

export interface SunburstChartStyles {
  /**
   * Style for the root element.
   */
  root: string;

  /**
   * Style for the chart SVG element.
   */
  chart: string;

  /**
   * Style for the legend container.
   */
  legendContainer: string;

  /**
   * Style for the chart wrapper.
   */
  chartWrapper: string;
}
