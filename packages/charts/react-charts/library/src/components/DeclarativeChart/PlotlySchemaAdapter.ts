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
import { DonutChartProps } from '../DonutChart/index';
import {
  ChartDataPoint,
  ChartProps,
  HorizontalBarChartWithAxisDataPoint,
  LineChartPoints,
  VerticalStackedChartProps,
  HeatMapChartData,
  HeatMapChartDataPoint,
  GroupedVerticalBarChartData,
  VerticalBarChartDataPoint,
  SankeyChartData,
  LineChartLineOptions,
  GanttChartDataPoint,
} from '../../types/DataPoint';
import { SankeyChartProps } from '../SankeyChart/index';
import { VerticalStackedBarChartProps } from '../VerticalStackedBarChart/index';
import { HorizontalBarChartWithAxisProps } from '../HorizontalBarChartWithAxis/index';
import { LineChartProps } from '../LineChart/index';
import { AreaChartProps } from '../AreaChart/index';
import { HeatMapChartProps } from '../HeatMapChart/index';
import { DataVizPalette, getColorFromToken } from '../../utilities/colors';
import { GaugeChartProps, GaugeChartSegment } from '../GaugeChart/index';
import { GroupedVerticalBarChartProps } from '../GroupedVerticalBarChart/index';
import { VerticalBarChartProps } from '../VerticalBarChart/index';
import { ChartTableProps } from '../ChartTable/index';
import { GanttChartProps } from '../GanttChart/index';
import { SunburstChartProps, SunburstFlatData, SunburstNode } from '../SunburstChart/index';
import {
  DEFAULT_DATE_STRING,
  findNumericMinMaxOfY,
  formatScientificLimitWidth,
  MIN_DONUT_RADIUS,
  calculatePrecision,
  precisionRound,
} from '../../utilities/utilities';
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
  LayoutAxis,
  XAxisName,
  TraceInfo,
  DTickValue,
  AxisType,
} from '@fluentui/chart-utilities';
import {
  isArrayOrTypedArray,
  isDate,
  isDateArray,
  isNumberArray,
  isStringArray,
  isYearArray,
  isInvalidValue,
  formatToLocaleString,
  isNumber,
  isObjectArray,
  getAxisIds,
  getAxisKey,
} from '@fluentui/chart-utilities';
import { curveCardinal as d3CurveCardinal } from 'd3-shape';
import type { ColorwayType } from './PlotlyColorAdapter';
import { getOpacity, extractColor, resolveColor, createColorScale } from './PlotlyColorAdapter';
import { rgb } from 'd3-color';
import { Legend, LegendsProps } from '../Legends/index';
import { ScatterChartProps } from '../ScatterChart/ScatterChart.types';
import { CartesianChartProps } from '../CommonComponents/index';
import { FunnelChartDataPoint, FunnelChartProps } from '../FunnelChart/FunnelChart.types';

export const NON_PLOT_KEY_PREFIX = 'nonplot_';
export const SINGLE_REPEAT = 'repeat(1, 1fr)';

type DomainInterval = {
  start: number;
  end: number;
};

export type AxisProperties = {
  xAnnotation?: string;
  yAnnotation?: string;
  row: number;
  column: number;
  xDomain: DomainInterval;
  yDomain: DomainInterval;
};
export type GridAxisProperties = Record<string, AxisProperties>;

export type GridProperties = {
  templateRows: string;
  templateColumns: string;
  layout: GridAxisProperties;
};

type ScatterChartTypes = 'area' | 'line' | 'scatter';
interface SecondaryYAxisValues {
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

function getTitles(layout: Partial<Layout> | undefined) {
  const titles = {
    chartTitle: typeof layout?.title === 'string' ? layout.title : layout?.title?.text ?? '',
    xAxisTitle: typeof layout?.xaxis?.title === 'string' ? layout?.xaxis?.title : layout?.xaxis?.title?.text ?? '',
    yAxisTitle: typeof layout?.yaxis?.title === 'string' ? layout?.yaxis?.title : layout?.yaxis?.title?.text ?? '',
  };
  return titles;
}

const getXAxisTickFormat = (series: Data, layout: Partial<Layout> | undefined) => {
  const xAxis = getXAxisProperties(series, layout);
  if (xAxis?.tickformat) {
    return {
      tickFormat: xAxis?.tickformat,
    };
  }

  return {};
};

const getYAxisTickFormat = (series: Data, layout: Partial<Layout> | undefined) => {
  const yAxis = getYAxisProperties(series, layout);
  if (yAxis?.tickformat) {
    return {
      yAxisTickFormat: d3Format(yAxis?.tickformat),
    };
  }

  return {};
};

const getYMinMaxValues = (series: Data, layout: Partial<Layout> | undefined) => {
  const range = getYAxisProperties(series, layout)?.range;
  if (range && range.length === 2) {
    return {
      yMinValue: range[0],
      yMaxValue: range[1],
    };
  }
  return {};
};

const getYAxisProperties = (series: Data, layout: Partial<Layout> | undefined): Partial<LayoutAxis> | undefined => {
  return layout?.yaxis;
};

const getXAxisProperties = (series: Data, layout: Partial<Layout> | undefined): Partial<LayoutAxis> | undefined => {
  return layout?.xaxis;
};

const getFormattedCalloutYData = (
  yVal: string | number,
  yAxisFormat: ReturnType<typeof getYAxisTickFormat>,
): string => {
  if (typeof yAxisFormat?.yAxisTickFormat === 'function' && typeof yVal === 'number') {
    return yAxisFormat.yAxisTickFormat(yVal);
  }
  return formatToLocaleString(yVal) as string;
};

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

const usesSecondaryYScale = (series: Partial<PlotData>, layout: Partial<Layout> | undefined): boolean => {
  return series.yaxis === 'y2' && (layout?.yaxis2?.anchor === 'x' || layout?.yaxis2?.side === 'right');
};

const getSecondaryYAxisValues = (
  data: Data[],
  layout: Partial<Layout> | undefined,
  maxAllowedMinY?: number,
  minAllowedMaxY?: number,
): SecondaryYAxisValues => {
  let containsSecondaryYAxis = false;
  let yMinValue: number | undefined;
  let yMaxValue: number | undefined;

  data.forEach((series: Partial<PlotData>) => {
    if (usesSecondaryYScale(series, layout)) {
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

/**
 * Checks if a key should be ignored during normalization
 * @param key The key to check
 * @returns true if the key should be ignored
 */
const shouldIgnoreKey = (key: string): boolean => {
  const lowerKey = key.toLowerCase();
  if (lowerKey.includes('style') || lowerKey === 'style') {
    return true;
  }
  // Use regex to match common CSS property patterns
  // (color, fill, stroke, border, background, font, shadow, outline, etc.)
  const cssKeyRegex = new RegExp(
    '^(color|fill|stroke|border|background|font|shadow|outline|margin|padding|gap|align|justify|display|flex|grid|' +
      'text|line|letter|word|vertical|horizontal|overflow|position|top|right|bottom|left|zindex|z-index|opacity|' +
      'filter|clip|cursor|resize|transition|animation|transform|box|column|row|direction|visibility|' +
      'content|width|height|aspect|image|user|pointer|caret|scroll|%)|(-webkit-|-moz-|-ms-|-o-)',
    'i',
  );
  if (cssKeyRegex.test(lowerKey)) {
    return true;
  }
  return false;
};

/**
 * Flattens a nested object into a single level object with dot notation keys
 * @param obj Object to flatten
 * @param prefix Optional prefix for keys
 * @returns Flattened object
 */
const flattenObject = (obj: Record<string, unknown>, prefix: string = ''): Record<string, unknown> => {
  const flattened: Record<string, unknown> = {};

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const newKey = prefix ? `${prefix}.${key}` : key;
      const value = obj[key];

      if (typeof value === 'object' && value !== null && !Array.isArray(value) && !(value instanceof Date)) {
        // Recursively flatten nested objects
        Object.assign(flattened, flattenObject(value as Record<string, unknown>, newKey));
      } else {
        flattened[newKey] = value;
      }
    }
  }

  return flattened;
};

/**
 * Normalizes an array of objects by flattening nested structures and creating grouped data
 * Uses json_normalize approach with D3 color detection and filtering
 * @param data Array of objects to normalize
 * @returns Object containing traces for grouped vertical bar chart
 */
export const normalizeObjectArrayForGVBC = (
  data: Array<Record<string, unknown>>,
  xLabels?: string[],
): { traces: Array<Record<string, unknown>>; x: string[] } => {
  if (!data || data.length === 0) {
    return { traces: [], x: [] };
  }

  // Use provided xLabels if available, otherwise default to Item 1, Item 2, ...
  const x = xLabels && xLabels.length === data.length ? xLabels : data.map((_, index) => `Item ${index + 1}`);

  // First, flatten all objects and collect all unique keys, excluding style keys
  const flattenedObjects = data.map((item, index) => {
    if (typeof item === 'object' && item !== null) {
      const flattened = flattenObject(item);
      // Only keep keys where the value is numeric (number or numeric string) and not a style key
      const filtered: Record<string, unknown> = {};
      Object.keys(flattened).forEach(key => {
        const value = flattened[key];
        if (!shouldIgnoreKey(key) && (typeof value === 'number' || (typeof value === 'string' && isNumber(value)))) {
          filtered[key] = value;
        }
      });
      return filtered;
    } else if (typeof item === 'number' || (typeof item === 'string' && isNumber(item))) {
      // Only keep primitive numeric values
      return { [x[index] || `item_${index}`]: item };
    } else {
      // Non-numeric primitive, ignore by returning empty object
      return {};
    }
  });

  // Collect all unique keys across all objects
  const allKeys = new Set<string>();
  flattenedObjects.forEach(obj => {
    Object.keys(obj).forEach(key => allKeys.add(key));
  });

  // Create traces for each key (property)
  const traces: Array<Record<string, unknown>> = [];

  allKeys.forEach(key => {
    const yValues: number[] = [];
    let hasValidData = false;
    let isNumericData = false;

    flattenedObjects.forEach((obj, index) => {
      const value = obj[key];
      if (typeof value === 'number') {
        yValues.push(value);
        hasValidData = true;
        isNumericData = true;
      } else if (typeof value === 'string' && isNumber(value)) {
        yValues.push(parseFloat(value));
        hasValidData = true;
        isNumericData = true;
      }
    });

    // Only create trace if we have valid numeric data
    if (hasValidData && isNumericData) {
      const trace: Record<string, unknown> = {
        type: 'bar',
        name: key,
        x,
        y: yValues,
      };

      traces.push(trace);
    }
  });

  return { traces, x };
};

export const transformPlotlyJsonToDonutProps = (
  input: PlotlySchema,
  isMultiPlot: boolean,
  colorMap: React.MutableRefObject<Map<string, string>>,
  colorwayType: ColorwayType,
  isDarkTheme?: boolean,
): DonutChartProps => {
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
  const mapLegendToDataPoint: Record<string, ChartDataPoint> = {};
  if (colors) {
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
  } else {
    // Sort labels by value descending before mapping
    if (firstData.labels && firstData.values) {
      const labelValuePairs = firstData.labels.map((label, index) => ({
        label,
        value: getNumberAtIndexOrDefault(firstData.values, index),
        index,
      }));
      // Filter out invalid values
      const validPairs = labelValuePairs.filter(pair => !isInvalidValue(pair.value));
      // Sort descending by value
      validPairs.sort((a, b) => (b.value as number) - (a.value as number));
      validPairs.forEach((pair, sortedIdx) => {
        const legend = `${pair.label}`;
        const color: string = resolveColor(colors, sortedIdx, legend, colorMap, isDarkTheme);
        if (!mapLegendToDataPoint[legend]) {
          mapLegendToDataPoint[legend] = {
            legend,
            data: pair.value,
            color,
          };
        } else {
          mapLegendToDataPoint[legend].data! += pair.value as number;
        }
      });
    }
  }

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
    hideLegend: isMultiPlot || input.layout?.showlegend === false,
    width: input.layout?.width,
    height,
    innerRadius,
    hideLabels,
    showLabelsInPercent: firstData.textinfo ? ['percent', 'label+percent'].includes(firstData.textinfo) : true,
    roundCorners: true,
  };
};

export const transformPlotlyJsonToVSBCProps = (
  input: PlotlySchema,
  isMultiPlot: boolean,
  colorMap: React.MutableRefObject<Map<string, string>>,
  colorwayType: ColorwayType,
  isDarkTheme?: boolean,
  fallbackVSBC?: boolean,
): VerticalStackedBarChartProps => {
  const mapXToDataPoints: { [key: string]: VerticalStackedChartProps } = {};
  let yMaxValue = 0;
  const secondaryYAxisValues = getSecondaryYAxisValues(input.data, input.layout);
  const { legends, hideLegend } = getLegendProps(input.data, input.layout, isMultiPlot);
  let colorScale: ((value: number) => string) | undefined = undefined;
  const yAxisTickFormat = getYAxisTickFormat(input.data[0], input.layout);
  let yMinValue = 0;
  input.data.forEach((series: Partial<PlotData>, index1: number) => {
    colorScale = createColorScale(input.layout, series, colorScale);
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
        const opacity = getOpacity(series, index2);
        const yVal: number | string = rangeYValues[index2] as number | string;
        const yAxisCalloutData = getFormattedCalloutYData(yVal, yAxisTickFormat);
        if (series.type === 'bar') {
          mapXToDataPoints[x].chartData.push({
            legend,
            data: yVal,
            color: rgb(color).copy({ opacity }).formatHex8() ?? color,
            yAxisCalloutData,
          });
          if (typeof yVal === 'number') {
            yMaxValue = Math.max(yMaxValue, yVal);
          }
        } else if (series.type === 'scatter' || !!fallbackVSBC) {
          const lineColor = resolveColor(extractedLineColors, index1, legend, colorMap, isDarkTheme);
          const lineOptions = !series.mode?.includes('text') ? getLineOptions(series.line) : undefined;
          const legendShape = getLegendShape(series);
          mapXToDataPoints[x].lineData!.push({
            legend: legend + (validXYRanges.length > 1 ? `.${rangeIdx + 1}` : ''),
            legendShape,
            y: yVal,
            color: rgb(lineColor).copy({ opacity }).formatHex8() ?? color,
            lineOptions: {
              ...(lineOptions ?? {}),
              mode: series.mode,
            },
            useSecondaryYScale: usesSecondaryYScale(series, input.layout),
            yAxisCalloutData,
          });
          if (!usesSecondaryYScale(series, input.layout) && typeof yVal === 'number') {
            yMaxValue = Math.max(yMaxValue, yVal);
            yMinValue = Math.min(yMinValue, yVal);
          }
        }
        yMaxValue = Math.max(yMaxValue, yVal as number);
      });
    });
  });

  const vsbcData = Object.values(mapXToDataPoints);

  return {
    data: vsbcData,
    width: input.layout?.width,
    height: input.layout?.height ?? 350,
    barWidth: 'auto',
    yMaxValue,
    yMinValue,
    mode: 'plotly',
    ...secondaryYAxisValues,
    wrapXAxisLables: typeof vsbcData[0]?.xAxisPoint === 'string',
    hideTickOverlap: true,
    barGapMax: 2,
    hideLegend,
    roundCorners: true,
    showYAxisLables: true,
    noOfCharsToTruncate: 20,
    showYAxisLablesTooltip: true,
    ...getTitles(input.layout),
    ...getXAxisTickFormat(input.data[0], input.layout),
    ...yAxisTickFormat,
    ...getAxisCategoryOrderProps(input.data, input.layout),
    ...getBarProps(input.data, input.layout),
    ...getYMinMaxValues(input.data[0], input.layout),
    ...getAxisTickProps(input.data, input.layout),
  };
};

