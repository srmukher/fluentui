/* eslint-disable one-var */
/* eslint-disable vars-on-top */
/* eslint-disable no-var */
import * as React from 'react';
import {
  bin as d3Bin,
  extent as d3Extent,
  sum as d3Sum,
  min as d3Min,
  max as d3Max,
  range as d3Range,
  Bin,
} from 'd3-array';
import { scaleLinear as d3ScaleLinear } from 'd3-scale';
import { format as d3Format } from 'd3-format';
import { IDonutChartProps } from '../DonutChart/index';
import {
  IChartDataPoint,
  IChartProps,
  IHorizontalBarChartWithAxisDataPoint,
  ILineChartPoints,
  IVerticalStackedChartProps,
  IHeatMapChartData,
  IHeatMapChartDataPoint,
  IGroupedVerticalBarChartData,
  IVerticalBarChartDataPoint,
  ISankeyChartData,
  ILineChartLineOptions,
} from '../../types/IDataPoint';
import { ISankeyChartProps } from '../SankeyChart/index';
import { IVerticalStackedBarChartProps } from '../VerticalStackedBarChart/index';
import { IHorizontalBarChartWithAxisProps } from '../HorizontalBarChartWithAxis/index';
import { ILineChartProps } from '../LineChart/index';
import { IAreaChartProps } from '../AreaChart/index';
import { IHeatMapChartProps } from '../HeatMapChart/index';
import { DataVizPalette, getColorFromToken } from '../../utilities/colors';
import { GaugeChartVariant, IGaugeChartProps, IGaugeChartSegment } from '../GaugeChart/index';
import { IGroupedVerticalBarChartProps } from '../GroupedVerticalBarChart/index';
import { IVerticalBarChartProps } from '../VerticalBarChart/index';
import { IChartTableProps } from '../ChartTable/index';
import { findNumericMinMaxOfY, formatScientificLimitWidth, MIN_DONUT_RADIUS } from '../../utilities/utilities';
import type {
  Datum,
  Layout,
  PlotlySchema,
  PieData,
  PlotData,
  SankeyData,
  ScatterLine,
  TypedArray,
  Data,
  TableData,
  Color,
} from '@fluentui/chart-utilities';
import {
  isArrayOfType,
  isArrayOrTypedArray,
  isDate,
  isDateArray,
  isNumberArray,
  isYearArray,
  isInvalidValue,
} from '@fluentui/chart-utilities';
import { timeParse } from 'd3-time-format';
import { curveCardinal as d3CurveCardinal } from 'd3-shape';
import type { ColorwayType } from './PlotlyColorAdapter';
import { extractColor, resolveColor } from './PlotlyColorAdapter';
import { ISunburstChartProps, ISunburstFlatData, ISunburstNode } from '../SunburstChart/index';

interface ISecondaryYAxisValues {
  secondaryYAxistitle?: string;
  secondaryYScaleOptions?: { yMinValue?: number; yMaxValue?: number };
}

const dashOptions = {
  dot: {
    strokeDasharray: '1, 5',
    strokeLinecap: 'round',
    strokeWidth: '2',
    lineBorderWidth: '4',
  },
  dash: {
    strokeDasharray: '5, 5',
    strokeLinecap: 'butt',
    strokeWidth: '2',
    lineBorderWidth: '4',
  },
  longdash: {
    strokeDasharray: '10, 5',
    strokeLinecap: 'butt',
    strokeWidth: '2',
    lineBorderWidth: '4',
  },
  dashdot: {
    strokeDasharray: '5, 5, 1, 5',
    strokeLinecap: 'butt',
    strokeWidth: '2',
    lineBorderWidth: '4',
  },
  longdashdot: {
    strokeDasharray: '10, 5, 1, 5',
    strokeLinecap: 'butt',
    strokeWidth: '2',
    lineBorderWidth: '4',
  },
  solid: {
    strokeDasharray: '0',
    strokeLinecap: 'butt',
    strokeWidth: '2',
    lineBorderWidth: '4',
  },
} as const;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isMonth = (possiblyMonthValue: any): boolean => {
  const parseFullMonth = timeParse('%B');
  const parseShortMonth = timeParse('%b');
  return parseFullMonth(possiblyMonthValue) !== null || parseShortMonth(possiblyMonthValue) !== null;
};

export const isMonthArray = (data: Datum[] | Datum[][] | TypedArray): boolean => {
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  return isArrayOfType(data, (value: any): boolean => isMonth(value) || value === null);
};

