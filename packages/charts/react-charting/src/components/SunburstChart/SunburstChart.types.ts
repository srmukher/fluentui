import { IStyle, ITheme } from '@fluentui/react/lib/Styling';
import { IRefObject, IRenderFunction, IStyleFunctionOrObject } from '@fluentui/react/lib/Utilities';
import { ICalloutProps } from '@fluentui/react/lib/Callout';
import { ILegendsProps } from '../Legends/index';
import { IAccessibilityProps, IChart, IChartDataPoint } from '../../types/index';

export interface ISunburstNode {
  id: string;
  label: string;
  value?: number;
  children?: ISunburstNode[];
  color?: string; // token or hex; resolved via utilities in base component
  xAxisCalloutData?: string;
  yAxisCalloutData?: string;
  callOutAccessibilityData?: IAccessibilityProps;
  onClick?: () => void;
}

export interface ISunburstFlatData {
  ids: string[];
  parents: Array<string | null | ''>;
  labels: string[];
  values: number[];
}

export interface ISunburstChartData {
  root?: ISunburstNode; // preferred
  flat?: ISunburstFlatData; // optional alternate input
  chartTitle?: string;
}

export type BranchValues = 'total' | 'remainder';

export interface ISunburstChartProps {
  data: ISunburstChartData;

  width?: number;
  height?: number;
  className?: string;
  theme?: ITheme;

  innerRadius?: number; // default 0
  levelThickness?: number | ((level: number) => number); // default 40
  maxDepth?: number; // optional limit
  startAngle?: number; // default 0
  endAngle?: number; // default 2 * Math.PI
  padAngle?: number; // default 0
  branchValues?: BranchValues; // default 'total'

  sort?: 'none' | 'asc' | 'desc' | ((a: ISunburstNode, b: ISunburstNode, depth: number) => number);

  colorMode?: 'distinct' | 'parent' | 'sequential';

  showLabelsInPercent?: boolean;
  hideLabels?: boolean;
  enableGradient?: boolean;
  roundCorners?: boolean;

  // Align with other charts: allow passing only the props you need
  legendProps?: Partial<ILegendsProps>;

  onRenderCalloutPerDataPoint?: IRenderFunction<IChartDataPoint>;
  calloutProps?: Partial<ICalloutProps>;
  culture?: string;
  useUTC?: boolean;

  componentRef?: IRefObject<IChart>;

  /** Custom styles injection */
  styles?: IStyleFunctionOrObject<ISunburstChartStyleProps, ISunburstChartStyles>;
}

export interface ISunburstChartStyleProps {
  theme: ITheme;
  width: number;
  height: number;
  className?: string;
}

export interface ISunburstChartStyles {
  root: IStyle;
  chart: IStyle;
  legendContainer: IStyle;
}