export const transformPlotlyJsonToGVBCProps = (
  input: PlotlySchema,
  isMultiPlot: boolean,
  colorMap: React.MutableRefObject<Map<string, string>>,
  colorwayType: ColorwayType,
  isDarkTheme?: boolean,
): GroupedVerticalBarChartProps => {
  // Handle object arrays in y values by normalizing the data first
  let processedInput = { ...input };

  // Check if any bar traces have object arrays as y values
  const hasObjectArrayData = input.data.some(
    (series: Partial<PlotData>) => series.type === 'bar' && isObjectArray(series.y),
  );

  if (hasObjectArrayData) {
    // Process each trace that has object array y values
    const processedData = input.data
      .map((series: Partial<PlotData>, index: number) => {
        if (series.type === 'bar' && isObjectArray(series.y)) {
          // Normalize the object array to create multiple traces for GVBC
          const { traces } = normalizeObjectArrayForGVBC(
            series.y as unknown as Array<Record<string, unknown>>,
            Array.isArray(series.x) ? (series.x as string[]) : undefined,
          );

          // Return all the new traces, each representing a property from the objects
          return traces.map((trace: Record<string, unknown>) => ({
            ...trace,
            // Copy other properties from the original series if needed
            marker: series.marker,
          }));
        }
        return [series];
      })
      .flat();

    processedInput = {
      ...input,
      data: processedData,
    };
  }
  const mapXToDataPoints: Record<string, GroupedVerticalBarChartData> = {};
  const secondaryYAxisValues = getSecondaryYAxisValues(processedInput.data, processedInput.layout, 0, 0);
  const { legends, hideLegend } = getLegendProps(processedInput.data, processedInput.layout, isMultiPlot);

  let colorScale: ((value: number) => string) | undefined = undefined;
  const yAxisTickFormat = getYAxisTickFormat(processedInput.data[0], processedInput.layout);
  processedInput.data.forEach((series: Partial<PlotData>, index1: number) => {
    colorScale = createColorScale(processedInput.layout, series, colorScale);
    // extract colors for each series only once
    const extractedColors = extractColor(
      processedInput.layout?.template?.layout?.colorway,
      colorwayType,
      series.marker?.color,
      colorMap,
      isDarkTheme,
    ) as string[] | string | undefined;
    (series.x as Datum[])?.forEach((x: string | number, index2: number) => {
      if (isInvalidValue(x) || isInvalidValue(series.y?.[index2])) {
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
                ? ((series.marker?.color as Color[])?.[index2 % (series.marker?.color as Color[]).length] as number)
                : 0,
            )
          : resolveColor(extractedColors, index2, legend, colorMap, isDarkTheme);
        const opacity = getOpacity(series, index2);

        const yVal: number = series.y![index2] as number;

        mapXToDataPoints[x].series.push({
          key: legend,
          data: yVal,
          xAxisCalloutData: x as string,
          color: rgb(color).copy({ opacity }).formatHex8() ?? color,
          legend,
          useSecondaryYScale: usesSecondaryYScale(series, processedInput.layout),
          yAxisCalloutData: getFormattedCalloutYData(yVal, yAxisTickFormat),
        });
      }
    });
  });

  const gvbcData = Object.values(mapXToDataPoints);

  return {
    data: gvbcData,
    width: processedInput.layout?.width,
    height: processedInput.layout?.height ?? 350,
    barWidth: 'auto',
    mode: 'plotly',
    ...secondaryYAxisValues,
    hideTickOverlap: true,
    wrapXAxisLables: typeof gvbcData[0]?.name === 'string',
    hideLegend,
    roundCorners: true,
    ...getTitles(processedInput.layout),
    ...getAxisCategoryOrderProps(processedInput.data, processedInput.layout),
    ...getYMinMaxValues(processedInput.data[0], processedInput.layout),
    ...getXAxisTickFormat(processedInput.data[0], processedInput.layout),
    ...yAxisTickFormat,
    ...getBarProps(processedInput.data, processedInput.layout),
    ...getAxisTickProps(processedInput.data, processedInput.layout),
  };
};

export const transformPlotlyJsonToVBCProps = (
  input: PlotlySchema,
  isMultiPlot: boolean,
  colorMap: React.MutableRefObject<Map<string, string>>,
  colorwayType: ColorwayType,
  isDarkTheme?: boolean,
): VerticalBarChartProps => {
  const vbcData: VerticalBarChartDataPoint[] = [];
  const { legends, hideLegend } = getLegendProps(input.data, input.layout, isMultiPlot);
  let colorScale: ((value: number) => string) | undefined = undefined;

  input.data.forEach((series: Partial<PlotData>, seriesIdx: number) => {
    if (!series.x) {
      return;
    }

    colorScale = createColorScale(input.layout, series, colorScale);

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
      const opacity = getOpacity(series, index);
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
        color: rgb(color).copy({ opacity }).formatHex8() ?? color,
        ...(isXString
          ? {}
          : { xAxisCalloutData: `[${(bin as Bin<number, number>).x0} - ${(bin as Bin<number, number>).x1})` }),
      });
    });
  });

  return {
    data: vbcData,
    width: input.layout?.width,
    height: input.layout?.height ?? 350,
    mode: 'histogram',
    hideTickOverlap: true,
    wrapXAxisLables: typeof vbcData[0]?.x === 'string',
    maxBarWidth: 50,
    hideLegend,
    roundCorners: true,
    ...getTitles(input.layout),
    ...getYMinMaxValues(input.data[0], input.layout),
    ...getAxisCategoryOrderProps(input.data, input.layout),
  };
};

export const transformPlotlyJsonToAreaChartProps = (
  input: PlotlySchema,
  isMultiPlot: boolean,
  colorMap: React.MutableRefObject<Map<string, string>>,
  colorwayType: ColorwayType,
  isDarkTheme?: boolean,
): AreaChartProps => {
  return transformPlotlyJsonToScatterTraceProps(
    input,
    isMultiPlot,
    'area',
    colorMap,
    colorwayType,
    isDarkTheme,
  ) as AreaChartProps;
};

export const transformPlotlyJsonToLineChartProps = (
  input: PlotlySchema,
  isMultiPlot: boolean,
  colorMap: React.MutableRefObject<Map<string, string>>,
  colorwayType: ColorwayType,
  isDarkTheme?: boolean,
): LineChartProps => {
  return transformPlotlyJsonToScatterTraceProps(
    input,
    isMultiPlot,
    'line',
    colorMap,
    colorwayType,
    isDarkTheme,
  ) as LineChartProps;
};

export const transformPlotlyJsonToScatterChartProps = (
  input: PlotlySchema,
  isMultiPlot: boolean,
  colorMap: React.MutableRefObject<Map<string, string>>,
  colorwayType: ColorwayType,
  isDarkTheme?: boolean,
): LineChartProps => {
  return transformPlotlyJsonToScatterTraceProps(
    input,
    isMultiPlot,
    'scatter',
    colorMap,
    colorwayType,
    isDarkTheme,
  ) as ScatterChartProps;
};

const transformPlotlyJsonToScatterTraceProps = (
  input: PlotlySchema,
  isMultiPlot: boolean,
  chartType: ScatterChartTypes,
  colorMap: React.MutableRefObject<Map<string, string>>,
  colorwayType: ColorwayType,
  isDarkTheme?: boolean,
): LineChartProps | AreaChartProps | ScatterChartProps => {
  const isScatterMarkers = [
    'text',
    'markers',
    'text+markers',
    'markers+text',
    'lines+markers',
    'markers+line',
    'text+lines+markers',
    'lines+markers+text',
  ].includes((input.data[0] as PlotData)?.mode);
  const isAreaChart = chartType === 'area';
  const isScatterChart = chartType === 'scatter';
  const secondaryYAxisValues = getSecondaryYAxisValues(
    input.data,
    input.layout,
    isAreaChart ? 0 : undefined,
    isAreaChart ? 0 : undefined,
  );
  let mode: string = 'tonexty';
  const { legends, hideLegend } = getLegendProps(input.data, input.layout, isMultiPlot);
  const yAxisTickFormat = getYAxisTickFormat(input.data[0], input.layout);
  const chartData: LineChartPoints[] = input.data
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
      const isXYearCategory = isYearArray(series.x); // Consider year as categorical not numeric continuous axis
      const legend: string = legends[index];
      // resolve color for each legend's lines from the extracted colors
      const seriesColor = resolveColor(extractedColors, index, legend, colorMap, isDarkTheme);
      const seriesOpacity = getOpacity(series, index);
      mode = series.fill === 'tozeroy' ? 'tozeroy' : 'tonexty';
      // if mode contains 'text', we prioritize showing the text over curving the line
      const lineOptions =
        !series.mode?.includes('text') && series.type !== 'scatterpolar' ? getLineOptions(series.line) : undefined;
      const legendShape = getLegendShape(series);

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
            yAxisCalloutData: getFormattedCalloutYData(rangeYValues[i] as number, yAxisTickFormat),
          })),
          color: rgb(seriesColor).copy({ opacity: seriesOpacity }).formatHex8() ?? seriesColor,
          lineOptions: {
            ...(lineOptions ?? {}),
            mode: series.type !== 'scatterpolar' ? series.mode : 'scatterpolar',
            // originXOffset is not typed on Layout, but may be present in input.layout as a part of projection of
            // scatter polar coordingates to cartesian coordinates
            ...(series.type === 'scatterpolar'
              ? {
                  originXOffset: (input.layout as { __polarOriginX?: number } | undefined)?.__polarOriginX,
                  direction: input.layout?.polar?.angularaxis?.direction,
                  rotation: input.layout?.polar?.angularaxis?.rotation,
                  axisLabel: (series as { __axisLabel: string[] }).__axisLabel
                    ? (series as { __axisLabel: string[] }).__axisLabel
                    : {},
                }
              : {}),
          },
          useSecondaryYScale: usesSecondaryYScale(series, input.layout),
        } as LineChartPoints;
      });
    })
    .flat();

  const yMinMax = getYMinMaxValues(input.data[0], input.layout);
  if (yMinMax.yMinValue === undefined && yMinMax.yMaxValue === undefined) {
    const yMinMaxValues = findNumericMinMaxOfY(chartData);
    yMinMax.yMinValue = yMinMaxValues.startValue;
    yMinMax.yMaxValue = yMinMaxValues.endValue;
  }
  const numDataPoints = chartData.reduce((total, lineChartPoints) => total + lineChartPoints.data.length, 0);

  const chartProps: ChartProps = {
    lineChartData: chartData,
  };

  const scatterChartProps: ChartProps = {
    scatterChartData: chartData,
  };

  const commonProps = {
    supportNegativeData: true,
    ...secondaryYAxisValues,
    width: input.layout?.width,
    height: input.layout?.height ?? 350,
    hideTickOverlap: true,
    hideLegend,
    useUTC: false,
    optimizeLargeData: numDataPoints > 1000,
    ...getTitles(input.layout),
    ...getXAxisTickFormat(input.data[0], input.layout),
    ...yAxisTickFormat,
    ...getAxisScaleTypeProps(input.data, input.layout),
    ...getAxisTickProps(input.data, input.layout),
  };

  if (isAreaChart) {
    return {
      data: chartProps,
      mode,
      ...commonProps,
    } as AreaChartProps;
  } else {
    return {
      data: isScatterChart ? scatterChartProps : chartProps,
      roundedTicks: true,
      ...commonProps,
      ...yMinMax,
      ...(isScatterChart
        ? {
            showYAxisLablesTooltip: true,
            ...getAxisCategoryOrderProps(input.data, input.layout),
          }
        : {}),
    } as LineChartProps;
  }
};