function getTitles(layout: Partial<Layout> | undefined) {
  const titles = {
    chartTitle: typeof layout?.title === 'string' ? layout.title : layout?.title?.text ?? '',
    xAxisTitle: typeof layout?.xaxis?.title === 'string' ? layout?.xaxis?.title : layout?.xaxis?.title?.text ?? '',
    yAxisTitle: typeof layout?.yaxis?.title === 'string' ? layout?.yaxis?.title : layout?.yaxis?.title?.text ?? '',
  };
  return titles;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const correctYearMonth = (xValues: Datum[] | Datum[][] | TypedArray): any[] => {
  const presentYear = new Date().getFullYear();
  if (xValues.length > 0 && Array.isArray(xValues[0])) {
    throw new Error('updateXValues:: 2D array not supported');
  }
  const dates = (xValues as Datum[]).map(possiblyMonthValue => {
    const parsedDate = `${possiblyMonthValue} 01, ${presentYear}`;
    return isDate(parsedDate) ? new Date(parsedDate) : null;
  });
  const filteredDateIndexPairs = dates.map((date, index) => [date, index]).filter(([date]) => date !== null) as [
    Date,
    number,
  ][];
  for (let i = filteredDateIndexPairs.length - 1; i > 0; i--) {
    const currentDate = filteredDateIndexPairs[i][0];
    const previousDate = filteredDateIndexPairs[i - 1][0];
    const currentMonth = currentDate.getMonth();
    const previousMonth = previousDate.getMonth();
    const currentYear = currentDate.getFullYear();
    const previousYear = previousDate.getFullYear();
    if (previousMonth >= currentMonth) {
      filteredDateIndexPairs[i - 1][0].setFullYear(currentYear - 1);
    } else if (previousYear > currentYear) {
      filteredDateIndexPairs[i - 1][0].setFullYear(currentYear);
    }
    dates[filteredDateIndexPairs[i - 1][1]] = filteredDateIndexPairs[i - 1][0];
  }
  xValues = (xValues as Datum[]).map((month, index) => {
    if (dates[index] === null) {
      return null;
    }

    return `${month} 01, ${dates[index]!.getFullYear()}`;
  });
  return xValues;
};

const usesSecondaryYScale = (series: Partial<PlotData>): boolean => {
  return series.yaxis === 'y2';
};

const getSecondaryYAxisValues = (
  data: Data[],
  layout: Partial<Layout> | undefined,
  maxAllowedMinY?: number,
  minAllowedMaxY?: number,
): ISecondaryYAxisValues => {
  let containsSecondaryYAxis = false;
  let yMinValue: number | undefined;
  let yMaxValue: number | undefined;

  data.forEach((series: Partial<PlotData>) => {
    if (usesSecondaryYScale(series)) {
      containsSecondaryYAxis = true;

      const yValues = series.y as number[];
      if (yValues) {
        yMinValue = Math.min(...yValues);
        yMaxValue = Math.max(...yValues);
      }
    }
  });

  if (!containsSecondaryYAxis) {
    return {};
  }

  if (typeof yMinValue === 'number' && typeof maxAllowedMinY === 'number') {
    yMinValue = Math.min(yMinValue, maxAllowedMinY);
  }
  if (typeof yMaxValue === 'number' && typeof minAllowedMaxY === 'number') {
    yMaxValue = Math.max(yMaxValue, minAllowedMaxY);
  }
  if (layout?.yaxis2?.range) {
    yMinValue = layout.yaxis2.range[0];
    yMaxValue = layout.yaxis2.range[1];
  }

  return {
    secondaryYAxistitle:
      typeof layout?.yaxis2?.title === 'string'
        ? layout.yaxis2.title
        : typeof layout?.yaxis2?.title?.text === 'string'
        ? layout.yaxis2.title.text
        : undefined,
    secondaryYScaleOptions: {
      yMinValue,
      yMaxValue,
    },
  };
};

export const _getGaugeAxisColor = (
  colorway: string[] | undefined,
  colorwayType: ColorwayType,
  color: Color | undefined,
  colorMap: React.MutableRefObject<Map<string, string>>,
  isDarkTheme?: boolean,
): string => {
  const extractedColors = extractColor(colorway, colorwayType, color, colorMap, isDarkTheme);
  return resolveColor(extractedColors, 0, '', colorMap, isDarkTheme);
};

export const resolveXAxisPoint = (
  x: Datum,
  isXYearCategory: boolean,
  isXString: boolean,
  isXDate: boolean,
  isXNumber: boolean,
): string | Date | number => {
  if (x === null || x === undefined) {
    return '';
  }
  if (isXYearCategory) {
    return x.toString();
  }
  if (isXString) {
    if (isXDate) {
      const date = new Date(x as string);
      return date;
    }
    if (isXNumber) {
      return parseFloat(x as string);
    }
    return x;
  }
  return x;
};

export const transformPlotlyJsonToDonutProps = (
  input: PlotlySchema,
  colorMap: React.MutableRefObject<Map<string, string>>,
  colorwayType: ColorwayType,
  isDarkTheme?: boolean,
): IDonutChartProps => {
  const firstData = input.data[0] as Partial<PieData>;
  // extract colors for each series only once
  // use piecolorway if available
  // otherwise, default to colorway from template
  const colors: string[] | string | null | undefined = extractColor(
    input.layout?.piecolorway ?? input.layout?.template?.layout?.colorway,
    colorwayType,
    input.layout?.piecolorway ?? firstData?.marker?.colors,
    colorMap,
    isDarkTheme,
  );

  const mapLegendToDataPoint: Record<string, IChartDataPoint> = {};
  firstData.labels?.forEach((label, index: number) => {
    const value = getNumberAtIndexOrDefault(firstData.values, index);
    if (isInvalidValue(value) || (value as number) < 0) {
      return;
    }

    const legend = `${label}`;
    // resolve color for each legend from the extracted colors
    const color: string = resolveColor(colors, index, legend, colorMap, isDarkTheme);

    if (!mapLegendToDataPoint[legend]) {
      mapLegendToDataPoint[legend] = {
        legend,
        data: value,
        color,
      };
    } else {
      mapLegendToDataPoint[legend].data! += value as number;
    }
  });

  const width: number = input.layout?.width ?? 440;
  const height: number = input.layout?.height ?? 220;
  const hideLabels: boolean = firstData.textinfo
    ? !['value', 'percent', 'label+percent'].includes(firstData.textinfo)
    : false;
  const donutMarginHorizontal: number = hideLabels ? 0 : 80;
  const donutMarginVertical: number = 40 + (hideLabels ? 0 : 40);
  const innerRadius: number = firstData.hole
    ? firstData.hole * (Math.min(width - donutMarginHorizontal, height - donutMarginVertical) / 2)
    : MIN_DONUT_RADIUS;
  const { chartTitle } = getTitles(input.layout);

  return {
    data: {
      chartTitle,
      chartData: Object.values(mapLegendToDataPoint),
    },
    hideLegend: input.layout?.showlegend === false ? true : false,
    width: input.layout?.width,
    height,
    innerRadius,
    hideLabels,
    showLabelsInPercent: firstData.textinfo ? ['percent', 'label+percent'].includes(firstData.textinfo) : true,
    roundCorners: true,
  };
};

// Function to decode base64 binary data to float64 array
function decodeBinaryData(binaryData: { dtype: string; bdata: string; shape?: string }): number[] {
  if (!binaryData.bdata || binaryData.dtype !== 'f8') {
    return [];
  }

  try {
    // Decode base64 to binary data
    const binaryString = atob(binaryData.bdata);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Convert binary data to float64 array
    const float64Array = new Float64Array(bytes.buffer);
    return Array.from(float64Array);
  } catch (error) {
    console.warn('Failed to decode binary data:', error);
    return [];
  }
}

// Function to interpolate color from a colorscale
function interpolateColorFromScale(
  value: number,
  colorscale: Array<[number, string]>,
  minValue: number,
  maxValue: number,
  cmid?: number,
): string {
  // Handle NaN values
  if (isNaN(value)) {
    return 'rgb(128,128,128)'; // Default gray for NaN
  }

  let normalizedValue: number;

  // Handle midpoint colorscales (diverging color schemes)
  // Only apply diverging logic if the colorscale is truly symmetric around cmid
  const isSymmetricDivergingColorscale =
    cmid !== undefined &&
    colorscale.length === 3 && // Typical diverging: [0, color1], [0.5, neutral], [1, color2]
    Math.abs(colorscale[1][0] - 0.5) < 0.1; // Middle position should be near 0.5

  if (cmid !== undefined && isSymmetricDivergingColorscale) {
    // When cmid is provided, it represents the conceptual center point of the data scale
    // If cmid is outside the actual data range, we still need to respect the diverging nature

    if (cmid >= minValue && cmid <= maxValue) {
      // cmid is within data range - standard diverging mapping
      if (value <= cmid) {
        // Map [minValue, cmid] to [0, 0.5]
        normalizedValue = ((value - minValue) / (cmid - minValue)) * 0.5;
      } else {
        // Map [cmid, maxValue] to [0.5, 1]
        normalizedValue = 0.5 + ((value - cmid) / (maxValue - cmid)) * 0.5;
      }
    } else {
      // cmid is outside data range - determine which side of the colorscale to use
      if (maxValue <= cmid) {
        // All data is below cmid, map to lower half of colorscale [0, 0.5]
        normalizedValue = ((value - minValue) / (maxValue - minValue)) * 0.5;
      } else if (minValue >= cmid) {
        // All data is above cmid, map to upper half of colorscale [0.5, 1]
        normalizedValue = 0.5 + ((value - minValue) / (maxValue - minValue)) * 0.5;
      } else {
        // This shouldn't happen if cmid is truly outside range, but fallback to standard mapping
        normalizedValue = (value - minValue) / (maxValue - minValue);
      }
    }

    normalizedValue = Math.max(0, Math.min(1, normalizedValue));
  } else {
    // Standard linear mapping without midpoint
    normalizedValue = maxValue > minValue ? (value - minValue) / (maxValue - minValue) : 0;
  }

  // Find the appropriate color segment and use continuous interpolation to match Plotly
  for (let i = 0; i < colorscale.length - 1; i++) {
    const [pos1, color1] = colorscale[i];
    const [pos2, color2] = colorscale[i + 1];

    if (normalizedValue >= pos1 && normalizedValue <= pos2) {
      // Use continuous linear interpolation between colors (like Plotly does)
      const ratio = pos2 > pos1 ? (normalizedValue - pos1) / (pos2 - pos1) : 0;
      return interpolateColor(color1, color2, ratio);
    }
  }

  // If beyond range, return the closest color
  return normalizedValue <= colorscale[0][0] ? colorscale[0][1] : colorscale[colorscale.length - 1][1];
}

// Function to interpolate between two RGB colors
function interpolateColor(color1: string, color2: string, ratio: number): string {
  const rgb1 = parseRgbColor(color1);
  const rgb2 = parseRgbColor(color2);

  if (!rgb1 || !rgb2) return color1;

  const r = Math.round(rgb1.r + (rgb2.r - rgb1.r) * ratio);
  const g = Math.round(rgb1.g + (rgb2.g - rgb1.g) * ratio);
  const b = Math.round(rgb1.b + (rgb2.b - rgb1.b) * ratio);

  return `rgb(${r},${g},${b})`;
}

// Function to parse RGB color string or named CSS color
function parseRgbColor(color: string): { r: number; g: number; b: number } | null {
  const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (match) {
    return {
      r: parseInt(match[1], 10),
      g: parseInt(match[2], 10),
      b: parseInt(match[3], 10),
    };
  }
  // Support common CSS color names
  const cssColors: Record<string, [number, number, number]> = {
    red: [255, 0, 0],
    yellow: [255, 255, 0],
    green: [0, 128, 0],
    lightgray: [211, 211, 211],
    grey: [128, 128, 128],
    gray: [128, 128, 128],
    white: [255, 255, 255],
    black: [0, 0, 0],
    blue: [0, 0, 255],
    orange: [255, 165, 0],
    // Add more as needed
  };
  const lower = color.trim().toLowerCase();
  if (cssColors[lower]) {
    const [r, g, b] = cssColors[lower];
    return { r, g, b };
  }
  return null;
}

export const transformPlotlyJsonToSunburstProps = (
  input: PlotlySchema,
  colorMap: React.MutableRefObject<Map<string, string>>,
  colorwayType: ColorwayType,
  isDarkTheme?: boolean,
): ISunburstChartProps => {
  const first = input.data[0] as Partial<PlotData> & {
    ids?: string[];
    labels?: string[];
    parents?: Array<string | null>;
    values?: number[] | { dtype: string; bdata: string; shape?: string };
    branchvalues?: 'total' | 'remainder';
    marker?: {
      colors?: (string | number)[] | { dtype: string; bdata: string; shape?: string };
      coloraxis?: string;
    };
    customdata?: Array<Array<number | string>> | { dtype: string; bdata: string; shape?: string };
  };

  // Extract values from customdata or values, handling binary encoding
  let extractedValues: number[] = [];

  // First try to get values from the values field
  if (first.values) {
    if (Array.isArray(first.values)) {
      extractedValues = first.values as number[];
    } else if (typeof first.values === 'object' && 'bdata' in first.values) {
      extractedValues = decodeBinaryData(first.values);
    }
  }

  // If no values or empty values, try customdata
  if (extractedValues.length === 0 && first.customdata) {
    if (Array.isArray(first.customdata)) {
      extractedValues = first.customdata.map((row: any) => {
        if (Array.isArray(row) && row.length > 0 && typeof row[0] === 'number') {
          return row[0];
        }
        return 0;
      });
    } else if (typeof first.customdata === 'object' && 'bdata' in first.customdata) {
      extractedValues = decodeBinaryData(first.customdata);
    }
  }

  const flat: ISunburstFlatData = {
    ids: first.ids ?? [],
    labels: first.labels ?? [],
    parents: (first.parents as Array<string | null | ''>) ?? [],
    values: extractedValues.length > 0 ? extractedValues : [],
  };

  // Debug: Log the extracted values for remainder mode
  if (first.branchvalues === 'remainder') {
    console.log('=== PLOTLY SCHEMA DEBUG ===');
    console.log('branchvalues:', first.branchvalues);
    console.log('Raw extracted values:', extractedValues);
    console.log('IDs and values:');
    for (let i = 0; i < Math.min(10, first.ids?.length || 0); i++) {
      console.log(`  ${first.ids?.[i]}: ${extractedValues[i]}`);
    }
  }

  // Check if colorscale is being used
  let colorscale = (input.layout as any)?.coloraxis?.colorscale || (input.data[0] as any)?.colorscale;
  const hasColorscale = colorscale && Array.isArray(colorscale);

  // Apply lighter colorscale only for red-blue diverging schemes to match Plotly's visual appearance
  if (hasColorscale && colorscale) {
    // Detect if this is a red-blue diverging colorscale (not red-yellow-green or other intentional schemes)
    const isRedBlueColorscale = colorscale.some(
      ([, color]: [number, string]) =>
        color === 'rgb(103,0,31)' || color === 'rgb(178,24,43)' || color === 'rgb(214,96,77)',
    );

    // Convert Plotly named colors to pure CSS colors for discrete colorscales
    const plotlyColorMap: Record<string, string> = {
      green: 'rgb(0,128,0)', // Pure CSS green for discrete bands
      yellow: 'rgb(255,255,0)', // Pure CSS yellow for discrete bands
      red: 'rgb(255,0,0)', // Pure CSS red for discrete bands
      lightgray: 'rgb(211,211,211)',
      grey: 'rgb(128,128,128)',
      gray: 'rgb(128,128,128)',
    };
    colorscale = colorscale.map(([position, color]: [number, string]) => {
      const lower = color.trim().toLowerCase();
      if (plotlyColorMap[lower]) {
        return [position, plotlyColorMap[lower]];
      }
      // Red-blue fix for diverging schemes only
      if (isRedBlueColorscale) {
        if (color === 'rgb(103,0,31)') {
          return [position, 'rgb(255,182,193)'];
        }
        if (color === 'rgb(178,24,43)') {
          return [position, 'rgb(255,160,160)'];
        }
        if (color === 'rgb(214,96,77)') {
          return [position, 'rgb(255,200,200)'];
        }
      }
      return [position, color];
    });
  }

  // Extract colors for sunburst chart using the same approach as other charts
  // Use sunburstcolorway if available, otherwise fall back to template colorway
  let colors: string[] | string | null | undefined;

  if (hasColorscale && first.marker?.coloraxis) {
    // Handle colorscale mapping using the color values from marker.colors or customdata
    let colorValues: number[] = [];

    // Try to get color values from marker.colors first
    if (first.marker.colors) {
      if (Array.isArray(first.marker.colors)) {
        colorValues = first.marker.colors.map((c: any) => (typeof c === 'number' ? c : parseFloat(String(c)) || 0));
      } else if (typeof first.marker.colors === 'object' && 'bdata' in first.marker.colors) {
        colorValues = decodeBinaryData(first.marker.colors);
      }
    }

    // If no color values from marker, try to extract from customdata (refund amounts)
    if (colorValues.length === 0 && first.customdata) {
      if (Array.isArray(first.customdata)) {
        // Extract the last element from each row (should be the metric value for coloring)
        colorValues = first.customdata.map((row: any) => {
          if (Array.isArray(row) && row.length > 0) {
            const lastElement = row[row.length - 1];
            return typeof lastElement === 'number' && !isNaN(lastElement) ? lastElement : 0;
          }
          return 0;
        });
      } else if (typeof first.customdata === 'object' && 'bdata' in first.customdata) {
        colorValues = decodeBinaryData(first.customdata);
      }
    }

    // If still no color values, use the chart values as fallback
    if (colorValues.length === 0) {
      colorValues = extractedValues;
    }

    if (colorValues.length > 0) {
      // Filter out NaN values for min/max calculation
      const validColorValues = colorValues.filter(value => !isNaN(value) && isFinite(value));

      if (validColorValues.length > 0) {
        // Use cmin/cmax from schema if defined, otherwise use data min/max
        const coloraxis = (input.layout as any)?.coloraxis;
        const minValue = typeof coloraxis?.cmin === 'number' ? coloraxis.cmin : Math.min(...validColorValues);
        const maxValue = typeof coloraxis?.cmax === 'number' ? coloraxis.cmax : Math.max(...validColorValues);

        // Check if there's a colorscale midpoint (cmid) defined
        const cmid = typeof coloraxis?.cmid === 'number' ? coloraxis.cmid : undefined;

        // Map each value to a color using the colorscale
        colors = colorValues.map(value => {
          if (isNaN(value) || !isFinite(value)) {
            // Use a neutral color for NaN/invalid values (middle of colorscale)
            return interpolateColorFromScale(cmid || (minValue + maxValue) / 2, colorscale, minValue, maxValue, cmid);
          }
          return interpolateColorFromScale(value, colorscale, minValue, maxValue, cmid);
        });
      }
    }
  } else {
    colors = extractColor(
      (input.layout as any)?.sunburstcolorway ?? input.layout?.template?.layout?.colorway,
      colorwayType,
      first.marker?.colors,
      colorMap,
      isDarkTheme,
    );
  }

  // Build a minimal tree and (if marker.colors exists) stamp colors on legend-level nodes so descendants inherit.
  // We only attach color on nodes whose parent is falsy (roots) when multiple roots, or children of a single root.
  const buildColorStampedRoot = (): ISunburstNode | undefined => {
    if (!flat.ids.length) {
      return undefined;
    }
    // Create map for quick lookup
    const map: Record<string, ISunburstNode & { parent?: string | null }> = {};
    flat.ids.forEach((id, i) => {
      // Use 0 as default value if values array is shorter than ids array
      const value = i < flat.values.length ? flat.values[i] : 0;
      map[id] = map[id] || { id, label: flat.labels[i], value, children: [] };
    });
    flat.ids.forEach((id, i) => {
      const parent = flat.parents[i];
      if (!parent) {
        return;
      }
      if (!map[parent]) {
        map[parent] = { id: parent, label: String(parent), value: 0, children: [] };
      }
      map[parent].children = map[parent].children || [];
      map[parent].children!.push(map[id]);
    });
    // Determine visible legend ring depth
    const rootCandidates: ISunburstNode[] = [];
    flat.ids.forEach((id, i) => {
      const parent = flat.parents[i];
      if (!parent) {
        rootCandidates.push(map[id]);
      }
    });
    let legendNodes: ISunburstNode[] = [];
    if (rootCandidates.length === 1) {
      legendNodes = (map[rootCandidates[0].id].children ?? []) as ISunburstNode[];
    } else {
      legendNodes = rootCandidates;
    }

    // Helper to roll up values for a node (sum of descendants) for sorting
    const rollup = (n: ISunburstNode): number => {
      if (!n.children || n.children.length === 0) {
        return n.value || 0;
      }
      let sum = n.value || 0;
      for (const c of n.children) {
        sum += rollup(c);
      }
      return sum;
    };

    // If colorscale colors are provided, assign them directly
    if (hasColorscale && Array.isArray(colors)) {
      const ids = first.ids ?? [];
      // Create a complete color mapping for all IDs using the colorscale colors
      for (let i = 0; i < ids.length && i < colors.length; i++) {
        if (map[ids[i]]) {
          map[ids[i]].color = colors[i];
        }
      }
    } else if (Array.isArray(first.marker?.colors)) {
      const ids = first.ids ?? [];
      // Create a complete color mapping for all IDs using resolveColor
      for (let i = 0; i < ids.length; i++) {
        if (map[ids[i]]) {
          map[ids[i]].color = resolveColor(colors, i, ids[i], colorMap, isDarkTheme);
        }
      }
    }

    // Sort legend nodes by rolled-up value (desc) to stabilize color assignment when using colorway
    // This happens AFTER color assignment from marker.colors to preserve id-to-color mapping
    legendNodes.sort((a, b) => rollup(b) - rollup(a));

    // Assign colors by depth using colorway so that root has one color and children have different colors.
    // Deterministic order per depth: sort labels by rolled-up value (desc), then assign colorway in that order.
    // Only run this if we don't have explicit marker colors or colorscale colors (which would have been assigned above)
    if (colors && !Array.isArray(first.marker?.colors) && !hasColorscale) {
      // Determine which depth is the first visible ring (legend level)
      const legendDepth = rootCandidates.length === 1 ? 1 : 0; // children of single root OR root level when multiple roots

      // Build a traversal root (virtual when multiple roots)
      const traversalRoot: ISunburstNode =
        rootCandidates.length === 1
          ? map[rootCandidates[0].id]
          : { id: 'root', label: 'Root', value: 0, children: rootCandidates };

      // Ensure values are rolled up for ordering
      const rollupTree = (n: ISunburstNode): number => {
        if (!n.children || n.children.length === 0) {
          return n.value || 0;
        }
        let s = n.value || 0;
        for (const c of n.children) {
          s += rollupTree(c);
        }
        n.value = s;
        return s;
      };
      rollupTree(traversalRoot);

      // Collect first-appearance order by label for each depth (DFS preserves input child order)
      const orderByDepth = new Map<number, string[]>();
      const seenByDepth = new Map<number, Set<string>>();
      const dfsCollect = (node: ISunburstNode, depth: number) => {
        const label = node.label ?? node.id;
        const seen = seenByDepth.get(depth) || new Set<string>();
        const order = orderByDepth.get(depth) || [];
        if (!seen.has(label)) {
          seen.add(label);
          order.push(label);
        }
        seenByDepth.set(depth, seen);
        orderByDepth.set(depth, order);
        (node.children || []).forEach(c => dfsCollect(c, depth + 1));
      };
      dfsCollect(traversalRoot, 0);

      // Build color maps per depth (skip legendDepth which is uniform)
      const colorMapPerDepth = new Map<number, Map<string, string>>();
      orderByDepth.forEach((labels, depth) => {
        if (depth === legendDepth) {
          return;
        }
        const cmap = new Map<string, string>();
        labels.forEach((label, idx) => {
          cmap.set(label, resolveColor(colors, idx, label, colorMap, isDarkTheme));
        });
        colorMapPerDepth.set(depth, cmap);
      });

      // Assign colors: legendDepth gets different colors from colorway; others use per-depth label mapping.
      const dfsAssign = (node: ISunburstNode, depth: number) => {
        if (!node.color) {
          if (depth === legendDepth) {
            // Each legend-level node gets a different color from the colorway
            const legendNodes = orderByDepth.get(depth) || [];
            const nodeLabel = node.label ?? node.id;
            const colorIndex = legendNodes.indexOf(nodeLabel);
            node.color = resolveColor(colors, colorIndex >= 0 ? colorIndex : 0, nodeLabel, colorMap, isDarkTheme);
          } else {
            const label = node.label ?? node.id;
            const cmap = colorMapPerDepth.get(depth);
            if (cmap && cmap.has(label)) {
              node.color = cmap.get(label)!;
            }
          }
        }
        (node.children || []).forEach(c => dfsAssign(c, depth + 1));
      };
      dfsAssign(traversalRoot, 0);
    }

    if (rootCandidates.length === 1) {
      return map[rootCandidates[0].id];
    }

    // For Plotly-style sunburst, multiple roots should start from center
    // Don't create a virtual root - instead return a pseudo-root that represents the center
    // This allows each true root (A, B, C) to start from depth 0 at the center
    return {
      id: '__plotly_center__',
      label: '',
      value: rootCandidates.reduce((sum, r) => sum + (r.value || 0), 0),
      children: rootCandidates,
    };
  };

  const { chartTitle } = getTitles(input.layout);

  // Create data object with marker colors when available
  const dataObject: any = {
    flat,
    chartTitle,
  };

  // Add marker colors if available for the base component to use
  if (hasColorscale && Array.isArray(colors)) {
    // For colorscale, we provide both the colorscale colors and use custom root
    dataObject.marker = { colors: colors };
    dataObject.root = buildColorStampedRoot();
  } else if (Array.isArray(first.marker?.colors)) {
    dataObject.marker = { colors: first.marker.colors };
  } else {
    // Only use custom root when no explicit colors
    dataObject.root = buildColorStampedRoot();
  }

  // Calculate appropriate levelThickness to ensure all layers are visible
  // Find the maximum depth in the data
  let maxDepth = 0;
  if (flat.ids.length > 0) {
    // Build depth map
    const depthMap: Record<string, number> = {};
    const calculateDepth = (id: string): number => {
      if (depthMap[id] !== undefined) {
        return depthMap[id];
      }
      const index = flat.ids.indexOf(id);
      const parent = flat.parents[index];
      if (!parent) {
        depthMap[id] = 0;
        return 0;
      }
      const parentDepth = calculateDepth(parent);
      depthMap[id] = parentDepth + 1;
      return parentDepth + 1;
    };

    flat.ids.forEach(id => {
      const depth = calculateDepth(id);
      if (depth > maxDepth) {
        maxDepth = depth;
      }
    });
  }

  // Calculate available radius considering margins
  const width = input.layout?.width || 300;
  const height = input.layout?.height || 300;
  const hideLabels = first.textinfo ? !['value', 'percent', 'label+percent'].includes(first.textinfo as string) : true;
  const marginHorizontal = hideLabels ? 0 : 80;
  const marginVertical = hideLabels ? 0 : 40;
  const availableRadius = Math.min(width - marginHorizontal, height - marginVertical) / 2;

  // Calculate levelThickness to fit all layers (add 1 to maxDepth for total layers)
  const totalLayers = maxDepth + 1;
  const calculatedLevelThickness = totalLayers > 0 ? Math.floor(availableRadius / totalLayers) : 40;
  // Ensure minimum thickness of 20 for visibility
  const levelThickness = Math.max(20, calculatedLevelThickness);

  // Debug: Final check before returning props
  if (first.branchvalues === 'remainder') {
    console.log('=== FINAL SUNBURST PROPS ===');
    console.log('branchValues:', (first.branchvalues as 'total' | 'remainder') ?? 'total');
    console.log('data.flat.values sample:', dataObject.flat?.values?.slice(0, 10));
  }
  console.log('dataObject = ', dataObject);

  return {
    data: dataObject,
    branchValues: (first.branchvalues as 'total' | 'remainder') ?? 'total',
    hideLabels,
    showLabelsInPercent: first.textinfo ? ['percent', 'label+percent'].includes(first.textinfo as string) : false,
    width: input.layout?.width,
    height: input.layout?.height,
    roundCorners: true,
    legendProps: { canSelectMultipleLegends: true },
    // Sort segments by value (desc) to assign palette colors deterministically
    sort: 'desc',
    levelThickness,
  } as ISunburstChartProps;
};

export const transformPlotlyJsonToVSBCProps = (
  input: PlotlySchema,
  colorMap: React.MutableRefObject<Map<string, string>>,
  colorwayType: ColorwayType,
  isDarkTheme?: boolean,
  fallbackVSBC?: boolean,
): IVerticalStackedBarChartProps => {
  const mapXToDataPoints: { [key: string]: IVerticalStackedChartProps } = {};
  let yMaxValue = 0;
  let yMinValue = 0;
  const secondaryYAxisValues = getSecondaryYAxisValues(input.data, input.layout);
  const { legends, hideLegend } = getLegendProps(input.data, input.layout);
  let colorScale: ((value: number) => string) | undefined = undefined;
  input.data.forEach((series: Partial<PlotData>, index1: number) => {
    if (
      input.layout?.coloraxis?.colorscale?.length &&
      isArrayOrTypedArray(series.marker?.color) &&
      (series.marker?.color as Color[]).length > 0 &&
      typeof (series.marker?.color as Color[])?.[0] === 'number'
    ) {
      colorScale = createColorScale(input.layout, series);
    }
    const isXYearCategory = isYearArray(series.x); // Consider year as categorical not numeric continuous axis
    // extract bar colors for each series only once
    const extractedBarColors = extractColor(
      input.layout?.template?.layout?.colorway,
      colorwayType,
      series.marker?.color,
      colorMap,
      isDarkTheme,
    ) as string[] | string | undefined;
    // extract line colors for each series only once
    const extractedLineColors = extractColor(
      input.layout?.template?.layout?.colorway,
      colorwayType,
      series.line?.color,
      colorMap,
      isDarkTheme,
    ) as string[] | string | undefined;

    const xValues = series.x as Datum[];
    const isXDate = isDateArray(xValues);
    const isXString = isStringArray(xValues);
    const isXNumber = isNumberArray(xValues);
    const validXYRanges = getValidXYRanges(series);
    validXYRanges.forEach(([rangeStart, rangeEnd], rangeIdx) => {
      const rangeXValues = series.x!.slice(rangeStart, rangeEnd);
      const rangeYValues = series.y!.slice(rangeStart, rangeEnd);

      (rangeXValues as Datum[]).forEach((x: string | number, index2: number) => {
        if (!mapXToDataPoints[x]) {
          mapXToDataPoints[x] = {
            xAxisPoint: resolveXAxisPoint(x, isXYearCategory, isXString, isXDate, isXNumber),
            chartData: [],
            lineData: [],
          };
        }
        const legend: string = legends[index1];
        // resolve color for each legend's bars from the colorscale or extracted colors
        const color = colorScale
          ? colorScale(
              isArrayOrTypedArray(series.marker?.color)
                ? ((series.marker?.color as Color[])?.[index2 % (series.marker?.color as Color[]).length] as number)
                : 0,
            )
          : resolveColor(extractedBarColors, index2, legend, colorMap, isDarkTheme);
        const yVal: number = rangeYValues[index2] as number;
        if (series.type === 'bar') {
          mapXToDataPoints[x].chartData.push({
            legend,
            data: yVal,
            color,
          });
          if (typeof yVal === 'number') {
            yMaxValue = Math.max(yMaxValue, yVal);
          }
        } else if (series.type === 'scatter' || !!fallbackVSBC) {
          const lineColor = resolveColor(extractedLineColors, index1, legend, colorMap, isDarkTheme);
          const lineOptions = getLineOptions(series.line);
          const dashType = series.line?.dash || 'solid';
          const legendShape =
            dashType === 'dot' || dashType === 'dash' || dashType === 'dashdot'
              ? 'dottedLine'
              : series.mode?.includes('markers')
              ? 'circle'
              : 'default';
          mapXToDataPoints[x].lineData!.push({
            legend: legend + (validXYRanges.length > 1 ? `.${rangeIdx + 1}` : ''),
            legendShape,
            y: yVal,
            color: lineColor,
            lineOptions: {
              ...(lineOptions ?? {}),
              // Some plotly modes like 'lines+text' are equivalent to 'text+lines'; coerce to a compatible union literal
              mode: series.mode as
                | 'number'
                | 'text'
                | 'lines'
                | 'markers'
                | 'lines+markers'
                | 'text+markers'
                | 'text+lines'
                | 'text+lines+markers'
                | 'none'
                | 'gauge'
                | 'delta'
                | 'number+delta'
                | 'gauge+number'
                | 'gauge+number+delta'
                | 'gauge+delta'
                | 'markers+text'
                | undefined,
            },
            useSecondaryYScale: usesSecondaryYScale(series),
          });
          if (!usesSecondaryYScale(series) && typeof yVal === 'number') {
            yMaxValue = Math.max(yMaxValue, yVal);
            yMinValue = Math.min(yMinValue, yVal);
          }
        }
      });
    });
  });

  const { chartTitle, xAxisTitle, yAxisTitle } = getTitles(input.layout);

  return {
    data: Object.values(mapXToDataPoints),
    width: input.layout?.width,
    height: input.layout?.height ?? 350,
    barWidth: 'auto',
    yMaxValue,
    yMinValue,
    chartTitle,
    xAxisTitle,
    yAxisTitle,
    mode: 'plotly',
    ...secondaryYAxisValues,
    hideTickOverlap: true,
    hideLegend,
    roundCorners: true,
    supportNegativeData: true,
    barGapMax: 2,
    showYAxisLables: true,
    noOfCharsToTruncate: 20,
    showYAxisLablesTooltip: true,
  };
};

const createColorScale = (layout: Partial<Layout>, series: Partial<PlotData>) => {
  const scale = layout?.coloraxis?.colorscale as Array<[number, string]>;
  const colorValues = series.marker?.color as number[];
  const [dMin, dMax] = [
    layout?.coloraxis?.cmin ?? Math.min(...colorValues),
    layout?.coloraxis?.cmax ?? Math.max(...colorValues),
  ];

  // Normalize colorscale domain to actual data domain
  const scaleDomain = scale.map(([pos]) => dMin + pos * (dMax - dMin));
  const scaleColors = scale.map(item => item[1]);

  return d3ScaleLinear<string>().domain(scaleDomain).range(scaleColors);
};

export const transformPlotlyJsonToGVBCProps = (
  input: PlotlySchema,
  colorMap: React.MutableRefObject<Map<string, string>>,
  colorwayType: ColorwayType,
  isDarkTheme?: boolean,
): IGroupedVerticalBarChartProps => {
  const mapXToDataPoints: Record<string, IGroupedVerticalBarChartData> = {};
  const secondaryYAxisValues = getSecondaryYAxisValues(input.data, input.layout, 0, 0);
  const { legends, hideLegend } = getLegendProps(input.data, input.layout);
  let colorScale: ((value: number) => string) | undefined = undefined;
  input.data.forEach((series: Partial<PlotData>, index1: number) => {
    if (
      input.layout?.coloraxis?.colorscale?.length &&
      isArrayOrTypedArray(series.marker?.color) &&
      (series.marker?.color as Color[]).length > 0 &&
      typeof (series.marker?.color as Color[])?.[0] === 'number'
    ) {
      colorScale = createColorScale(input.layout, series);
    }
    // extract colors for each series only once
    const extractedColors = extractColor(
      input.layout?.template?.layout?.colorway,
      colorwayType,
      series.marker?.color,
      colorMap,
      isDarkTheme,
    ) as string[] | string | undefined;
    (series.x as Datum[])?.forEach((x: string | number, xIndex: number) => {
      if (isInvalidValue(x) || isInvalidValue(series.y?.[xIndex])) {
        return;
      }

      if (!mapXToDataPoints[x]) {
        mapXToDataPoints[x] = { name: x.toString(), series: [] };
      }

      if (series.type === 'bar') {
        const legend: string = legends[index1];
        // resolve color for each legend's bars from the colorscale or extracted colors
        const color = colorScale
          ? colorScale(
              isArrayOrTypedArray(series.marker?.color)
                ? ((series.marker?.color as Color[])?.[xIndex % (series.marker?.color as Color[]).length] as number)
                : 0,
            )
          : resolveColor(extractedColors, index1, legend, colorMap, isDarkTheme);

        mapXToDataPoints[x].series.push({
          key: legend,
          data: series.y![xIndex] as number,
          xAxisCalloutData: x as string,
          color,
          legend,
          useSecondaryYScale: usesSecondaryYScale(series),
        });
      }
    });
  });

  const { chartTitle, xAxisTitle, yAxisTitle } = getTitles(input.layout);

  return {
    data: Object.values(mapXToDataPoints),
    width: input.layout?.width,
    height: input.layout?.height ?? 350,
    barwidth: 'auto',
    chartTitle,
    xAxisTitle,
    yAxisTitle,
    mode: 'plotly',
    ...secondaryYAxisValues,
    hideTickOverlap: true,
    hideLegend,
    roundCorners: true,
  };
};

export const transformPlotlyJsonToVBCProps = (
  input: PlotlySchema,
  colorMap: React.MutableRefObject<Map<string, string>>,
  colorwayType: ColorwayType,
  isDarkTheme?: boolean,
): IVerticalBarChartProps => {
  const vbcData: IVerticalBarChartDataPoint[] = [];
  const { legends, hideLegend } = getLegendProps(input.data, input.layout);
  let colorScale: ((value: number) => string) | undefined = undefined;

  input.data.forEach((series: Partial<PlotData>, seriesIdx: number) => {
    if (!series.x) {
      return;
    }

    if (
      input.layout?.coloraxis?.colorscale?.length &&
      isArrayOrTypedArray(series.marker?.color) &&
      (series.marker?.color as Color[]).length > 0 &&
      typeof (series.marker?.color as Color[])?.[0] === 'number'
    ) {
      colorScale = createColorScale(input.layout, series);
    }
    // extract colors for each series only once
    const extractedColors = extractColor(
      input.layout?.template?.layout?.colorway,
      colorwayType,
      series.marker?.color,
      colorMap,
      isDarkTheme,
    ) as string[] | string | undefined;

    const xValues: (string | number)[] = [];
    const yValues: number[] = [];
    series.x.forEach((xVal, index) => {
      const yVal = getNumberAtIndexOrDefault(series.y, index);
      if (isInvalidValue(xVal) || isInvalidValue(yVal)) {
        return;
      }

      xValues.push(xVal as string | number);
      yValues.push(yVal as number);
    });

    const isXString = isStringArray(xValues);
    // TODO: In case of a single bin, add an empty bin of the same size to prevent the
    // default bar width from being used and ensure the bar spans the full intended range.
    const xBins = createBins(xValues, series.xbins?.start, series.xbins?.end, series.xbins?.size);
    const yBins: number[][] = xBins.map(() => []);
    let total = 0;

    xValues.forEach((xVal, index) => {
      const binIdx = findBinIndex(xBins, xVal, isXString);
      if (binIdx !== -1) {
        yBins[binIdx].push(yValues[index]);
      }
    });

    const y = yBins.map(bin => {
      const yVal = calculateHistFunc(series.histfunc, bin);
      total += yVal;
      return yVal;
    });

    xBins.forEach((bin, index) => {
      const legend: string = legends[seriesIdx];
      // resolve color for each legend's bars from the colorscale or extracted colors
      const color = colorScale
        ? colorScale(
            isArrayOrTypedArray(series.marker?.color)
              ? ((series.marker?.color as Color[])?.[index % (series.marker?.color as Color[]).length] as number)
              : 0,
          )
        : resolveColor(extractedColors, index, legend, colorMap, isDarkTheme);
      const yVal = calculateHistNorm(
        series.histnorm,
        y[index],
        total,
        isXString ? bin.length : getBinSize(bin as Bin<number, number>),
      );

      vbcData.push({
        x: isXString ? bin.join(', ') : getBinCenter(bin as Bin<number, number>),
        y: yVal,
        legend,
        color,
        ...(isXString
          ? {}
          : { xAxisCalloutData: `[${(bin as Bin<number, number>).x0} - ${(bin as Bin<number, number>).x1})` }),
      });
    });
  });

  const { chartTitle, xAxisTitle, yAxisTitle } = getTitles(input.layout);

  return {
    data: vbcData,
    width: input.layout?.width,
    height: input.layout?.height ?? 350,
    supportNegativeData: true,
    chartTitle,
    xAxisTitle,
    yAxisTitle,
    mode: 'histogram',
    hideTickOverlap: true,
    maxBarWidth: 50,
    hideLegend,
    roundCorners: true,
  };
};

export const transformPlotlyJsonToScatterChartProps = (
  input: PlotlySchema,
  isAreaChart: boolean,
  isScatterMarkers: boolean,
  colorMap: React.MutableRefObject<Map<string, string>>,
  colorwayType: ColorwayType,
  isDarkTheme?: boolean,
): ILineChartProps | IAreaChartProps => {
  const secondaryYAxisValues = getSecondaryYAxisValues(
    input.data,
    input.layout,
    isAreaChart ? 0 : undefined,
    isAreaChart ? 0 : undefined,
  );
  let mode: string = 'tonexty';
  const { legends, hideLegend } = getLegendProps(input.data, input.layout);
  const chartData: ILineChartPoints[] = input.data
    .map((series: Partial<PlotData>, index: number) => {
      const colors = isScatterMarkers
        ? series?.mode?.includes('line')
          ? series.line?.color
          : series.marker?.color
        : series.line?.color;
      // extract colors for each series only once
      const extractedColors = extractColor(
        input.layout?.template?.layout?.colorway,
        colorwayType,
        colors,
        colorMap,
        isDarkTheme,
      ) as string[] | string | undefined;
      const xValues = series.x as Datum[];
      const isXString = isStringArray(xValues);
      const isXDate = isDateArray(xValues);
      const isXNumber = isNumberArray(xValues);
      // string case is not possible for scatter chart as it is already filtered out in declarative chart
      const isXYearCategory = false;
      const legend: string = legends[index];
      // resolve color for each legend's lines from the extracted colors
      const seriesColor = resolveColor(extractedColors, index, legend, colorMap, isDarkTheme);
      mode = series.fill === 'tozeroy' ? 'tozeroy' : 'tonexty';
      const lineOptions = getLineOptions(series.line);
      const dashType = series.line?.dash || 'solid';
      const legendShape =
        dashType === 'dot' || dashType === 'dash' || dashType === 'dashdot'
          ? 'dottedLine'
          : series.mode?.includes('markers')
          ? 'circle'
          : 'default';

      const validXYRanges = getValidXYRanges(series);
      return validXYRanges.map(([rangeStart, rangeEnd], rangeIdx) => {
        const rangeXValues = xValues.slice(rangeStart, rangeEnd);
        const rangeYValues = series.y!.slice(rangeStart, rangeEnd);
        const markerSizes = isArrayOrTypedArray(series.marker?.size)
          ? (series.marker!.size as number[]).slice(rangeStart, rangeEnd)
          : [];
        const textValues = Array.isArray(series.text) ? series.text.slice(rangeStart, rangeEnd) : undefined;

        return {
          legend,
          legendShape,
          data: rangeXValues.map((x, i: number) => ({
            x: resolveXAxisPoint(x, isXYearCategory, isXString, isXDate, isXNumber),
            y: rangeYValues[i],
            ...(Array.isArray(series.marker?.size)
              ? { markerSize: markerSizes[i] }
              : typeof series.marker?.size === 'number'
              ? { markerSize: series.marker.size }
              : {}),
            ...(textValues ? { text: textValues[i] } : {}),
          })),
          color: seriesColor,
          lineOptions: {
            ...(lineOptions ?? {}),
            mode: series.mode as
              | 'number'
              | 'text'
              | 'lines'
              | 'markers'
              | 'lines+markers'
              | 'text+markers'
              | 'text+lines'
              | 'text+lines+markers'
              | 'none'
              | 'gauge'
              | 'delta'
              | 'number+delta'
              | 'gauge+number'
              | 'gauge+number+delta'
              | 'gauge+delta'
              | 'markers+text'
              | undefined,
          },
          useSecondaryYScale: usesSecondaryYScale(series),
        } as ILineChartPoints;
      });
    })
    .flat();

  const yMinMaxValues = findNumericMinMaxOfY(chartData);
  const { chartTitle, xAxisTitle, yAxisTitle } = getTitles(input.layout);
  const numDataPoints = chartData.reduce((total, lineChartPoints) => total + lineChartPoints.data.length, 0);

  const chartProps: IChartProps = {
    chartTitle,
    lineChartData: chartData,
  };

  if (isAreaChart) {
    return {
      data: chartProps,
      supportNegativeData: true,
      xAxisTitle,
      yAxisTitle,
      ...secondaryYAxisValues,
      mode,
      width: input.layout?.width,
      height: input.layout?.height ?? 350,
      hideTickOverlap: true,
      hideLegend,
      useUTC: false,
      optimizeLargeData: numDataPoints > 1000,
    } as IAreaChartProps;
  } else {
    return {
      data: chartProps,
      supportNegativeData: true,
      xAxisTitle,
      yAxisTitle,
      ...secondaryYAxisValues,
      roundedTicks: true,
      yMinValue: yMinMaxValues.startValue,
      yMaxValue: yMinMaxValues.endValue,
      width: input.layout?.width,
      height: input.layout?.height ?? 350,
      hideTickOverlap: true,
      enableReflow: false,
      hideLegend,
      useUTC: false,
      optimizeLargeData: numDataPoints > 1000,
    } as ILineChartProps;
  }
};

export const transformPlotlyJsonToHorizontalBarWithAxisProps = (
  input: PlotlySchema,
  colorMap: React.MutableRefObject<Map<string, string>>,
  colorwayType: ColorwayType,
  isDarkTheme?: boolean,
): IHorizontalBarChartWithAxisProps => {
  const { legends, hideLegend } = getLegendProps(input.data, input.layout);
  let colorScale: ((value: number) => string) | undefined = undefined;
  const chartData: IHorizontalBarChartWithAxisDataPoint[] = input.data
    .map((series: Partial<PlotData>, index: number) => {
      if (
        input.layout?.coloraxis?.colorscale?.length &&
        isArrayOrTypedArray(series.marker?.color) &&
        (series.marker?.color as Color[]).length > 0 &&
        typeof (series.marker?.color as Color[])?.[0] === 'number'
      ) {
        colorScale = createColorScale(input.layout, series);
      }
      // extract colors for each series only once
      const extractedColors = extractColor(
        input.layout?.template?.layout?.colorway,
        colorwayType,
        series.marker?.color,
        colorMap,
        isDarkTheme,
      ) as string[] | string | undefined;
      const legend = legends[index];
      return (series.y as Datum[])
        .map((yValue, i: number) => {
          if (isInvalidValue(series.x?.[i]) || isInvalidValue(yValue)) {
            return null;
          }
          // resolve color for each legend's bars from the colorscale or extracted colors
          const color = colorScale
            ? colorScale(
                isArrayOrTypedArray(series.marker?.color)
                  ? ((series.marker?.color as Color[])?.[i % (series.marker?.color as Color[]).length] as number)
                  : 0,
              )
            : resolveColor(extractedColors, i, legend, colorMap, isDarkTheme);

          return {
            x: series.x![i],
            y: yValue,
            legend,
            color,
          } as IHorizontalBarChartWithAxisDataPoint;
        })
        .filter(point => point !== null) as IHorizontalBarChartWithAxisDataPoint[];
    })
    .reverse()
    .flat()
    //reversing the order to invert the Y bars order as required by plotly.
    .reverse();

  const chartHeight: number = input.layout?.height ?? 450;
  const margin: number = input.layout?.margin?.l ?? 0;
  const padding: number = input.layout?.margin?.pad ?? 0;
  const availableHeight: number = chartHeight - margin - padding;
  const numberOfRows = new Set(chartData.map(d => d.y)).size || 1;
  const scalingFactor = 0.01;
  const gapFactor = 1 / (1 + scalingFactor * numberOfRows);
  const barHeight = availableHeight / (numberOfRows * (1 + gapFactor));

  const { chartTitle, xAxisTitle, yAxisTitle } = getTitles(input.layout);

  return {
    data: chartData,
    chartTitle,
    xAxisTitle,
    yAxisTitle,
    secondaryYAxistitle:
      typeof input.layout?.yaxis2?.title === 'string'
        ? input.layout?.yaxis2?.title
        : input.layout?.yaxis2?.title?.text || '',
    barHeight,
    showYAxisLables: true,
    height: chartHeight,
    width: input.layout?.width,
    hideTickOverlap: true,
    hideLegend,
    noOfCharsToTruncate: 20,
    showYAxisLablesTooltip: true,
    roundCorners: true,
  };
};

export const transformPlotlyJsonToHeatmapProps = (input: PlotlySchema): IHeatMapChartProps => {
  const firstData = input.data[0] as Partial<PlotData>;
  const heatmapDataPoints: IHeatMapChartDataPoint[] = [];
  let zMin = Number.POSITIVE_INFINITY;
  let zMax = Number.NEGATIVE_INFINITY;

  if (firstData.type === 'histogram2d') {
    const xValues: (string | number)[] = [];
    const yValues: (string | number)[] = [];
    const zValues: number[] = [];
    firstData.x?.forEach((xVal, index) => {
      const zVal = getNumberAtIndexOrDefault(firstData.z, index);
      if (isInvalidValue(xVal) || isInvalidValue(firstData.y?.[index]) || isInvalidValue(zVal)) {
        return;
      }

      xValues.push(xVal as string | number);
      yValues.push(firstData.y![index] as string | number);
      zValues.push(zVal as number);
    });

    const isXString = isStringArray(xValues);
    const isYString = isStringArray(yValues);
    const xBins = createBins(xValues, firstData.xbins?.start, firstData.xbins?.end, firstData.xbins?.size);
    const yBins = createBins(yValues, firstData.ybins?.start, firstData.ybins?.end, firstData.ybins?.size);
    const zBins: number[][][] = yBins.map(() => xBins.map(() => []));
    let total = 0;

    xValues.forEach((xVal, index) => {
      const xBinIdx = findBinIndex(xBins, xVal, isXString);
      const yBinIdx = findBinIndex(yBins, yValues[index], isYString);
      if (xBinIdx !== -1 && yBinIdx !== -1) {
        zBins[yBinIdx][xBinIdx].push(zValues[index]);
      }
    });

    const z = zBins.map(row => {
      return row.map(bin => {
        const zVal = calculateHistFunc(firstData.histfunc, bin);
        total += zVal;
        return zVal;
      });
    });

    xBins.forEach((xBin, xIdx) => {
      yBins.forEach((yBin, yIdx) => {
        const zVal = calculateHistNorm(
          firstData.histnorm,
          z[yIdx][xIdx],
          total,
          isXString ? xBin.length : getBinSize(xBin as Bin<number, number>),
          isYString ? yBin.length : getBinSize(yBin as Bin<number, number>),
        );

        heatmapDataPoints.push({
          x: isXString ? xBin.join(', ') : getBinCenter(xBin as Bin<number, number>),
          y: isYString ? yBin.join(', ') : getBinCenter(yBin as Bin<number, number>),
          value: zVal,
          rectText: zVal,
        });

        if (typeof zVal === 'number') {
          zMin = Math.min(zMin, zVal);
          zMax = Math.max(zMax, zVal);
        }
      });
    });
  } else {
    (firstData.x as Datum[])?.forEach((xVal, xIdx: number) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      firstData.y?.forEach((yVal: any, yIdx: number) => {
        const zVal = (firstData.z as number[][])?.[yIdx]?.[xIdx];

        heatmapDataPoints.push({
          x: input.layout?.xaxis?.type === 'date' ? (xVal as Date) : xVal ?? 0,
          y: input.layout?.yaxis?.type === 'date' ? (yVal as Date) : yVal,
          value: zVal,
          rectText: zVal,
        });

        if (typeof zVal === 'number') {
          zMin = Math.min(zMin, zVal);
          zMax = Math.max(zMax, zVal);
        }
      });
    });
  }

  const heatmapData: IHeatMapChartData = {
    legend: firstData.name ?? '',
    data: heatmapDataPoints,
    value: 0,
  };

  // Initialize domain and range to default values
  const defaultDomain = [zMin, (zMax + zMin) / 2, zMax];
  const defaultRange = [
    getColorFromToken(DataVizPalette.color1),
    getColorFromToken(DataVizPalette.color2),
    getColorFromToken(DataVizPalette.color3),
  ];

  let colorscale =
    firstData?.colorscale ??
    input.layout?.colorscale ??
    input.layout?.coloraxis?.colorscale ??
    input.layout?.template?.layout?.colorscale ??
    (firstData.type === 'histogram2d' && input.layout?.template?.data?.histogram2d?.[0]?.colorscale) ??
    input.layout?.template?.data?.heatmap?.[0]?.colorscale;

  // determine if the types diverging, sequential or sequentialminus are present in colorscale
  if (
    colorscale &&
    typeof colorscale === 'object' &&
    ('diverging' in colorscale || 'sequential' in colorscale || 'sequentialminus' in colorscale)
  ) {
    const isDivergent = zMin < 0 && zMax > 0; // Data spans both positive and negative values
    const isSequential = zMin >= 0; // Data is entirely positive
    const isSequentialMinus = zMax <= 0; // Data is entirely negative

    if (isDivergent) {
      colorscale = colorscale?.diverging;
    } else if (isSequential) {
      colorscale = colorscale?.sequential;
    } else if (isSequentialMinus) {
      colorscale = colorscale?.sequentialminus;
    }
  }

  const domainValuesForColorScale: number[] = Array.isArray(colorscale)
    ? (colorscale as Array<[number, string]>).map(arr => arr[0] * (zMax - zMin) + zMin)
    : defaultDomain;

  const rangeValuesForColorScale: string[] = Array.isArray(colorscale)
    ? (colorscale as Array<[number, string]>).map(arr => arr[1])
    : defaultRange;

  const { chartTitle, xAxisTitle, yAxisTitle } = getTitles(input.layout);

  return {
    data: [heatmapData],
    domainValuesForColorScale,
    rangeValuesForColorScale,
    hideLegend: true,
    showYAxisLables: true,
    chartTitle,
    xAxisTitle,
    yAxisTitle,
    sortOrder: 'none',
    width: input.layout?.width,
    height: input.layout?.height ?? 350,
    hideTickOverlap: true,
    noOfCharsToTruncate: 20,
    showYAxisLablesTooltip: true,
  };
};

