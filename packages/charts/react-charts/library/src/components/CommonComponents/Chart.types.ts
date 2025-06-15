import * as React from 'react';
import { LegendsProps } from '../Legends/index';
import { AccessibilityProps, Margins } from '../../types/index';
import { TimeLocaleDefinition } from 'd3-time-format';
import { ChartPopoverProps } from './ChartPopover.types';

/**
 * Coordinate system types supported by the unified Chart component
 */
export enum CoordinateSystem {
  Cartesian = 'cartesian',
  Polar = 'polar',
  Logarithmic = 'logarithmic',
}

/**
 * Axis types for different coordinate systems
 */
export enum AxisType {
  // Cartesian axes
  X = 'x',
  Y = 'y',
  YSecondary = 'ySecondary',

  // Polar axes
  Angular = 'angular',
  Radial = 'radial',

  // Logarithmic axes
  LogX = 'logX',
  LogY = 'logY',
}

/**
 * Scale types for different data types
 */
export enum ScaleType {
  Linear = 'linear',
  Log = 'log',
  Time = 'time',
  Band = 'band',
  Point = 'point',
}

/**
 * Base chart style properties
 */
export interface ChartStyleProps {
  className?: string;
  width?: number;
  height?: number;
  color?: string;
  href?: string;
  shouldHighlight?: boolean;
  useRtl?: boolean;
  lineColor?: string;
  toDrawShape?: boolean;
}

/**
 * Base chart styles
 */
export interface ChartStyles {
  root?: string;
  chartWrapper?: string;
  svg?: string;
  axisTitle?: string;
  chartTitle?: string;
  legendContainer?: string;
  tooltip?: string;
  svgTooltip?: string;
}

/**
 * Base chart properties
 */
export interface ChartProps {
  // Dimensions
  height?: number;
  width?: number;
  parentRef?: HTMLElement | null;
  className?: string;

  // Coordinate system
  coordinateSystem?: CoordinateSystem;

  // Margins
  margins?: Margins;

  // Visibility
  hideLegend?: boolean;
  hideTooltip?: boolean;

  // Styling
  styles?: ChartStyles;
  svgProps?: React.SVGProps<SVGSVGElement>;

  // Accessibility
  chartTitle?: string;
  componentRef?: React.RefObject<Chart>;

  // Reflow behavior
  reflowProps?: {
    mode: 'none' | 'min-width';
  };

  // Callbacks
  onChartMouseLeave?: () => void;
}

/**
 * Axis configuration for different coordinate systems
 */
export interface AxisConfig {
  type: AxisType;
  scaleType: ScaleType;
  title?: string;
  tickCount?: number;
  tickFormat?: string | ((value: any) => string);
  tickValues?: (number | string | Date)[];
  tickPadding?: number;
  tickSize?: number;
  hideTickOverlap?: boolean;
  showGrid?: boolean;
  domain?: [any, any];
  range?: [number, number];
}

/**
 * Chart data point interface
 */
export interface ChartDataPoint {
  x: number | string | Date;
  y: number | string | Date;
  r?: number; // For polar coordinates
  theta?: number; // For polar coordinates (in radians)
  [key: string]: any; // Additional properties
}

/**
 * Chart series data
 */
export interface ChartSeries {
  key: string;
  name: string;
  data: ChartDataPoint[];
  color?: string;
  [key: string]: any;
}

/**
 * Unified chart properties
 */
export interface UnifiedChartProps extends ChartProps {
  // Data
  data: ChartSeries[];

  // Axes configuration
  axes: AxisConfig[];

  // Coordinate system specific props
  coordinateSystemProps?: {
    // Polar specific
    polar?: {
      centerX?: number;
      centerY?: number;
      radius?: number;
      startAngle?: number;
      endAngle?: number;
    };
    // Logarithmic specific
    logarithmic?: {
      base?: number;
      nice?: boolean;
    };
  };

  // Callout
  calloutProps?: Partial<ChartPopoverProps>;

  // Legends
  legendProps?: Partial<LegendsProps>;

  // Children render function
  children(props: ChartRenderProps): React.ReactNode;
}

/**
 * Props passed to children render function
 */
export interface ChartRenderProps {
  // Scales for different coordinate systems
  scales: {
    [key in AxisType]?: any; // D3 scale object
  };

  // Container dimensions
  containerWidth: number;
  containerHeight: number;

  // Coordinate system
  coordinateSystem: CoordinateSystem;

  // Margins
  margins: Margins;

  // Utility functions
  getPointPosition: (point: ChartDataPoint) => { x: number; y: number };
  getPointFromPosition: (x: number, y: number) => ChartDataPoint | null;
}

/**
 * Chart component interface
 */
export interface Chart {
  chartContainer: HTMLDivElement | null;
  resize(): void;
  getScales(): { [key in AxisType]?: any };
}

/**
 * Hook for chart dimensions
 */
export interface UseChartDimensionsProps {
  width?: number;
  height?: number;
  parentRef?: HTMLElement | null;
  margins?: Margins;
}

export interface UseChartDimensionsReturn {
  containerWidth: number;
  containerHeight: number;
  margins: Margins;
  resize: () => void;
}

/**
 * Hook for chart scales
 */
export interface UseChartScalesProps {
  data: ChartSeries[];
  axes: AxisConfig[];
  coordinateSystem: CoordinateSystem;
  containerWidth: number;
  containerHeight: number;
  margins: Margins;
  coordinateSystemProps?: UnifiedChartProps['coordinateSystemProps'];
}

export interface UseChartScalesReturn {
  scales: { [key in AxisType]?: any };
  getPointPosition: (point: ChartDataPoint) => { x: number; y: number };
  getPointFromPosition: (x: number, y: number) => ChartDataPoint | null;
}

/**
 * Hook for chart interactions
 */
export interface UseChartInteractionProps {
  onChartMouseLeave?: () => void;
  onPointHover?: (point: ChartDataPoint, event: React.MouseEvent) => void;
  onPointClick?: (point: ChartDataPoint, event: React.MouseEvent) => void;
}

export interface UseChartInteractionReturn {
  handleMouseLeave: () => void;
  handlePointHover: (point: ChartDataPoint, event: React.MouseEvent) => void;
  handlePointClick: (point: ChartDataPoint, event: React.MouseEvent) => void;
}