export const transformPlotlyJsonToHorizontalBarWithAxisProps = (
  input: PlotlySchema,
  isMultiPlot: boolean,
  colorMap: React.MutableRefObject<Map<string, string>>,
  colorwayType: ColorwayType,
  isDarkTheme?: boolean,
): HorizontalBarChartWithAxisProps => {
  const { legends, hideLegend } = getLegendProps(input.data, input.layout, isMultiPlot);
  let colorScale: ((value: number) => string) | undefined = undefined;
  const chartData: HorizontalBarChartWithAxisDataPoint[] = input.data
    .map((series: Partial<PlotData>, index: number) => {
      colorScale = createColorScale(input.layout, series, colorScale);
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
          const opacity = getOpacity(series, i);

          return {
            x: series.x![i],
            y: yValue,
            legend,
            color: rgb(color).copy({ opacity }).formatHex8() ?? color,
          } as HorizontalBarChartWithAxisDataPoint;
        })
        .filter(point => point !== null) as HorizontalBarChartWithAxisDataPoint[];
    })
    .flat();

  const chartHeight: number = input.layout?.height ?? 450;
  const margin: number = input.layout?.margin?.l ?? 0;
  const padding: number = input.layout?.margin?.pad ?? 0;
  const availableHeight: number = chartHeight - margin - padding;
  const numberOfRows = new Set(chartData.map(d => d.y)).size || 1;
  const scalingFactor = 0.01;
  const gapFactor = 1 / (1 + scalingFactor * numberOfRows);
  const barHeight = availableHeight / (numberOfRows * (1 + gapFactor));

  return {
    data: chartData,
    secondaryYAxistitle:
      typeof input.layout?.yaxis2?.title === 'string'
        ? input.layout?.yaxis2?.title
        : input.layout?.yaxis2?.title?.text || '',
    barHeight,
    showYAxisLables: true,
    height: chartHeight,
    width: input.layout?.width,
    hideTickOverlap: true,
    noOfCharsToTruncate: 20,
    showYAxisLablesTooltip: true,
    hideLegend,
    roundCorners: true,
    ...getTitles(input.layout),
    ...getAxisCategoryOrderProps(input.data, input.layout),
    ...getBarProps(input.data, input.layout, true),
    ...getAxisTickProps(input.data, input.layout),
  };
};