export const transformPlotlyJsonToSankeyProps = (
  input: PlotlySchema,
  colorMap: React.MutableRefObject<Map<string, string>>,
  colorwayType: ColorwayType,
  isDarkTheme?: boolean,
): ISankeyChartProps => {
  const { link, node } = input.data[0] as SankeyData;
  const validLinks = (link?.value ?? [])
    .map((val: number, index: number) => {
      if (isInvalidValue(val) || isInvalidValue(link?.source?.[index]) || isInvalidValue(link?.target?.[index])) {
        return null;
      }

      return {
        value: val,
        source: link?.source![index],
        target: link?.target![index],
      };
    })
    // Filter out negative nodes, unequal nodes and self-references (circular links)
    .filter(x => x !== null && x.source >= 0 && x.target >= 0 && x.source !== x.target);
  const extractedNodeColors = extractColor(
    input.layout?.template?.layout?.colorway,
    colorwayType,
    node?.color,
    colorMap,
    isDarkTheme,
  );
  const sankeyChartData = {
    nodes: node.label?.map((label: string, index: number) => {
      const color = resolveColor(extractedNodeColors, index, label, colorMap, isDarkTheme);

      return {
        nodeId: index,
        name: label,
        color,
      };
    }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    links: validLinks.map((validLink: any, index: number) => {
      return {
        ...validLink,
      };
    }),
  } as ISankeyChartData;

  const styles: ISankeyChartProps['styles'] = {
    root: {
      ...(input.layout?.font?.size ? { fontSize: input.layout.font?.size } : {}),
    },
  };

  const { chartTitle } = getTitles(input.layout);

  return {
    data: {
      chartTitle,
      SankeyChartData: sankeyChartData,
    },
    width: input.layout?.width,
    height: input.layout?.height ?? 468,
    styles,
    enableReflow: true,
  };
};

export const transformPlotlyJsonToGaugeProps = (
  input: PlotlySchema,
  colorMap: React.MutableRefObject<Map<string, string>>,
  colorwayType: ColorwayType,
  isDarkTheme?: boolean,
): IGaugeChartProps => {
  const firstData = input.data[0] as PlotData;
  const stepsColors = firstData.gauge?.steps ? firstData.gauge.steps.map(step => step.color) : undefined;
  const extractedColors = extractColor(
    input.layout?.template?.layout?.colorway,
    colorwayType,
    stepsColors,
    colorMap,
    isDarkTheme,
  );
  const segments = firstData.gauge?.steps?.length
    ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
      firstData.gauge.steps.map((step: any, index: number): IGaugeChartSegment => {
        const legend = step.name || `Segment ${index + 1}`;
        const color = resolveColor(extractedColors, index, legend, colorMap, isDarkTheme);
        return {
          legend,
          size: step.range?.[1] - step.range?.[0],
          color,
        };
      })
    : [
        {
          legend: 'Current',
          size: firstData.value ?? 0 - (firstData.gauge?.axis?.range?.[0] ?? 0),
          color: _getGaugeAxisColor(
            input.layout?.template?.layout?.colorway,
            colorwayType,
            firstData.gauge?.axis?.color,
            colorMap,
            isDarkTheme,
          ),
        },
        {
          legend: 'Target',
          size: (firstData.gauge?.axis?.range?.[1] ?? 100) - (firstData.value ?? 0),
          color: DataVizPalette.disabled,
        },
      ];

  let sublabel: string | undefined;
  let sublabelColor: string | undefined;
  if (firstData.delta?.reference) {
    const diff = firstData.value - firstData.delta.reference;
    if (diff >= 0) {
      sublabel = `\u25B2 ${diff}`;
      const extractedIncreasingDeltaColors = extractColor(
        input.layout?.template?.layout?.colorway,
        colorwayType,
        firstData.delta?.increasing?.color,
        colorMap,
        isDarkTheme,
      );
      const color = resolveColor(extractedIncreasingDeltaColors, 0, '', colorMap, isDarkTheme);
      sublabelColor = color;
    } else {
      sublabel = `\u25BC ${Math.abs(diff)}`;
      const extractedDecreasingDeltaColors = extractColor(
        input.layout?.template?.layout?.colorway,
        colorwayType,
        firstData.delta?.decreasing?.color,
        colorMap,
        isDarkTheme,
      );
      const color = resolveColor(extractedDecreasingDeltaColors, 0, '', colorMap, isDarkTheme);
      sublabelColor = color;
    }
  }

  const styles: IGaugeChartProps['styles'] = {
    sublabel: {
      fill: sublabelColor,
    },
  };

  const { chartTitle } = getTitles(input.layout);

  return {
    segments,
    chartValue: firstData.value ?? 0,
    chartTitle,
    sublabel,
    // range values can be null
    minValue: typeof firstData.gauge?.axis?.range?.[0] === 'number' ? firstData.gauge?.axis?.range?.[0] : undefined,
    maxValue: typeof firstData.gauge?.axis?.range?.[1] === 'number' ? firstData.gauge?.axis?.range?.[1] : undefined,
    chartValueFormat: () => firstData.value?.toString() ?? '',
    width: input.layout?.width,
    height: input.layout?.height ?? 220,
    styles,
    variant: firstData.gauge?.steps?.length ? GaugeChartVariant.MultipleSegments : GaugeChartVariant.SingleSegment,
    roundCorners: true,
  };
};
const cleanText = (text: string): string => {
  return text
    .replace(/&lt;[^&]*?&gt;/g, '')
    .replace(/<[^>]*>/g, '')
    .replace(/&lt;br&gt;|\\u003cbr\\u003e|<br>/gi, '')
    .replace(/\$[^$]*\$/g, '$')
    .trim();
};

const formatValue = (
  value: string | number | boolean | null,
  colIndex: number,
  cells: TableData['cells'],
): string | number | boolean | null => {
  if (value === null || typeof value === 'boolean') {
    return value;
  }

  const formatStr = Array.isArray(cells!.format) ? cells!.format[colIndex] : cells!.format;
  const prefix = Array.isArray(cells!.prefix) ? cells!.prefix[colIndex] : cells!.prefix;
  const suffix = Array.isArray(cells!.suffix) ? cells!.suffix[colIndex] : cells!.suffix;
  let formatted = value;
  if (typeof value === 'number') {
    if (typeof formatStr === 'string') {
      try {
        formatted = d3Format(formatStr)(value);
      } catch {
        formatted = formatScientificLimitWidth(value);
      }
    } else {
      formatted = formatScientificLimitWidth(value);
    }
  }
  return `${prefix ?? ''}${formatted}${suffix ?? ''}`;
};

export const transformPlotlyJsonToChartTableProps = (
  input: PlotlySchema,
  colorMap: React.MutableRefObject<Map<string, string>>,
  isDarkTheme?: boolean,
): IChartTableProps => {
  const tableData = input.data[0] as TableData;

  const normalizeHeaders = (
    values: (string | number | boolean | null)[] | (string | number | boolean | null)[][],
    header: TableData['header'],
  ): { value: string | number | boolean | null; style?: React.CSSProperties }[] => {
    const cleanedValues: (string | number | boolean | null)[] = Array.isArray(values[0])
      ? (values as string[][]).map(row =>
          row
            .map(cell => cleanText(cell))
            .filter(Boolean)
            .join(' '),
        )
      : (values as string[]).map(cell => cleanText(cell));

    return cleanedValues.map((value, colIndex) => {
      const fontColorRaw = header?.font?.color;
      let fontColor: React.CSSProperties['color'] | undefined;

      if (Array.isArray(fontColorRaw)) {
        const colorEntry = fontColorRaw[colIndex];
        if (Array.isArray(colorEntry)) {
          fontColor = typeof colorEntry[0] === 'string' ? colorEntry[0] : undefined;
        } else if (typeof colorEntry === 'string') {
          fontColor = colorEntry;
        }
      } else if (typeof fontColorRaw === 'string') {
        fontColor = fontColorRaw;
      }

      const fontSizeRaw = header?.font?.size;
      let fontSize: React.CSSProperties['fontSize'] | undefined;

      if (Array.isArray(fontSizeRaw)) {
        fontSize = Array.isArray(fontSizeRaw[0]) ? fontSizeRaw[0][colIndex] : fontSizeRaw[colIndex];
      } else if (typeof fontSizeRaw === 'number') {
        fontSize = fontSizeRaw;
      }

      const updatedColIndex = colIndex >= 1 ? 1 : 0;
      const fillColorRaw = header?.fill?.color;
      const backgroundColor = Array.isArray(fillColorRaw) ? fillColorRaw[updatedColIndex] : fillColorRaw;

      const textAlignRaw = header?.align;
      const textAlign = Array.isArray(textAlignRaw) ? textAlignRaw[colIndex] : textAlignRaw;

      const style: React.CSSProperties = {
        ...(typeof fontColor === 'string' ? { color: fontColor } : {}),
        ...(typeof fontSize === 'number' ? { fontSize } : {}),
        ...(typeof backgroundColor === 'string' ? { backgroundColor } : {}),
        ...(textAlign ? { textAlign } : {}),
      };

      return { value, style };
    });
  };
  const columns = tableData.cells?.values ?? [];
  const cells = tableData.cells!.font ? tableData.cells! : input.layout?.template?.data?.table![0].cells;
  const rows = columns[0].map((_, rowIndex: number) =>
    columns.map((col, colIndex) => {
      const cellValue = col[rowIndex];
      const cleanValue = typeof cellValue === 'string' ? cleanText(cellValue) : cellValue;

      const formattedValue =
        typeof cleanValue === 'string' || typeof cleanValue === 'number'
          ? formatValue(cleanValue, colIndex, cells)
          : cleanValue;

      const rawFontColor = cells?.font?.color;
      let fontColor: React.CSSProperties['color'] | undefined;
      if (Array.isArray(rawFontColor)) {
        const entry = rawFontColor[colIndex];
        const colorValue = Array.isArray(entry) ? entry[rowIndex] : entry;
        fontColor = typeof colorValue === 'string' ? colorValue : undefined;
      } else if (typeof rawFontColor === 'string') {
        fontColor = rawFontColor;
      }

      const rawFontSize = cells?.font?.size;
      let fontSize: React.CSSProperties['fontSize'] | undefined;
      if (Array.isArray(rawFontSize)) {
        const entry = rawFontSize[colIndex];
        const fontSizeValue = Array.isArray(entry) ? entry[rowIndex] : entry;
        fontSize = typeof fontSizeValue === 'number' ? fontSizeValue : undefined;
      } else if (typeof rawFontSize === 'number') {
        fontSize = rawFontSize;
      }

      const updatedColIndex = colIndex >= 1 ? 1 : 0;
      const rawBackgroundColor = cells?.fill?.color;
      let backgroundColor: React.CSSProperties['backgroundColor'] | undefined;
      if (Array.isArray(rawBackgroundColor)) {
        const entry = rawBackgroundColor[updatedColIndex];
        const colorValue = Array.isArray(entry) ? entry[rowIndex] : entry;
        backgroundColor = typeof colorValue === 'string' ? colorValue : undefined;
      } else if (typeof rawBackgroundColor === 'string') {
        backgroundColor = rawBackgroundColor;
      }

      const rawTextAlign = Array.isArray(cells?.align) ? cells.align[colIndex] : cells?.align;
      const textAlign = rawTextAlign as React.CSSProperties['textAlign'] | undefined;

      const style: React.CSSProperties = {
        ...(fontColor ? { color: fontColor } : {}),
        ...(typeof fontSize === 'number' ? { fontSize } : {}),
        ...(backgroundColor ? { backgroundColor } : {}),
        ...(textAlign ? { textAlign } : {}),
      };

      return {
        value: formattedValue,
        style,
      };
    }),
  );

  const styles: IChartTableProps['styles'] = {
    root: {
      ...(input.layout?.font?.size ? { fontSize: input.layout.font.size } : {}),
    },
  };

  return {
    headers: normalizeHeaders(
      tableData.header?.values ?? [],
      tableData.header?.font ? tableData.header : input.layout?.template?.data?.table![0].header,
    ),
    rows,
    width: input.layout?.width,
    height: input.layout?.height,
    styles,
  };
};

export const projectPolarToCartesian = (input: PlotlySchema): PlotlySchema => {
  const projection: PlotlySchema = { ...input };
  for (let sindex = 0; sindex < input.data.length; sindex++) {
    const series = input.data[sindex] as Partial<PlotData>;
    series.x = [] as Datum[];
    series.y = [] as Datum[];
    for (let ptindex = 0; ptindex < (series.r?.length ?? 0); ptindex++) {
      if (isInvalidValue(series.theta?.[ptindex]) || isInvalidValue(series.r?.[ptindex])) {
        continue;
      }

      const thetaRad = ((series.theta![ptindex] as number) * Math.PI) / 180;
      const radius = series.r![ptindex] as number;
      series.x.push(radius * Math.cos(thetaRad));
      series.y.push(radius * Math.sin(thetaRad));
    }
    projection.data[sindex] = series;
  }

  return projection;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isPlainObject(obj: any) {
  if (window && window.process && window.process.versions) {
    return Object.prototype.toString.call(obj) === '[object Object]';
  }

  return (
    Object.prototype.toString.call(obj) === '[object Object]' &&
    Object.getPrototypeOf(obj).hasOwnProperty('hasOwnProperty')
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
var arrayAttributes: any[] = [];
// eslint-disable-next-line @typescript-eslint/no-explicit-any
var stack: any[] = [];
// eslint-disable-next-line @typescript-eslint/no-explicit-any
var isArrayStack: any[] = [];
// eslint-disable-next-line @typescript-eslint/no-explicit-any
var baseContainer: any, baseAttrName: any;
/**
 * Interate iteratively through the trace object and find all the array attributes.
 * 1 trace record = 1 series of data
 * @param trace
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function findArrayAttributes(trace: any) {
  // Init basecontainer and baseAttrName
  crawlIntoTrace(baseContainer, 0, '');
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function crawlIntoTrace(container: any, i: number, astrPartial: any) {
  var item = container[stack[i]];
  var newAstrPartial = astrPartial + stack[i];
  if (i === stack.length - 1) {
    if (isArrayOrTypedArray(item)) {
      arrayAttributes.push(baseAttrName + newAstrPartial);
    }
  } else {
    if (isArrayStack[i]) {
      if (Array.isArray(item)) {
        for (var j = 0; j < item.length; j++) {
          if (isPlainObject(item[j])) {
            crawlIntoTrace(item[j], i + 1, newAstrPartial + '[' + j + '].');
          }
        }
      }
    } else if (isPlainObject(item)) {
      crawlIntoTrace(item, i + 1, newAstrPartial + '.');
    }
  }
}

function getLineOptions(line: Partial<ScatterLine> | undefined): ILineChartLineOptions | undefined {
  if (!line) {
    return;
  }

  let lineOptions: ILineChartLineOptions = {};
  if (line.dash) {
    lineOptions = { ...lineOptions, ...dashOptions[line.dash] };
  }

  switch (line.shape) {
    case 'spline':
      const smoothing = typeof line.smoothing === 'number' ? line.smoothing : 1;
      lineOptions.curve = d3CurveCardinal.tension(1 - smoothing / 1.3);
      break;
    case 'hv':
      lineOptions.curve = 'stepAfter';
      break;
    case 'vh':
      lineOptions.curve = 'stepBefore';
      break;
    case 'hvh':
      lineOptions.curve = 'step';
      break;
    default:
      lineOptions.curve = 'linear';
  }

  return Object.keys(lineOptions).length > 0 ? lineOptions : undefined;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isStringArray = (arr: any) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return isArrayOfType(arr, (value: any) => typeof value === 'string' || value === null);
};

// TODO: Use binary search to find the appropriate bin for numeric value.
const findBinIndex = (
  bins: string[][] | Bin<number, number>[],
  value: string | number | null | undefined,
  isString: boolean,
) => {
  if (typeof value === 'undefined' || value === null) {
    return -1;
  }

  return isString
    ? (bins as string[][]).findIndex(bin => bin.includes(value as string))
    : (bins as Bin<number, number>[]).findIndex(
        (bin, index) =>
          (value as number) >= bin.x0! &&
          (index === bins.length - 1 ? (value as number) <= bin.x1! : (value as number) < bin.x1!),
      );
};

const getBinSize = (bin: Bin<number, number>) => {
  return bin.x1! - bin.x0!;
};

const getBinCenter = (bin: Bin<number, number>) => {
  return (bin.x1! + bin.x0!) / 2;
};

// TODO: Add support for date axes
const createBins = (
  data: TypedArray | Datum[] | Datum[][] | undefined,
  binStart?: number | string,
  binEnd?: number | string,
  binSize?: number | string,
) => {
  if (!data || data.length === 0) {
    return [];
  }

  if (isStringArray(data)) {
    const categories = Array.from(new Set(data as string[]));
    const start = typeof binStart === 'number' ? Math.ceil(binStart) : 0;
    const stop = typeof binEnd === 'number' ? Math.floor(binEnd) + 1 : categories.length;
    const step = typeof binSize === 'number' ? binSize : 1;

    return d3Range(start, stop, step).map(i => categories.slice(i, i + step));
  }

  const scale = d3ScaleLinear()
    .domain(d3Extent<number>(data as number[]) as [number, number])
    .nice();
  let [minVal, maxVal] = scale.domain();

  minVal = typeof binStart === 'number' ? binStart : minVal;
  maxVal = typeof binEnd === 'number' ? binEnd : maxVal;

  const binGenerator = d3Bin().domain([minVal, maxVal]);

  if (typeof binSize === 'number' && binSize > 0) {
    const thresholds: number[] = [];
    const precision = Math.max(getPrecision(minVal), getPrecision(binSize));
    let th = precisionRound(minVal, precision);

    while (th < precisionRound(maxVal + binSize, precision)) {
      thresholds.push(th);
      th = precisionRound(th + binSize, precision);
    }

    minVal = thresholds[0];
    maxVal = thresholds[thresholds.length - 1];
    binGenerator.domain([minVal, maxVal]).thresholds(thresholds);

    // When the domain ends at the last threshold (maxVal), d3Bin creates an extra final bin where
    // both x0 and x1 are equal to maxVal and inclusive. The previous bin also has x1 equal to maxVal,
    // but it is exclusive. To maintain consistent bin widths, remove the final bin,
    // making the previous bin the last one, with both x0 and x1 inclusive.
    return binGenerator(data as number[]).slice(0, -1);
  }

  return binGenerator(data as number[]);
};

const calculateHistFunc = (histfunc: PlotData['histfunc'] | undefined, bin: number[]) => {
  switch (histfunc) {
    case 'sum':
      return d3Sum(bin);
    case 'avg':
      return bin.length === 0 ? 0 : d3Sum(bin) / bin.length;
    case 'min':
      return d3Min(bin) ?? 0;
    case 'max':
      return d3Max(bin) ?? 0;
    default:
      return bin.length;
  }
};

const calculateHistNorm = (
  histnorm: PlotData['histnorm'] | undefined,
  value: number,
  total: number,
  dx: number,
  dy: number = 1,
) => {
  switch (histnorm) {
    case 'percent':
      return total === 0 ? 0 : (value / total) * 100;
    case 'probability':
      return total === 0 ? 0 : value / total;
    case 'density':
      return dx * dy === 0 ? 0 : value / (dx * dy);
    case 'probability density':
      return total * dx * dy === 0 ? 0 : value / (total * dx * dy);
    default:
      return value;
  }
};

const getPrecision = (value: number) => {
  return value.toString().split('.')[1]?.length ?? 0;
};

const precisionRound = (value: number, precision: number) => {
  const factor = Math.pow(10, precision);
  return Math.round(value * factor) / factor;
};

const getLegendProps = (data: Data[], layout: Partial<Layout> | undefined) => {
  const legends: string[] = [];
  if (data.length === 1) {
    legends.push(data[0].name || '');
  } else {
    data.forEach((series, index) => {
      legends.push(series.name || `Series ${index + 1}`);
    });
  }

  const hideLegends = data.every((series: Partial<PlotData>) => series.showlegend === false);

  return {
    legends,
    hideLegend:
      layout?.showlegend === false || (layout?.showlegend !== true && legends.length < 2) ? true : hideLegends,
  };
};

export const getNumberAtIndexOrDefault = (data: PlotData['z'] | undefined, index: number) => {
  if (isArrayOrTypedArray(data)) {
    if (typeof data![index] !== 'number' || !isFinite(data![index] as number)) {
      return;
    }

    return data![index] as number;
  }

  return 1;
};

export const getValidXYRanges = (series: Partial<PlotData>) => {
  if (!isArrayOrTypedArray(series.x) || !isArrayOrTypedArray(series.y)) {
    return [];
  }

  const ranges: [number, number][] = [];
  let start = 0;
  let end = 0;
  for (; end < series.x!.length; end++) {
    if (isInvalidValue(series.x![end]) || isInvalidValue(series.y![end])) {
      if (end - start > 0) {
        ranges.push([start, end]);
      }
      start = end + 1;
    }
  }
  if (end - start > 0) {
    ranges.push([start, end]);
  }

  return ranges;
};