export const transformPlotlyJsonToGanttChartProps = (
  input: PlotlySchema,
  isMultiPlot: boolean,
  colorMap: React.MutableRefObject<Map<string, string>>,
  colorwayType: ColorwayType,
  isDarkTheme?: boolean,
): GanttChartProps => {
  const { legends, hideLegend } = getLegendProps(input.data, input.layout, isMultiPlot);
  let colorScale: ((value: number) => string) | undefined = undefined;
  const chartData: GanttChartDataPoint[] = input.data
    .map((series: Partial<PlotData>, index: number) => {
      colorScale = createColorScale(input.layout, series, colorScale);

      // extract colors for each series only once
      const extractedColors = extractColor(
        input.layout?.template?.layout?.colorway,
        colorwayType,
        series.marker?.color,
        colorMap,
        isDarkTheme,
      ) as string[] | string | undefined;
      const legend = legends[index];
      const isXDate = input.layout?.xaxis?.type === 'date' || isDateArray(series.x);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const convertXValueToNumber = (value: any) => {
        return isInvalidValue(value) ? 0 : isXDate ? +parseLocalDate(value) : +value;
      };

      return (series.y as Datum[])
        .map((yVal, i: number) => {
          if (isInvalidValue(yVal)) {
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
          const opacity = getOpacity(series, i);
          const base = convertXValueToNumber(series.base?.[i]);
          const xVal = convertXValueToNumber(series.x?.[i]);

          return {
            x: {
              start: isXDate ? new Date(base) : base,
              end: isXDate ? new Date(base + xVal) : base + xVal,
            },
            y: yVal,
            legend,
            color: rgb(color).copy({ opacity }).formatHex8() ?? color,
          } as GanttChartDataPoint;
        })
        .filter(point => point !== null) as GanttChartDataPoint[];
    })
    .flat();

  return {
    data: chartData,
    showYAxisLables: true,
    height: input.layout?.height ?? 350,
    width: input.layout?.width,
    hideTickOverlap: true,
    hideLegend,
    noOfCharsToTruncate: 20,
    showYAxisLablesTooltip: true,
    roundCorners: true,
    useUTC: false,
    ...getTitles(input.layout),
    ...getAxisCategoryOrderProps(input.data, input.layout),
    ...getBarProps(input.data, input.layout, true),
    ...getAxisTickProps(input.data, input.layout),
  };
};

export const transformPlotlyJsonToHeatmapProps = (
  input: PlotlySchema,
  isMultiPlot: boolean,
  colorMap: React.MutableRefObject<Map<string, string>>,
  colorwayType: ColorwayType,
  isDarkTheme?: boolean,
): HeatMapChartProps => {
  const firstData = input.data[0] as Partial<PlotData>;
  const heatmapDataPoints: HeatMapChartDataPoint[] = [];
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

  const heatmapData: HeatMapChartData = {
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

  return {
    data: [heatmapData],
    domainValuesForColorScale,
    rangeValuesForColorScale,
    hideLegend: true,
    showYAxisLables: true,
    sortOrder: 'none',
    width: input.layout?.width,
    height: input.layout?.height ?? 350,
    hideTickOverlap: true,
    noOfCharsToTruncate: 20,
    showYAxisLablesTooltip: true,
    wrapXAxisLables: true,
    ...getTitles(input.layout),
    ...getAxisCategoryOrderProps([firstData], input.layout),
    ...getAxisTickProps(input.data, input.layout),
  };
};

export const transformPlotlyJsonToSankeyProps = (
  input: PlotlySchema,
  isMultiPlot: boolean,
  colorMap: React.MutableRefObject<Map<string, string>>,
  colorwayType: ColorwayType,
  isDarkTheme?: boolean,
): SankeyChartProps => {
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
  } as SankeyChartData;

  // const styles: SankeyChartProps['styles'] = {
  //   root: {
  //     ...(input.layout?.font?.size ? { fontSize: input.layout.font?.size } : {}),
  //   },
  // };

  const { chartTitle } = getTitles(input.layout);

  return {
    data: {
      chartTitle,
      SankeyChartData: sankeyChartData,
    },
    width: input.layout?.width,
    height: input.layout?.height ?? 468,
    // TODO
    // styles,
  };
};

export const transformPlotlyJsonToGaugeProps = (
  input: PlotlySchema,
  isMultiPlot: boolean,
  colorMap: React.MutableRefObject<Map<string, string>>,
  colorwayType: ColorwayType,
  isDarkTheme?: boolean,
): GaugeChartProps => {
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
      firstData.gauge.steps.map((step: any, index: number): GaugeChartSegment => {
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

  const styles = {
    sublabel: sublabelColor,
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
    // TODO
    // styles,
    variant: firstData.gauge?.steps?.length ? 'multiple-segments' : 'single-segment',
    styles,
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

function resolveCellStyle<T>(raw: T | T[] | T[][] | undefined, rowIndex: number, colIndex: number): T | undefined {
  if (Array.isArray(raw)) {
    const rowEntry = raw[colIndex] ?? raw[0];
    if (Array.isArray(rowEntry)) {
      return rowEntry[rowIndex] ?? rowEntry[0];
    }
    return rowEntry;
  }
  return raw;
}

export const transformPlotlyJsonToChartTableProps = (
  input: PlotlySchema,
  isMultiPlot: boolean,
  colorMap: React.MutableRefObject<Map<string, string>>,
  colorwayType: ColorwayType,
  isDarkTheme?: boolean,
): ChartTableProps => {
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
      //headers are at first row only
      const rowIndex = 0;
      const fontColor = resolveCellStyle(header?.font?.color, rowIndex, colIndex) as string | undefined;
      const fontSize = resolveCellStyle(header?.font?.size, rowIndex, colIndex) as number | undefined;
      const backgroundColor = resolveCellStyle(header?.fill?.color, rowIndex, colIndex) as string | undefined;
      const textAlign = resolveCellStyle(header?.align, rowIndex, colIndex) as
        | React.CSSProperties['textAlign']
        | undefined;

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
  const cells =
    tableData.cells && Object.keys(tableData.cells).length > 0
      ? tableData.cells
      : input.layout?.template?.data?.table?.[0]?.cells;
  const rows = columns[0].map((_, rowIndex: number) =>
    columns.map((col, colIndex) => {
      const cellValue = col[rowIndex];
      const cleanValue = typeof cellValue === 'string' ? cleanText(cellValue) : cellValue;

      const formattedValue =
        typeof cleanValue === 'string' || typeof cleanValue === 'number'
          ? formatValue(cleanValue, colIndex, cells)
          : cleanValue;

      const fontColor = resolveCellStyle(cells?.font?.color, rowIndex, colIndex) as string | undefined;
      const fontSize = resolveCellStyle(cells?.font?.size, rowIndex, colIndex) as number | undefined;
      const backgroundColor = resolveCellStyle(cells?.fill?.color, rowIndex, colIndex) as string | undefined;
      const textAlign = resolveCellStyle(cells?.align, rowIndex, colIndex) as
        | React.CSSProperties['textAlign']
        | undefined;

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

  const styles: ChartTableProps['styles'] = {
    root: {
      ...(input.layout?.font?.size ? { fontSize: input.layout.font.size } : {}),
    },
  };

  return {
    headers: normalizeHeaders(
      tableData.header?.values ?? [],
      tableData.header && Object.keys(tableData.header).length > 0
        ? tableData.header
        : input.layout?.template?.data?.table![0].header,
    ),
    rows,
    width: input.layout?.width,
    height: input.layout?.height,
    styles,
  };
};

function getCategoriesAndValues(series: Partial<PlotData>): {
  categories: (string | number)[];
  values: (string | number)[];
} {
  const orientation = series.orientation || 'h';
  const y = series.labels ?? series.y ?? series.stage;
  const x = series.values ?? series.x ?? series.value;
  const xIsString = isStringArray(x as Datum[] | Datum[][] | TypedArray | undefined);
  const yIsString = isStringArray(y as Datum[] | Datum[][] | TypedArray | undefined);
  const xIsNumber = isNumberArray(x as Datum[] | Datum[][] | TypedArray | undefined);
  const yIsNumber = isNumberArray(y as Datum[] | Datum[][] | TypedArray | undefined);

  // Helper to ensure array of (string | number)
  const toArray = (arr: unknown): (string | number)[] => {
    if (Array.isArray(arr)) {
      return arr as (string | number)[];
    }
    if (typeof arr === 'string' || typeof arr === 'number') {
      return [arr];
    }
    return [];
  };

  if (orientation === 'h') {
    if (yIsString && xIsNumber) {
      return { categories: toArray(y), values: toArray(x) };
    } else if (xIsString && yIsNumber) {
      return { categories: toArray(x), values: toArray(y) };
    } else {
      return { categories: yIsString ? toArray(y) : toArray(x), values: yIsString ? toArray(x) : toArray(y) };
    }
  } else {
    if (xIsString && yIsNumber) {
      return { categories: toArray(x), values: toArray(y) };
    } else if (yIsString && xIsNumber) {
      return { categories: toArray(y), values: toArray(x) };
    } else {
      return { categories: xIsString ? toArray(x) : toArray(y), values: xIsString ? toArray(y) : toArray(x) };
    }
  }
}

export const transformPlotlyJsonToFunnelChartProps = (
  input: PlotlySchema,
  isMultiPlot: boolean,
  colorMap: React.MutableRefObject<Map<string, string>>,
  colorwayType: ColorwayType,
  isDarkTheme?: boolean,
): FunnelChartProps => {
  const funnelData: FunnelChartDataPoint[] = [];

  // Determine if data is stacked based on multiple series with multiple values per series
  const isStacked =
    input.data.length > 1 &&
    input.data.every((series: Partial<PlotData>) => {
      const values = series.values ?? series.x ?? series.value;
      const labels = series.labels ?? series.y ?? series.stage;
      return Array.isArray(labels) && Array.isArray(values) && values.length > 1 && labels.length > 1;
    });

  if (isStacked) {
    // Assign a color per series/category and use it for all subValues of that category
    const seriesColors: Record<string, string> = {};
    input.data.forEach((series: Partial<PlotData>, seriesIdx: number) => {
      const category = series.name || `Category ${seriesIdx + 1}`;
      // Use the same color for this category across all stages
      const extractedColors = extractColor(
        input.layout?.template?.layout?.colorway,
        colorwayType,
        series.marker?.colors ?? series.marker?.color,
        colorMap,
        isDarkTheme,
      );
      // Always use the first color for the series/category
      const color = resolveColor(extractedColors, 0, category, colorMap, isDarkTheme);
      seriesColors[category] = color;

      const labels = series.labels ?? series.y ?? series.stage;
      const values = series.values ?? series.x ?? series.value;

      if (!isArrayOrTypedArray(labels) || !isArrayOrTypedArray(values)) {
        return;
      }
      if (labels && isArrayOrTypedArray(labels) && labels.length > 0) {
        (labels as (string | number)[]).forEach((label: string, i: number) => {
          const stageIndex = funnelData.findIndex(stage => stage.stage === label);
          const valueNum = Number((values as (string | number)[])[i]);
          if (isNaN(valueNum)) {
            return;
          }
          if (stageIndex === -1) {
            funnelData.push({
              stage: label,
              subValues: [{ category, value: valueNum, color }],
            });
          } else {
            funnelData[stageIndex].subValues!.push({ category, value: valueNum, color });
          }
        });
      }
    });
  } else {
    // Non-stacked data handling (multiple series with single-value arrays)
    input.data.forEach((series: Partial<PlotData>, seriesIdx: number) => {
      const { categories, values } = getCategoriesAndValues(series);

      if (!isArrayOrTypedArray(categories) || !isArrayOrTypedArray(values)) {
        return;
      }

      const extractedColors = extractColor(
        input.layout?.template?.layout?.colorway,
        colorwayType,
        series.marker?.colors ?? series.marker?.color,
        colorMap,
        isDarkTheme,
      );

      categories.forEach((label: string, i: number) => {
        const color = resolveColor(extractedColors, i, label, colorMap, isDarkTheme);
        const valueNum = Number(values[i]);
        if (isNaN(valueNum)) {
          return;
        }
        funnelData.push({
          stage: label,
          value: valueNum,
          color,
        });
      });
    });
  }

  return {
    data: funnelData,
    width: input.layout?.width,
    height: input.layout?.height,
    orientation: (input.data[0] as Partial<PlotData>)?.orientation === 'v' ? 'horizontal' : 'vertical',
    hideLegend: isMultiPlot || input.layout?.showlegend === false,
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
    // Return midpoint color of the provided colorscale instead of a hard-coded fallback
    const mid = 0.5;
    for (let i = 0; i < colorscale.length - 1; i++) {
      const [pos1, c1] = colorscale[i];
      const [pos2, c2] = colorscale[i + 1];
      if (mid >= pos1 && mid <= pos2) {
        const ratio = pos2 > pos1 ? (mid - pos1) / (pos2 - pos1) : 0;
        return interpolateColor(c1, c2, ratio);
      }
    }
    return colorscale[Math.floor(colorscale.length / 2)][1];
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

// Function to parse any CSS color (named, hex, rgb/rgba, hsl/hsla) using d3-color
function parseRgbColor(color: string): { r: number; g: number; b: number } | null {
  try {
    const c = rgb(color);
    if (!c || Number.isNaN(c.r) || Number.isNaN(c.g) || Number.isNaN(c.b)) {
      return null;
    }
    return { r: Math.round(c.r), g: Math.round(c.g), b: Math.round(c.b) };
  } catch {
    return null;
  }
}

export const transformPlotlyJsonToSunburstProps = (
  input: PlotlySchema,
  isMultiPlot: boolean,
  colorMap: React.MutableRefObject<Map<string, string>>,
  colorwayType: ColorwayType,
  isDarkTheme?: boolean,
): SunburstChartProps => {
  console.log('[PlotlySchemaAdapter] Raw input data:', JSON.stringify(input, null, 2));

  const first = input.data[0] as Partial<PlotData> & {
    ids?: string[];
    labels?: string[];
    parents?: Array<string | null>;
    values?: number[] | { dtype: string; bdata: string; shape?: string };
    branchvalues?: 'total' | 'remainder';
    marker?: {
      colors?: (string | number)[] | { dtype: string; bdata: string; shape?: string };
      coloraxis?: string;
      pattern?: {
        shape?: string[] | { dtype: string; bdata: string; shape?: string };
      };
    };
    customdata?: Array<Array<number | string>> | { dtype: string; bdata: string; shape?: string };
  };

  console.log('[PlotlySchemaAdapter] First data object:', first);
  console.log('[PlotlySchemaAdapter] Marker object:', first.marker);
  console.log('[PlotlySchemaAdapter] Pattern object:', first.marker?.pattern);
  console.log('[PlotlySchemaAdapter] Pattern.shape array:', first.marker?.pattern?.shape);

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
      const customRows = first.customdata as any[];
      extractedValues = customRows.map((row: any) => {
        if (Array.isArray(row) && row.length > 0 && typeof row[0] === 'number') {
          return row[0];
        }
        return 0;
      });
    } else if (typeof first.customdata === 'object' && 'bdata' in first.customdata) {
      extractedValues = decodeBinaryData(first.customdata);
    }
  }

  // Extract pattern data
  let patternShapes: string[] = [];
  if (first.marker?.pattern?.shape) {
    if (Array.isArray(first.marker.pattern.shape)) {
      patternShapes = first.marker.pattern.shape;
    } else if (typeof first.marker.pattern.shape === 'object' && 'bdata' in first.marker.pattern.shape) {
      // Handle binary encoded pattern shapes if needed - convert numbers to strings
      const decodedPatterns = decodeBinaryData(first.marker.pattern.shape);
      patternShapes = decodedPatterns.map(p => String(p));
    }
  }

  // Fallback: if hierarchy arrays are effectively missing but we have rich customdata, derive a flat 1-level tree.
  // This addresses cases where the incoming schema only contains one label/id (or none) so nothing renders.
  // We treat the second column of customdata as a category key and aggregate the first column (numeric) as value.
  if (
    (first.ids?.length ?? 0) <= 1 &&
    (first.labels?.length ?? 0) <= 1 &&
    (first.parents?.length ?? 0) <= 1 &&
    first.customdata &&
    Array.isArray(first.customdata)
  ) {
    try {
      const categoryTotals = new Map<string, number>();
      (first.customdata as any[]).forEach(row => {
        if (Array.isArray(row) && row.length >= 2) {
          const val = typeof row[0] === 'number' && isFinite(row[0]) ? row[0] : undefined;
          const cat = typeof row[1] === 'string' ? row[1] : undefined;
          if (val !== undefined && cat) {
            categoryTotals.set(cat, (categoryTotals.get(cat) || 0) + val);
          }
        }
      });
      if (categoryTotals.size > 1) {
        // Only apply fallback if we actually derive multiple categories.
        const derivedIds = Array.from(categoryTotals.keys());
        const derivedValues = derivedIds.map(k => categoryTotals.get(k)!);
        const derivedParents = derivedIds.map(() => '');
        const derivedLabels = [...derivedIds];
        first.ids = derivedIds;
        first.labels = derivedLabels;
        first.parents = derivedParents;
        extractedValues = derivedValues; // overwrite extracted values so flat uses them
        console.log('[Sunburst Fallback] Derived hierarchy from customdata:', {
          count: derivedIds.length,
          sample: derivedIds.slice(0, 8),
        });
      }
    } catch (e) {
      console.warn('[Sunburst Fallback] Failed to derive hierarchy from customdata', e);
    }
  }

  const flat: SunburstFlatData = {
    ids: first.ids ?? [],
    labels: first.labels ?? [],
    parents: (first.parents as Array<string | null | ''>) ?? [],
    values: extractedValues.length > 0 ? extractedValues : [],
  };

  // Add pattern data if available
  if (patternShapes.length > 0) {
    flat.marker = {
      colors: (first.marker?.colors as string[]) || [],
      pattern: {
        shape: patternShapes,
      },
    };
  }

  console.log('[PlotlySchemaAdapter] Pattern shapes extracted:', patternShapes);
  console.log('[PlotlySchemaAdapter] Pattern data available:', patternShapes.length > 0);
  console.log('[PlotlySchemaAdapter] Marker colors:', first.marker?.colors?.slice(0, 10), '...');
  console.log('[PlotlySchemaAdapter] Final flat object:', flat);

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
  let colorscale =
    (input.layout as any)?.coloraxis?.colorscale ||
    (input.layout as any)?.colorscale?.sequential ||
    (input.data[0] as any)?.colorscale ||
    first.marker?.colorscale;
  const hasColorscale = colorscale && Array.isArray(colorscale);

  console.log('[COLORSCALE DEBUG] layout.coloraxis.colorscale:', (input.layout as any)?.coloraxis?.colorscale);
  console.log('[COLORSCALE DEBUG] layout.colorscale.sequential:', (input.layout as any)?.colorscale?.sequential);
  console.log('[COLORSCALE DEBUG] data[0].colorscale:', (input.data[0] as any)?.colorscale);
  console.log('[COLORSCALE DEBUG] marker.colorscale:', first.marker?.colorscale);
  console.log('[COLORSCALE DEBUG] final colorscale:', colorscale);
  console.log('[COLORSCALE DEBUG] hasColorscale:', hasColorscale);
  console.log('[COLORSCALE DEBUG] marker.colors:', first.marker?.colors?.slice(0, 10));

  // Intentionally do NOT mutate or remap the incoming colorscale to avoid hard-coded color substitutions.

  // Calculate colorscale colors before building the tree if needed
  let colorscaleColors: (string | null)[] | undefined;

  console.log('[COLORSCALE DEBUG] About to check hasColorscale condition:', hasColorscale);

  if (hasColorscale) {
    console.log('[COLORSCALE DEBUG] ENTERING COLORSCALE PROCESSING!');
    console.log('[COLORSCALE DEBUG] Processing colorscale - hasColorscale:', hasColorscale);
    console.log('[COLORSCALE DEBUG] marker.coloraxis:', first.marker?.coloraxis);
    console.log('[COLORSCALE DEBUG] marker.colorscale:', first.marker?.colorscale);

    // Handle colorscale mapping using the color values from marker.colors or customdata
    let colorValues: number[] = [];

    console.log('[COLORSCALE DEBUG] marker.colors raw:', first.marker?.colors);
    console.log('[COLORSCALE DEBUG] marker.colors is array:', Array.isArray(first.marker?.colors));

    // Try to get color values from marker.colors first
    if (first.marker?.colors) {
      if (Array.isArray(first.marker.colors)) {
        colorValues = first.marker.colors.map((c: any) => {
          console.log('c ####### = ', c);
          if (c === null || c === undefined) {
            return NaN; // Keep nulls as NaN for proper handling
          }
          console.log('c typeof = ', typeof c);
          return typeof c === 'number' ? c : parseFloat(String(c)) || NaN;
        });
        console.log('[COLORSCALE DEBUG] Extracted colorValues from marker.colors:', colorValues.slice(0, 10));
      } else if (typeof first.marker.colors === 'object' && 'bdata' in first.marker.colors) {
        colorValues = decodeBinaryData(first.marker.colors);
        console.log('[COLORSCALE DEBUG] Extracted colorValues from bdata:', colorValues.slice(0, 10));
      }
    }

    // If no color values from marker, try to extract from customdata (refund amounts)
    if (colorValues.length === 0 && first.customdata) {
      if (Array.isArray(first.customdata)) {
        // Extract the last element from each row (should be the metric value for coloring)
        const customRows = first.customdata as any[];
        colorValues = customRows.map((row: any) => {
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
      console.log('[COLORSCALE DEBUG] Used extractedValues as fallback:', colorValues.slice(0, 10));
    }

    console.log('[COLORSCALE DEBUG] Final colorValues length:', colorValues.length);
    console.log('[COLORSCALE DEBUG] Final colorValues sample:', colorValues.slice(0, 10));

    if (colorValues.length > 0) {
      // Filter out NaN values for min/max calculation
      const validColorValues = colorValues.filter(value => !isNaN(value) && isFinite(value));

      console.log('[COLORSCALE DEBUG] validColorValues:', validColorValues.slice(0, 10));
      console.log('[COLORSCALE DEBUG] validColorValues length:', validColorValues.length);

      if (validColorValues.length > 0) {
        // Detect Plotly's discrete indexing pattern:
        //  - Every valid value is a non-negative integer
        //  - max integer < colorscaleStops-1 (meaning top stops unused)
        //  - AND number of distinct integers <= number of colorscale stops (to avoid accidental trigger)
        const allInts = validColorValues.every(v => Number.isInteger(v) && v >= 0);
        const maxInt = allInts ? Math.max(...(validColorValues as number[])) : undefined;
        const colorscaleStops = Array.isArray(colorscale) ? colorscale.length : 0;
        const distinctCount = allInts ? new Set(validColorValues).size : 0;
        const looksDiscrete =
          !!allInts && colorscaleStops > 0 && maxInt! < colorscaleStops - 1 && distinctCount <= colorscaleStops;

        if (looksDiscrete) {
          console.log('[COLORSCALE DEBUG] Discrete colorscale mode detected.', {
            maxInt,
            colorscaleStops,
            distinctCount,
          });
          // Direct index lookup: integer value N maps to colorscale[N][1]
          colorscaleColors = colorValues.map(value => {
            if (isNaN(value) || !isFinite(value)) return null; // preserve nulls
            const idx = value as number;
            const stop = colorscale[idx];
            const color = stop ? stop[1] : colorscale[colorscale.length - 1][1];
            console.log('[COLORSCALE DEBUG][DISCRETE] Value:', value, '-> StopIdx:', idx, 'Color:', color);
            return color;
          });
        } else {
          // Continuous (interpolated) mode like before
          // Use cmin/cmax from schema if defined, otherwise use data min/max
          const coloraxis = (input.layout as any)?.coloraxis;
          const minValue = typeof coloraxis?.cmin === 'number' ? coloraxis.cmin : Math.min(...validColorValues);
          const maxValue = typeof coloraxis?.cmax === 'number' ? coloraxis.cmax : Math.max(...validColorValues);

          console.log('[COLORSCALE DEBUG] minValue:', minValue, 'maxValue:', maxValue);
          console.log('[COLORSCALE DEBUG] Value range size:', maxValue - minValue);
          console.log('[COLORSCALE DEBUG] colorscale:', colorscale);
          console.log('[COLORSCALE DEBUG] All validColorValues:', validColorValues);

          // Check if there's a colorscale midpoint (cmid) defined
          const cmid = typeof coloraxis?.cmid === 'number' ? coloraxis.cmid : undefined;

          // Map each value to a color using the colorscale
          colorscaleColors = colorValues.map(value => {
            if (isNaN(value) || !isFinite(value)) {
              // Return null for NaN/invalid values (these nodes shouldn't get colorscale colors)
              return null;
            }
            const interpolatedColor = interpolateColorFromScale(value, colorscale, minValue, maxValue, cmid);
            console.log(
              '[COLORSCALE DEBUG][CONTINUOUS] Value:',
              value,
              'Normalized:',
              (value - minValue) / (maxValue - minValue),
              '-> Color:',
              interpolatedColor,
            );
            return interpolatedColor;
          });
        }

        console.log('[COLORSCALE DEBUG] Final colorscaleColors sample:', colorscaleColors.slice(0, 10));

        // Debug: Check if all colors are too dark (might indicate a normalization issue)
        if (colorscaleColors && colorscaleColors.length > 0) {
          const nonNullColors = colorscaleColors.filter(c => c !== null);
          console.log('[COLORSCALE DEBUG] Non-null colors:', nonNullColors);
          const darkColors = nonNullColors.filter(c => {
            if (typeof c === 'string' && c.startsWith('#')) {
              // Check if RGB values are all low (dark color)
              const hex = c.slice(1);
              const r = parseInt(hex.slice(0, 2), 16);
              const g = parseInt(hex.slice(2, 4), 16);
              const b = parseInt(hex.slice(4, 6), 16);
              return r < 50 && g < 50 && b < 50; // Very dark threshold
            }
            return false;
          });
          console.log('[COLORSCALE DEBUG] Dark colors detected:', darkColors.length, 'out of', nonNullColors.length);
        }
      }
    }
  }

  console.log('[COLORSCALE DEBUG] calculated colorscaleColors:', colorscaleColors?.slice(0, 10));

  // Extract colors for other cases
  let colors: string[] | string | null | undefined;

  console.log('[COLORSCALE DEBUG] Final condition check:');
  console.log('[COLORSCALE DEBUG] hasColorscale:', hasColorscale);
  console.log('[COLORSCALE DEBUG] colorscaleColors exists:', !!colorscaleColors);
  console.log('[COLORSCALE DEBUG] colorscaleColors length:', colorscaleColors?.length);

  if (!hasColorscale || !colorscaleColors) {
    console.log('[COLORSCALE DEBUG] FALLING BACK TO REGULAR COLOR EXTRACTION');
    colors = extractColor(
      (input.layout as any)?.sunburstcolorway ?? input.layout?.template?.layout?.colorway,
      colorwayType,
      first.marker?.colors ?? input.layout?.template?.layout?.colorway,
      colorMap,
      isDarkTheme,
    );
  }

  // Build a minimal tree and (if marker.colors exists) stamp colors on legend-level nodes so descendants inherit.
  // We only attach color on nodes whose parent is falsy (roots) when multiple roots, or children of a single root.
  const buildColorStampedRoot = (): SunburstNode | undefined => {
    if (!flat.ids.length) {
      return undefined;
    }
    // Create map for quick lookup
    const map: Record<string, SunburstNode & { parent?: string | null }> = {};
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
      // Set parent reference for hierarchical color assignment
      (map[id] as any).parent = map[parent];
    });
    // Determine visible legend ring depth
    const rootCandidates: SunburstNode[] = [];
    flat.ids.forEach((id, i) => {
      const parent = flat.parents[i];
      if (!parent) {
        rootCandidates.push(map[id]);
      }
    });
    let legendNodes: SunburstNode[] = [];
    if (rootCandidates.length === 1) {
      legendNodes = (map[rootCandidates[0].id].children ?? []) as SunburstNode[];
    } else {
      legendNodes = rootCandidates;
    }

    // Helper to roll up values for a node (sum of descendants) for sorting
    const rollup = (n: SunburstNode): number => {
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
    if (hasColorscale && colorscaleColors && Array.isArray(colorscaleColors)) {
      const ids = first.ids ?? [];
      // Create a complete color mapping for all IDs using the colorscale colors
      for (let i = 0; i < ids.length && i < colorscaleColors.length; i++) {
        console.log('***********************');
        if (map[ids[i]] && colorscaleColors[i] !== null) {
          console.log('Assigning colorscale color:', ids[i]);
          console.log(
            'color values = ',
            first.marker?.colors && isArrayOrTypedArray(first.marker?.colors) && (first.marker?.colors as Color[])[i],
          );
          map[ids[i]].color =
            first.marker?.colors &&
            isArrayOrTypedArray(first.marker?.colors) &&
            (first.marker?.colors as Color[])[i] === null
              ? '#000000'
              : colorscaleColors[i]!;
        }
      }
    } else if (Array.isArray(first.marker?.colors)) {
      const ids = first.ids ?? [];
      // Create a complete color mapping for all IDs using resolveColor
      for (let i = 0; i < ids.length; i++) {
        console.log('########################');
        if (map[ids[i]]) {
          map[ids[i]].color =
            first.marker?.color &&
            isArrayOrTypedArray(first.marker?.color) &&
            (first.marker?.color as Color[])[i] === null
              ? '#000000'
              : resolveColor(colors, i, ids[i], colorMap, isDarkTheme);
        }
      }
    }

    // Sort legend nodes by rolled-up value (desc) to stabilize color assignment when using colorway
    // This happens AFTER color assignment from marker.colors to preserve id-to-color mapping
    legendNodes.sort((a, b) => rollup(b) - rollup(a));

    // Assign colors by depth using colorway so that root has one color and children have different colors.
    // Deterministic order per depth: sort labels by rolled-up value (desc), then assign colorway in that order.
    // Only run this if we don't have explicit marker colors or colorscale colors (which would have been assigned above)
    // Also run if no nodes have been assigned colors yet (fallback scenario), BUT skip if colorscale will handle colors
    // SKIP this to allow hierarchical tonal colors to be assigned later in the fallback tree logic
    const hasAnyNodeColors = Object.values(map).some(node => node.color);
    // Disable categorical assignment for now to let hierarchical tonal logic handle it
    if (
      false &&
      ((colors && !Array.isArray(first.marker?.colors) && !hasColorscale) || (!hasAnyNodeColors && !hasColorscale))
    ) {
      // Determine which depth is the first visible ring (legend level)
      const legendDepth = rootCandidates.length === 1 ? 1 : 0; // children of single root OR root level when multiple roots

      // Build a traversal root (virtual when multiple roots)
      const traversalRoot: SunburstNode =
        rootCandidates.length === 1
          ? map[rootCandidates[0].id]
          : { id: 'root', label: 'Root', value: 0, children: rootCandidates };

      // Ensure values are rolled up for ordering
      const rollupTree = (n: SunburstNode): number => {
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
      const dfsCollect = (node: SunburstNode, depth: number) => {
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
      const dfsAssign = (node: SunburstNode, depth: number) => {
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
  console.log('[COLORSCALE DEBUG] About to check if colorscale assignment condition...');
  console.log('[COLORSCALE DEBUG] hasColorscale:', hasColorscale);
  console.log('[COLORSCALE DEBUG] colorscaleColors exists:', !!colorscaleColors);
  console.log('[COLORSCALE DEBUG] colorscaleColors length:', colorscaleColors?.length);
  console.log('[COLORSCALE DEBUG] colorscaleColors sample:', colorscaleColors?.slice(0, 5));

  if (hasColorscale && colorscaleColors) {
    console.log('[COLORSCALE DEBUG] ENTERING COLORSCALE ASSIGNMENT!');
    // For colorscale, assign colors directly to tree nodes based on the colorscale mapping
    flat.marker = flat.marker || {};
    // IMPORTANT: Set the colorscale colors in flat.marker.colors for the component to use
    flat.marker.colors = colorscaleColors.map(c => c || '#000000'); // Convert nulls to black
    console.log('[COLORSCALE DEBUG] Set flat.marker.colors from colorscaleColors:', flat.marker.colors.slice(0, 10));

    // Preserve the original marker colors array (including nulls) so we can distinguish nulls (should become black)
    const originalMarkerColors: any[] | undefined = Array.isArray(first.marker?.colors)
      ? (first.marker!.colors as any[])
      : undefined;
    // Keep a copy on flat.marker.colors to prevent later synthesis from overwriting nulls with palette values
    if (originalMarkerColors) {
      // Keep as any[] so we can retain null values
      (flat.marker as any).colors = originalMarkerColors.map(v => (v === null ? null : String(v)));
    }
    // Build root used for color stamping
    dataObject.root = buildColorStampedRoot();

    // Assign colorscale colors to tree nodes
    if (dataObject.root) {
      console.log('[COLORSCALE DEBUG] Assigning colors to tree nodes...');
      console.log('[COLORSCALE DEBUG] dataObject.root exists:', !!dataObject.root);
      console.log('[COLORSCALE DEBUG] colorscaleColors length:', colorscaleColors?.length);

      const assignColorscaleColors = (node: any, depth: number) => {
        if (!node) return;

        console.log('[COLORSCALE DEBUG] Processing node:', node.id, 'at depth:', depth);

        // Find the color for this node based on its ID
        const idIndex = flat.ids.indexOf(node.id);
        console.log('[COLORSCALE DEBUG] Node ID:', node.id, 'Index:', idIndex);

        if (idIndex >= 0 && colorscaleColors) {
          const originalVal = originalMarkerColors ? originalMarkerColors[idIndex] : undefined;
          if (originalVal === null) {
            // Explicit null in schema -> force black
            node.color = '#000000';
            console.log('[COLORSCALE DEBUG] Assigned BLACK for null schema value at node:', node.id);
          } else if (colorscaleColors[idIndex]) {
            const assignedColor = colorscaleColors[idIndex];
            node.color = assignedColor;
            console.log('[COLORSCALE DEBUG] Assigning colorscale color:', assignedColor, 'to node:', node.id);
          } else {
            console.log('[COLORSCALE DEBUG] colorscaleColors entry missing for node (will fallback later):', node.id);
          }
        }

        if (node.children) {
          node.children.forEach((c: any) => assignColorscaleColors(c, depth + 1));
        }
      };
      assignColorscaleColors(dataObject.root, 0);
      console.log('[COLORSCALE DEBUG] Finished assigning colors to tree nodes');
    }
  } else if (Array.isArray(first.marker?.colors) && !(hasColorscale && colorscaleColors)) {
    // Only process raw marker colors if we haven't already processed colorscale colors
    flat.marker = flat.marker || {};
    flat.marker.colors = first.marker.colors.map(c => String(c));
    console.log(
      '[COLORSCALE DEBUG] Using raw marker.colors (no colorscale processing):',
      flat.marker.colors.slice(0, 5),
    );
  } else {
    // Only use custom root when no explicit colors
    dataObject.root = buildColorStampedRoot();
  }

  // Track whether we had original marker colors before any synthesis
  const hadOriginalMarkerColors = Array.isArray(first.marker?.colors);
  console.log('[FALLBACK DEBUG] hadOriginalMarkerColors:', hadOriginalMarkerColors);
  console.log('[FALLBACK DEBUG] hasColorscale:', hasColorscale);
  console.log('[FALLBACK DEBUG] colorscaleColors exists:', !!colorscaleColors);

  // Fallback: if marker colors are still missing or contain falsy entries, synthesize them from colorway
  if (!flat.marker?.colors && !(hasColorscale && colorscaleColors)) {
    const synthesized = (flat.ids || []).map((id, i) =>
      resolveColor(colors, i, id || String(i), colorMap, isDarkTheme),
    );
    if (synthesized.length) {
      flat.marker = flat.marker || {};
      flat.marker.colors = synthesized;
      console.log('[Sunburst Fallback] Synthesized marker.colors from colorway. Sample:', synthesized.slice(0, 8));
    }
  } else if (flat.marker && Array.isArray((flat.marker as any).colors)) {
    // Replace any empty/undefined colors with resolved fallback, but preserve null values for colorscale handling
    let mutated = false;
    const arr = (flat.marker as any).colors as any[];
    for (let i = 0; i < arr.length; i++) {
      // Only replace undefined/empty values, but keep null values as they indicate intermediate nodes
      if (arr[i] !== null && !arr[i]) {
        arr[i] = resolveColor(colors, i, flat.ids?.[i] || String(i), colorMap, isDarkTheme);
        mutated = true;
      }
    }
    if (mutated) {
      console.log('[Sunburst Fallback] Patched undefined marker.colors entries (preserved null values).');
    }
  }

  // If we have a root tree ensure every node in the tree has a concrete color; assign depth-based fallback.
  if (dataObject.root) {
    console.log('[FALLBACK DEBUG] Starting fallback color assignment...');
    const palette = Array.isArray(colors) ? colors : ([] as string[]);
    let paletteLen = Array.isArray(palette) ? (palette as any).length : 0;
    console.log('[FALLBACK DEBUG] Palette length:', paletteLen);

    // Hierarchical tonal mode: no explicit marker.colors & no colorscale -> mimic Plotly behavior of
    // same base hue per top-level branch with progressively lighter shades for deeper depths.
    const hierarchicalTonalMode = !hadOriginalMarkerColors && !(hasColorscale && colorscaleColors) && paletteLen > 0;
    if (hierarchicalTonalMode) {
      console.log('[FALLBACK DEBUG] Hierarchical tonal mode ENABLED');
    }

    const lightenColor = (hex: string, factor: number): string => {
      if (!/^#?[0-9a-fA-F]{6}$/.test(hex)) return hex; // keep original if unexpected
      const h = hex.replace('#', '');
      const r = parseInt(h.slice(0, 2), 16);
      const g = parseInt(h.slice(2, 4), 16);
      const b = parseInt(h.slice(4, 6), 16);
      const lr = Math.round(r + (255 - r) * factor);
      const lg = Math.round(g + (255 - g) * factor);
      const lb = Math.round(b + (255 - b) * factor);
      return '#' + [lr, lg, lb].map(v => v.toString(16).padStart(2, '0')).join('');
    };

    // For hierarchical mode we assign a base color per root (depth 1 under pseudo-center) sequentially from palette.
    let nextRootIndex = 0;

    const assignTreeColors = (node: any, depth: number) => {
      if (!node) return;

      console.log('[FALLBACK DEBUG] Processing node:', node.id, 'existing color:', node.color, 'depth:', depth);

      if (!node.color) {
        console.log('[FALLBACK DEBUG] Node has no color, assigning fallback...');

        // Check if this node has a null value in marker.colors (intermediate node)
        const idIndex = flat.ids ? flat.ids.indexOf(node.id) : -1;
        const isIntermediateNode =
          idIndex >= 0 && flat.marker?.colors && (flat.marker.colors as any[])[idIndex] === null;

        if (isIntermediateNode) {
          // For intermediate nodes with null marker.colors, use black color
          console.log('[FALLBACK DEBUG] Assigning black color to intermediate node:', node.id);
          node.color = '#000000';
        } else if (hierarchicalTonalMode) {
          // Determine root-relative depth (depth 0 may be pseudo-center)
          const isPseudoCenter = node.id === '__plotly_center__';
          if (isPseudoCenter) {
            node.color = '#000000'; // center black
          } else {
            // Check if this is a root branch (no parent or parent is pseudo-center or empty parent)
            const nodeIndex = flat.ids ? flat.ids.indexOf(node.id) : -1;
            const nodeParent = nodeIndex >= 0 && flat.parents ? flat.parents[nodeIndex] : null;
            const isRootBranch = !nodeParent || nodeParent === '' || node.parent?.id === '__plotly_center__';

            if (isRootBranch) {
              // Root branch: assign base palette color
              const base = palette[nextRootIndex % paletteLen];
              nextRootIndex++;
              node.color = base;
              (node as any).__rootBase__ = base;
              console.log('[FALLBACK DEBUG] Assigned root color:', base, 'to:', node.id);
            } else {
              // Find ancestor root base color by walking up .parent chain
              let ancestor = node.parent;
              let rootBase: string | undefined;
              let hops = 0;
              while (ancestor && !rootBase && hops < 10) {
                // safety bound
                if (ancestor.__rootBase__) rootBase = ancestor.__rootBase__;
                ancestor = ancestor.parent;
                hops++;
              }
              if (!rootBase) {
                // Fallback: use next palette color if somehow base not found
                rootBase = palette[nextRootIndex % paletteLen];
                console.log('[FALLBACK DEBUG] Could not find root base, using fallback:', rootBase);
              }
              const relativeDepth = depth - 1; // 0 = root branch, 1 = children, ...
              const factor = Math.min(0.2 * relativeDepth, 0.7); // cap lightening
              node.color = lightenColor(rootBase, factor);
              console.log('[FALLBACK DEBUG] Lightened color for depth', depth, ':', node.color, 'from base:', rootBase);
            }
          }
        } else if (paletteLen) {
          const fallbackColor = resolveColor(palette, depth, node.label || node.id, colorMap, isDarkTheme);
          console.log('[FALLBACK DEBUG] Assigning palette color:', fallbackColor, 'to node:', node.id);
          node.color = fallbackColor;
        } else if (flat.marker?.colors && flat.ids) {
          const idx = flat.ids.indexOf(node.id);
          if (idx >= 0) {
            const markerColor = (flat.marker.colors as string[])[idx];
            console.log('[FALLBACK DEBUG] Assigning marker color:', markerColor, 'to node:', node.id);
            node.color = markerColor;
          }
        }
      } else {
        console.log('[FALLBACK DEBUG] Node already has color:', node.color, '- keeping it');
      }

      if (node.children) node.children.forEach((c: any) => assignTreeColors(c, depth + 1));
    };
    assignTreeColors(dataObject.root, 0);
    console.log('[FALLBACK DEBUG] Finished fallback color assignment');
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
  // Ensure we have enough space for all layers by calculating thickness that fits within available radius
  const calculatedLevelThickness = totalLayers > 0 ? Math.floor(availableRadius / totalLayers) : 40;
  // Ensure minimum thickness of 15 for visibility, but prioritize fitting all layers
  const levelThickness = Math.max(15, calculatedLevelThickness);

  // Debug: Final check before returning props
  let effectiveBranchValues = first.branchvalues || ('remainder' as 'total' | 'remainder');

  // If branchvalues is not explicitly set, infer it from the data structure
  // In Plotly sunburst, if there are parent nodes with value 0, it typically uses remainder mode
  if (!effectiveBranchValues) {
    const hasParentNodesWithZeroValue = flat.ids.some((id, i) => {
      const value = i < flat.values.length ? flat.values[i] : 0;
      const hasChildren = flat.ids.some(childId => flat.parents[flat.ids.indexOf(childId)] === id);
      return hasChildren && value === 0;
    });

    effectiveBranchValues = hasParentNodesWithZeroValue ? 'remainder' : 'total';
    console.log('=== INFERRED BRANCH VALUES ===');
    console.log('Inferred branchValues:', effectiveBranchValues, 'based on parent nodes with zero values');
  }

  if (effectiveBranchValues === 'remainder') {
    console.log('=== FINAL SUNBURST PROPS ===');
    console.log('branchValues:', effectiveBranchValues);
    console.log('data.flat.values sample:', dataObject.flat?.values?.slice(0, 10));
  }
  console.log('dataObject = ', dataObject);

  console.log('=== DEPTH CALCULATION DEBUG ===');
  console.log('calculated maxDepth:', maxDepth);
  console.log('plotly maxdepth:', (first as any).maxdepth);

  return {
    data: dataObject,
    branchValues: effectiveBranchValues,
    hideLabels,
    showLabelsInPercent: first.textinfo ? ['percent', 'label+percent'].includes(first.textinfo as string) : false,
    width: input.layout?.width,
    height: input.layout?.height,
    roundCorners: true,
    legendProps: { canSelectMultipleLegends: true },
    // Sort segments by value (desc) to assign palette colors deterministically
    sort: 'desc',
    levelThickness,
    // Show all layers as specified in the data
    maxDepth: (first as any).maxdepth && (first as any).maxdepth > 0 ? (first as any).maxdepth : maxDepth,
  } as SunburstChartProps;
};
export const projectPolarToCartesian = (input: PlotlySchema): PlotlySchema => {
  const projection: PlotlySchema = { ...input };

  // Find the global min and max radius across all series
  let minRadius = 0;
  let maxRadius = 0;
  for (let sindex = 0; sindex < input.data.length; sindex++) {
    const rVals = (input.data[sindex] as Partial<PlotData>).r;
    if (rVals && isArrayOrTypedArray(rVals)) {
      for (let ptindex = 0; ptindex < rVals.length; ptindex++) {
        if (!isInvalidValue(rVals[ptindex])) {
          minRadius = Math.min(minRadius, rVals[ptindex] as number);
          maxRadius = Math.max(maxRadius, rVals[ptindex] as number);
        }
      }
    }
  }

  // If there are negative radii, compute the shift
  const radiusShift = minRadius < 0 ? -minRadius : 0;

  // Collect all unique theta values from all scatterpolar series for equal spacing
  const allThetaValues: Set<string> = new Set();
  for (let sindex = 0; sindex < input.data.length; sindex++) {
    const series = input.data[sindex] as Partial<PlotData>;
    if (series.theta && isArrayOrTypedArray(series.theta)) {
      series.theta.forEach(theta => allThetaValues.add(String(theta)));
    }
  }

  // Project all points and create a perfect square domain
  const allX: number[] = [];
  const allY: number[] = [];
  let originX: number | null = null;
  for (let sindex = 0; sindex < input.data.length; sindex++) {
    const series = input.data[sindex] as Partial<PlotData>;
    // If scatterpolar, set __axisLabel to all unique theta values for equal spacing
    if (isArrayOrTypedArray(series.theta)) {
      (series as { __axisLabel: string[] }).__axisLabel = Array.from(allThetaValues);
    }
    series.x = [] as Datum[];
    series.y = [] as Datum[];
    const thetas = series.theta!;
    const rVals = series.r!;

    // Skip if rVals or thetas are not arrays
    if (!isArrayOrTypedArray(rVals) || !isArrayOrTypedArray(thetas)) {
      projection.data[sindex] = series;
      continue;
    }

    // retrieve polar axis settings
    const dirMultiplier = input.layout?.polar?.angularaxis?.direction === 'clockwise' ? -1 : 1;
    const startAngleInRad = ((input.layout?.polar?.angularaxis?.rotation ?? 0) * Math.PI) / 180;

    // Compute tick positions if categorical
    let uniqueTheta: Datum[] = [];
    let categorical = false;
    if (!isNumberArray(thetas)) {
      uniqueTheta = Array.from(new Set(thetas));
      categorical = true;
    }

    for (let ptindex = 0; ptindex < rVals.length; ptindex++) {
      if (isInvalidValue(thetas?.[ptindex]) || isInvalidValue(rVals?.[ptindex])) {
        continue;
      }

      // Map theta to angle in radians
      let thetaRad: number;
      if (categorical) {
        const idx = uniqueTheta.indexOf(thetas[ptindex]);
        const step = (2 * Math.PI) / uniqueTheta.length;
        thetaRad = startAngleInRad + dirMultiplier * idx * step;
      } else {
        thetaRad = startAngleInRad + dirMultiplier * (((thetas[ptindex] as number) * Math.PI) / 180);
      }
      // Shift only the polar origin (not the cartesian)
      const rawRadius = rVals[ptindex] as number;
      const polarRadius = rawRadius + radiusShift; // Only for projection
      // Calculate cartesian coordinates (with shifted polar origin)
      const x = polarRadius * Math.cos(thetaRad);
      const y = polarRadius * Math.sin(thetaRad);

      // Calculate the cartesian coordinates of the original polar origin (0,0)
      // This is the point that should be mapped to (0,0) in cartesian coordinates
      if (sindex === 0 && ptindex === 0) {
        // For polar origin (r=0, θ=0), cartesian coordinates are (0,0)
        // But since we shifted the radius by radiusShift, the cartesian origin is at (radiusShift, 0)
        originX = radiusShift;
      }

      series.x.push(x);
      series.y.push(y);
      allX.push(x);
      allY.push(y);
    }

    // Map text to each data point for downstream chart rendering
    if (series.x && series.y) {
      (series as { data?: unknown[] }).data = series.x.map((xVal, idx) => ({
        x: xVal,
        y: (series.y as number[])[idx],
        ...(series.text ? { text: (series.text as string[])[idx] } : {}),
      }));
    }

    projection.data[sindex] = series;
  }

  // 7. Recenter all cartesian coordinates
  if (originX !== null) {
    for (let sindex = 0; sindex < projection.data.length; sindex++) {
      const series = projection.data[sindex] as Partial<PlotData>;
      if (series.x && series.y) {
        series.x = (series.x as number[]).map((v: number) => v - originX!);
      }
    }
    // Also recenter allX for normalization
    for (let i = 0; i < allX.length; i++) {
      allX[i] = allX[i] - originX!;
    }
  }

  // 8. Find the maximum absolute value among all x and y
  let maxAbs = Math.max(...allX.map(Math.abs), ...allY.map(Math.abs));
  maxAbs = maxAbs === 0 ? 1 : maxAbs;

  // 9. Rescale all points so that the largest |x| or |y| is 0.5
  for (let sindex = 0; sindex < projection.data.length; sindex++) {
    const series = projection.data[sindex] as Partial<PlotData>;
    if (series.x && series.y) {
      series.x = (series.x as number[]).map((v: number) => v / (2 * maxAbs));
      series.y = (series.y as number[]).map((v: number) => v / (2 * maxAbs));
    }
  }

  // 10. Customize layout for perfect square with absolute positioning
  const size = input.layout?.width || input.layout?.height || 500;
  projection.layout = {
    ...projection.layout,
    width: size,
    height: size,
  };
  // Attach originX as custom properties
  (projection.layout as { __polarOriginX?: number }).__polarOriginX = originX ?? undefined;

  return projection;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isPlainObject(obj: any) {
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
export function findArrayAttributes(trace: any): void {
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

function getLineOptions(line: Partial<ScatterLine> | undefined): LineChartLineOptions | undefined {
  if (!line) {
    return;
  }

  let lineOptions: LineChartLineOptions = {};
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
    const precision = Math.max(calculatePrecision(minVal), calculatePrecision(binSize));
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

const getLegendShape = (series: Partial<PlotData>): Legend['shape'] => {
  const dashType = series.line?.dash || 'solid';
  if (dashType === 'dot' || dashType === 'dash' || dashType === 'dashdot') {
    return 'dottedLine';
  } else if (series.mode?.includes('markers')) {
    return 'circle';
  }
  return 'default';
};

export const getAllupLegendsProps = (
  input: PlotlySchema,
  colorMap: React.MutableRefObject<Map<string, string>>,
  colorwayType: ColorwayType,
  traceInfo: TraceInfo[],
  isDarkTheme?: boolean,
): LegendsProps => {
  const allupLegends: Legend[] = [];
  // reduce on showlegend boolean propperty. reduce should return true if at least one series has showlegend true
  const toShowLegend = input.data.reduce((acc, series) => {
    return (
      acc || (series as Partial<PlotData>).showlegend === true || (series as Partial<PlotData>).showlegend === undefined
    );
  }, false);

  if (toShowLegend) {
    input.data.forEach((series: Data, index) => {
      if (traceInfo[index].type === 'donut') {
        const pieSeries = series as Partial<PieData>;
        const colors: string[] | string | null | undefined = extractColor(
          input.layout?.piecolorway ?? input.layout?.template?.layout?.colorway,
          colorwayType,
          input.layout?.piecolorway ?? pieSeries?.marker?.colors,
          colorMap,
          isDarkTheme,
        );

        pieSeries.labels?.forEach((label, labelIndex: number) => {
          const legend = `${label}`;
          // resolve color for each legend from the extracted colors
          const color: string = resolveColor(colors, labelIndex, legend, colorMap, isDarkTheme);
          if (legend !== '' && allupLegends.some(group => group.title === legend) === false) {
            allupLegends.push({
              title: legend,
              color,
            });
          }
        });
      } else if (isNonPlotType(traceInfo[index].type) === false) {
        const plotSeries = series as Partial<PlotData>;
        const name = plotSeries.legendgroup;
        const color = plotSeries.line?.color || plotSeries.marker?.color;
        const legendShape = getLegendShape(plotSeries);
        const resolvedColor = extractColor(
          input.layout?.template?.layout?.colorway,
          colorwayType,
          color,
          colorMap,
          isDarkTheme,
        );
        if (name !== undefined && name !== '' && allupLegends.some(group => group.title === name) === false) {
          allupLegends.push({
            title: name,
            color: resolvedColor as string,
            shape: legendShape,
          });
        }
      }
    });
  }

  return {
    legends: allupLegends,
    centerLegends: true,
    enabledWrapLines: true,
    canSelectMultipleLegends: true,
  };
};

const getLegendProps = (data: Data[], layout: Partial<Layout> | undefined, isMultiPlot: boolean) => {
  const legends: string[] = [];
  if (data.length === 1) {
    legends.push(data[0].name || '');
  } else {
    data.forEach((series, index) => {
      legends.push(series.name || `Series ${index + 1}`);
    });
  }

  const hideLegendsData = data.every((series: Partial<PlotData>) => series.showlegend === false);
  const hideLegendsInferred = layout?.showlegend === false || (layout?.showlegend !== true && legends.length < 2);

  return {
    legends,
    hideLegend: isMultiPlot || hideLegendsInferred || hideLegendsData,
  };
};

export const getNumberAtIndexOrDefault = (data: PlotData['z'] | undefined, index: number): number | undefined => {
  if (isArrayOrTypedArray(data)) {
    if (typeof data![index] !== 'number' || !isFinite(data![index] as number)) {
      return;
    }

    return data![index] as number;
  }

  return 1;
};

export const getValidXYRanges = (series: Partial<PlotData>): [number, number][] => {
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

const getIndexFromKey = (key: string, pattern: string): number => {
  const normalizedKey = key.replace(pattern, '') === '' ? '1' : key.replace(pattern, '');
  return parseInt(normalizedKey, 10) - 1;
};

export const isNonPlotType = (chartType: string): boolean => {
  return ['donut', 'sankey', 'pie'].includes(chartType);
};

export const getGridProperties = (
  schema: PlotlySchema | undefined,
  isMultiPlot: boolean,
  validTracesInfo: TraceInfo[],
): GridProperties => {
  const domainX: DomainInterval[] = [];
  const domainY: DomainInterval[] = [];
  let cartesianDomains = 0;
  type AnnotationProps = {
    xAnnotation?: string;
    yAnnotation?: string;
  };
  const annotations: Record<number, AnnotationProps> = {};
  let templateRows = '1fr';
  let templateColumns = '1fr';
  const gridLayout: GridAxisProperties = {};
  if (!isMultiPlot) {
    return { templateRows, templateColumns, layout: gridLayout };
  }

  const layout = schema?.layout as Partial<Layout> | undefined;

  if (layout !== undefined && layout !== null && Object.keys(layout).length > 0) {
    Object.keys(layout ?? {}).forEach(key => {
      if (key.startsWith('xaxis')) {
        const index = getIndexFromKey(key, 'xaxis');
        const anchor = (layout[key as keyof typeof layout] as Partial<LayoutAxis>)?.anchor ?? 'y';
        const anchorIndex = getIndexFromKey(anchor, 'y');
        if (index !== anchorIndex) {
          throw new Error(`Invalid layout: xaxis ${index + 1} anchor should be y${anchorIndex + 1}`);
        }
        const xAxisLayout = layout[key as keyof typeof layout] as Partial<LayoutAxis>;
        const domainXInfo: DomainInterval = {
          start: xAxisLayout?.domain ? xAxisLayout.domain[0] : 0,
          end: xAxisLayout?.domain ? xAxisLayout.domain[1] : 1,
        };
        domainX.push(domainXInfo);
      } else if (key.startsWith('yaxis')) {
        const index = getIndexFromKey(key, 'yaxis');
        const anchor = (layout[key as keyof typeof layout] as Partial<LayoutAxis>)?.anchor ?? 'x';
        const anchorIndex = getIndexFromKey(anchor, 'x');
        if (index !== anchorIndex) {
          if ((index === 1 && anchorIndex === 0) || layout.yaxis2?.side === 'right') {
            // Special case for secondary y axis where yaxis2 can anchor to x1
            return { templateRows, templateColumns };
          }
          throw new Error(`Invalid layout: yaxis ${index + 1} anchor should be x${anchorIndex + 1}`);
        }
        const yAxisLayout = layout[key as keyof typeof layout] as Partial<LayoutAxis>;
        const domainYInfo: DomainInterval = {
          start: yAxisLayout?.domain ? yAxisLayout.domain[0] : 0,
          end: yAxisLayout?.domain ? yAxisLayout.domain[1] : 1,
        };
        domainY.push(domainYInfo);
      }
    });
  }

  cartesianDomains = domainX.length; // Assuming that the number of x and y axes is the same
  validTracesInfo.forEach((trace, index) => {
    if (isNonPlotType(trace.type)) {
      const series = schema?.data?.[index] as Partial<PieData> | Partial<SankeyData>;
      const domainXInfo: DomainInterval = {
        start: series.domain?.x ? series.domain.x[0] : 0,
        end: series.domain?.x ? series.domain.x[1] : 1,
      };
      const domainYInfo: DomainInterval = {
        start: series.domain?.y ? series.domain.y[0] : 0,
        end: series.domain?.y ? series.domain.y[1] : 1,
      };
      domainX.push(domainXInfo);
      domainY.push(domainYInfo);
    }
  });

  if (layout !== undefined && layout !== null && Object.keys(layout).length > 0) {
    layout.annotations?.forEach(annotation => {
      const xMatches = domainX.flatMap((interval, idx) =>
        (annotation?.x as number) >= interval.start && (annotation?.x as number) <= interval.end ? [idx] : [],
      );
      const yMatch = domainY.findIndex(
        (interval, yIndex) =>
          xMatches.includes(yIndex) &&
          (annotation?.y as number) >= interval.start &&
          (annotation?.y as number) <= interval.end,
      );

      if (yMatch !== -1) {
        if (annotations[yMatch] === undefined) {
          annotations[yMatch] = {} as AnnotationProps;
        }
        if ((annotation?.textangle as number) === 90) {
          annotations[yMatch].yAnnotation = annotation.text;
        } else {
          annotations[yMatch].xAnnotation = annotation.text;
        }
      }
    });
  }

  if (domainX.length > 0) {
    const uniqueXIntervals = new Map<string, DomainInterval>();
    domainX.forEach(interval => {
      const key = `${interval.start}-${interval.end}`;
      if (!uniqueXIntervals.has(key)) {
        uniqueXIntervals.set(key, interval);
      }
    });
    const sortedXStart = Array.from(uniqueXIntervals.values())
      .map(interval => interval.start)
      .sort();

    templateColumns = `repeat(${sortedXStart.length}, 1fr)`;

    domainX.forEach((interval, index) => {
      const cellName =
        index >= cartesianDomains
          ? `${NON_PLOT_KEY_PREFIX}${index - cartesianDomains + 1}`
          : (`x${index === 0 ? '' : index + 1}` as XAxisName);

      const columnIndex = sortedXStart.findIndex(start => start === interval.start);
      const columnNumber = columnIndex + 1; // Column numbers are 1-based

      const annotationProps = annotations[index] as AnnotationProps;
      const xAnnotation = annotationProps?.xAnnotation;

      const row: AxisProperties = {
        row: -1,
        column: columnNumber,
        xAnnotation,
        xDomain: interval,
        yDomain: { start: 0, end: 1 }, // Default yDomain for x-axis
      };
      gridLayout[cellName] = row;
    });
  }
  if (domainY.length > 0) {
    const uniqueYIntervals = new Map<string, DomainInterval>();
    domainY.forEach(interval => {
      const key = `${interval.start}-${interval.end}`;
      if (!uniqueYIntervals.has(key)) {
        uniqueYIntervals.set(key, interval);
      }
    });
    const sortedYStart = Array.from(uniqueYIntervals.values())
      .map(interval => interval.start)
      .sort();

    const numberOfRows = sortedYStart.length;

    templateRows = `repeat(${numberOfRows}, 1fr)`;
    domainY.forEach((interval, index) => {
      const cellName =
        index >= cartesianDomains
          ? `${NON_PLOT_KEY_PREFIX}${index - cartesianDomains + 1}`
          : (`x${index === 0 ? '' : index + 1}` as XAxisName);
      const rowIndex = sortedYStart.findIndex(start => start === interval.start);
      const rowNumber = numberOfRows - rowIndex; // Rows are 1-based and we need to reverse the order for CSS grid

      const annotationProps = annotations[index] as AnnotationProps;
      const yAnnotation = annotationProps?.yAnnotation;

      const cell = gridLayout[cellName];

      if (cell !== undefined) {
        cell.row = rowNumber;
        cell.yAnnotation = yAnnotation;
        cell.yDomain = interval;
      }
    });
  }

  return {
    templateRows,
    templateColumns,
    layout: gridLayout,
  };
};

type GetAxisCategoryOrderPropsResult = Pick<CartesianChartProps, 'xAxisCategoryOrder' | 'yAxisCategoryOrder'>;

/**
 * @see {@link https://github.com/plotly/plotly.js/blob/master/src/plots/cartesian/category_order_defaults.js#L50}
 */
const getAxisCategoryOrderProps = (data: Data[], layout: Partial<Layout> | undefined) => {
  const result: GetAxisCategoryOrderPropsResult = {};

  const axesById: Record<string, Partial<LayoutAxis> | undefined> = {
    x: layout?.xaxis,
    y: layout?.yaxis,
  };
  Object.keys(axesById).forEach(axId => {
    const ax = axesById[axId];
    const axLetter = axId[0] as 'x' | 'y';
    const propName = `${axLetter}AxisCategoryOrder` as keyof GetAxisCategoryOrderPropsResult;

    const values: Datum[] = [];
    data.forEach((series: Partial<PlotData>) => {
      series[axLetter]?.forEach(val => {
        if (!isInvalidValue(val)) {
          values.push(val as Datum);
        }
      });
    });

    const isAxisTypeCategory =
      ax?.type === 'category' || (isStringArray(values) && !isNumberArray(values) && !isDateArray(values));
    if (!isAxisTypeCategory) {
      return;
    }

    const isValidArray = isArrayOrTypedArray(ax?.categoryarray) && ax!.categoryarray!.length > 0;
    if (isValidArray && (!ax?.categoryorder || ax.categoryorder === 'array')) {
      result[propName] = ax!.categoryarray;
      return;
    }

    if (!ax?.categoryorder || ax.categoryorder === 'trace' || ax.categoryorder === 'array') {
      const categoriesInTraceOrder = Array.from(new Set(values as string[]));
      result[propName] = categoriesInTraceOrder;
      return;
    }

    result[propName] = ax.categoryorder;
  });

  return result;
};

const getBarProps = (
  data: Data[],
  layout: Partial<Layout> | undefined,
  isHorizontal?: boolean,
):
  | Pick<VerticalBarChartProps, 'barWidth' | 'maxBarWidth' | 'xAxisInnerPadding' | 'xAxisOuterPadding' | 'xAxisPadding'>
  | Pick<GanttChartProps, 'barHeight' | 'maxBarHeight' | 'yAxisPadding'> => {
  let padding: number | undefined;

  if (typeof layout?.bargap === 'number') {
    if (layout.bargap >= 0 && layout.bargap <= 1) {
      padding = layout.bargap;
    } else {
      // Plotly uses a default bargap of 0.2, as noted here: https://github.com/plotly/plotly.js/blob/1d5a249e43dd31ae50acf02117a19e5ac97387e9/src/traces/bar/layout_defaults.js#L58.
      // However, we don't use this value as our default padding because it causes the bars to
      // appear disproportionately wide in large containers.
      padding = 0.2;
    }
  }

  const plotlyBarWidths = data
    .map((series: Partial<PlotData>) => {
      if (series.type === 'bar' && (isArrayOrTypedArray(series.width) || typeof series.width === 'number')) {
        return series.width;
      }
      return [];
    })
    .flat();
  const maxPlotlyBarWidth = d3Max(plotlyBarWidths as number[]);
  if (typeof maxPlotlyBarWidth === 'number') {
    padding = 1 - maxPlotlyBarWidth;
    padding = Math.max(0, Math.min(padding, 1));
  }

  if (typeof padding === 'undefined') {
    return {};
  }

  if (isHorizontal) {
    return {
      maxBarHeight: 1000,
      yAxisPadding: padding,
    };
  }

  return {
    barWidth: 'auto',
    maxBarWidth: 1000,
    xAxisInnerPadding: padding,
    xAxisOuterPadding: padding / 2,
  };
};

type GetAxisScaleTypePropsResult = Pick<CartesianChartProps, 'xScaleType' | 'yScaleType' | 'secondaryYScaleType'>;

const getAxisScaleTypeProps = (data: Data[], layout: Partial<Layout> | undefined): GetAxisScaleTypePropsResult => {
  const result: GetAxisScaleTypePropsResult = {};

  const axisObjects = getAxisObjects(data, layout);

  if (axisObjects.x?.type === 'log') {
    result.xScaleType = 'log';
  }
  if (axisObjects.y?.type === 'log') {
    result.yScaleType = 'log';
  }
  if (axisObjects.y2?.type === 'log') {
    result.secondaryYScaleType = 'log';
  }

  return result;
};

type GetAxisTickPropsResult = Pick<
  CartesianChartProps,
  'tickValues' | 'xAxisTickCount' | 'xAxis' | 'yAxisTickValues' | 'yAxisTickCount' | 'yAxis'
>;

/**
 * @see {@link https://github.com/plotly/plotly.js/blob/master/src/plots/cartesian/tick_value_defaults.js#L8}
 */
const getAxisTickProps = (data: Data[], layout: Partial<Layout> | undefined): GetAxisTickPropsResult => {
  const props: GetAxisTickPropsResult = {};
  const axisObjects = getAxisObjects(data, layout);

  Object.keys(axisObjects).forEach(axId => {
    const ax = axisObjects[axId];
    if (!ax) {
      return;
    }

    const axType = getAxisType(data, axId[0] as 'x' | 'y', ax);

    if ((!ax.tickmode || ax.tickmode === 'array') && isArrayOrTypedArray(ax.tickvals)) {
      const tickValues = axType === 'date' ? ax.tickvals!.map((v: string | number | Date) => new Date(v)) : ax.tickvals;

      if (axId === 'x') {
        props.tickValues = tickValues;
      } else if (axId === 'y') {
        props.yAxisTickValues = tickValues;
      }
      return;
    }

    if ((!ax.tickmode || ax.tickmode === 'linear') && ax.dtick) {
      const dtick = plotlyDtick(ax.dtick, axType);
      const tick0 = plotlyTick0(ax.tick0, axType, dtick);

      if (axId === 'x') {
        props.xAxis = {
          tickStep: dtick,
          tick0: tick0,
        };
      } else if (axId === 'y') {
        props.yAxis = {
          tickStep: dtick,
          tick0: tick0,
        };
      }
      return;
    }

    if ((!ax.tickmode || ax.tickmode === 'auto') && typeof ax.nticks === 'number' && ax.nticks >= 0) {
      if (axId === 'x') {
        props.xAxisTickCount = ax.nticks;
      } else if (axId === 'y') {
        props.yAxisTickCount = ax.nticks;
      }
    }
  });

  return props;
};

/**
 * @see {@link https://github.com/plotly/plotly.js/blob/master/src/plots/cartesian/clean_ticks.js#L16}
 */
const plotlyDtick = (dtick: DTickValue | undefined, axType: AxisType | undefined) => {
  const isLogAx = axType === 'log';
  const isDateAx = axType === 'date';
  const isCatAx = axType === 'category';
  const dtickDflt = isDateAx ? 86400000 : 1;

  if (!dtick) {
    return dtickDflt;
  }

  if (isNumber(dtick)) {
    dtick = Number(dtick);
    if (dtick <= 0) {
      return dtickDflt;
    }
    if (isCatAx) {
      // category dtick must be positive integers
      return Math.max(1, Math.round(dtick));
    }
    if (isDateAx) {
      // date dtick must be at least 0.1ms (our current precision)
      return Math.max(0.1, dtick);
    }
    return dtick;
  }

  if (typeof dtick !== 'string' || !(isDateAx || isLogAx)) {
    return dtickDflt;
  }

  const prefix = dtick.charAt(0);
  const dtickNum = isNumber(dtick.slice(1)) ? Number(dtick.slice(1)) : 0;

  if (
    dtickNum <= 0 ||
    !(
      // "M<n>" gives ticks every (integer) n months
      (
        (isDateAx && prefix === 'M' && dtickNum === Math.round(dtickNum)) ||
        // "L<f>" gives ticks linearly spaced in data (not in position) every (float) f
        (isLogAx && prefix === 'L') ||
        // "D1" gives powers of 10 with all small digits between, "D2" gives only 2 and 5
        (isLogAx && prefix === 'D' && (dtickNum === 1 || dtickNum === 2))
      )
    )
  ) {
    return dtickDflt;
  }

  return dtick;
};

/**
 * @see {@link https://github.com/plotly/plotly.js/blob/master/src/plots/cartesian/clean_ticks.js#L70}
 */
const plotlyTick0 = (tick0: number | string | undefined, axType: AxisType | undefined, dtick: string | number) => {
  if (axType === 'date') {
    return isDate(tick0) ? new Date(tick0!) : new Date(DEFAULT_DATE_STRING);
  }
  if (dtick === 'D1' || dtick === 'D2') {
    // D1 and D2 modes ignore tick0 entirely
    return undefined;
  }
  // Aside from date axes, tick0 must be numeric
  return isNumber(tick0) ? Number(tick0) : 0;
};

const getAxisObjects = (data: Data[], layout: Partial<Layout> | undefined) => {
  // Traces are grouped by their xaxis property, and for each group/subplot, the adapter functions
  // are called with the corresponding filtered data. As a result, all traces passed to an adapter
  // function share the same xaxis.
  let xAxisId: number | undefined;
  const yAxisIds = new Set<number>();
  data.forEach((series: Partial<PlotData>) => {
    const axisIds = getAxisIds(series);
    xAxisId = axisIds.x;
    yAxisIds.add(axisIds.y);
  });

  const axisObjects: Record<string, Partial<LayoutAxis> | undefined> = {};

  if (typeof xAxisId === 'number') {
    axisObjects.x = layout?.[getAxisKey('x', xAxisId)];
  }

  const sortedYAxisIds = Array.from(yAxisIds).sort();
  if (sortedYAxisIds.length > 0) {
    axisObjects.y = layout?.[getAxisKey('y', sortedYAxisIds[0])];
  }
  if (sortedYAxisIds.length > 1) {
    axisObjects.y2 = layout?.[getAxisKey('y', sortedYAxisIds[1])];
  }

  return axisObjects;
};

const getAxisType = (data: Data[], axLetter: 'x' | 'y', ax: Partial<LayoutAxis> | undefined): AxisType | undefined => {
  const values: Datum[] = [];
  data.forEach((series: Partial<PlotData>) => {
    series[axLetter]?.forEach(val => {
      if (!isInvalidValue(val)) {
        values.push(val as Datum);
      }
    });
  });

  // Note: When ax.type is explicitly specified, Plotly casts the values to match that type.
  // Therefore, simply checking the type of the values may not be sufficient. At the moment,
  // we don’t always perform this casting ourselves and instead use the values as provided.

  if (isNumberArray(values)) {
    if (ax?.type === 'log') {
      return 'log';
    }
    return 'linear';
  }

  if (isDateArray(values)) {
    return 'date';
  }

  if (isStringArray(values)) {
    return 'category';
  }
};

/**
 * This is experimental. Use it only with valid datetime strings to verify if they conform to the ISO 8601 format.
 */
const isoDateRegex = /^\d{4}(-\d{2}(-\d{2})?)?(T\d{2}:\d{2}(:\d{2}(\.\d{1,9})?)?(Z)?)?$/;

/**
 * We want to display localized date and time in the charts, so the useUTC prop is set to false.
 * But this can sometimes cause the formatters to display the datetime incorrectly.
 * To work around this issue, we use this function to adjust datetime strings so that they are always interpreted
 * as local time, allowing the formatters to produce the correct output.
 *
 * FIXME: The formatters should always produce a clear and accurate localized output, regardless of the
 * format used to create the date object.
 */
const parseLocalDate = (value: string | number) => {
  if (typeof value === 'string') {
    const match = value.match(isoDateRegex);
    if (match) {
      if (!match[3]) {
        value += 'T00:00';
      } else if (match[6]) {
        value = value.replace('Z', '');
      }
    }
  }
  return new Date(value);
};
