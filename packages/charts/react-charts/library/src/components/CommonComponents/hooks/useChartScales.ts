import * as React from 'react';
import {
  scaleLinear as d3ScaleLinear,
  scaleLog as d3ScaleLog,
  scaleTime as d3ScaleTime,
  scaleBand as d3ScaleBand,
  scalePoint as d3ScalePoint,
} from 'd3-scale';
import { max as d3Max, min as d3Min } from 'd3-array';
import {
  UseChartScalesProps,
  UseChartScalesReturn,
  CoordinateSystem,
  AxisType,
  ScaleType,
  ChartDataPoint,
} from '../Chart.types';
import { createNumericXAxis, getDomainNRangeValues, XAxisTypes, ChartTypes } from '../cartesianHelpers';

/**
 * Hook for creating and managing chart scales for different coordinate systems
 */
export function useChartScales(props: UseChartScalesProps): UseChartScalesReturn {
  const { data, axes, coordinateSystem, containerWidth, containerHeight, margins, coordinateSystemProps } = props;

  const scales = React.useMemo(() => {
    const scaleMap: { [key in AxisType]?: any } = {};

    // Extract all data points for domain calculation
    const allPoints = data.flatMap(series => series.data);

    if (coordinateSystem === CoordinateSystem.Cartesian) {
      // Transform UnifiedChart data to format expected by existing utilities (for axis/scale helpers only)
      const transformedPoints = data.map(series => ({
        legend: series.name || '',
        data: series.data.map(point => ({
          ...point,
          x: point.x,
          y: point.y,
        })),
      }));

      // Detect chart type for scale helpers
      let detectedChartType = ChartTypes.LineChart;
      if (axes.some(a => a.type === AxisType.Y && a.scaleType === ScaleType.Linear)) {
        detectedChartType = ChartTypes.LineChart;
      }
      // You can extend this detection for Area, Bar, etc. as needed

      // Use shared helpers for all axis/scale creation
      axes.forEach(axis => {
        const { type } = axis;
        let scale;
        if (type === AxisType.X) {
          scale = createNumericXAxis(
            {
              domainNRangeValues: getDomainNRangeValues(
                transformedPoints,
                margins!,
                containerWidth,
                detectedChartType,
                false,
                XAxisTypes.NumericAxis,
                0,
                undefined,
                0,
              ),
              margins: margins!,
              containerHeight,
              containerWidth,
            },
            {},
            detectedChartType,
          ).xScale;
        } else if (type === AxisType.Y) {
          // Get y-domain from helper
          const yDomain = getDomainNRangeValues(
            transformedPoints,
            margins!,
            containerWidth,
            detectedChartType,
            false,
            XAxisTypes.NumericAxis,
            0,
            undefined,
            0,
          );
          // Debug log
          console.log('Y domain for scale:', yDomain.dStartValue, yDomain.dEndValue);
          // Fallback if domain is [0, 0]
          const yVals = data.flatMap(series => series.data.map(p => p.y)).filter(val => typeof val === 'number');
          let minY = Math.min(...yVals);
          let maxY = Math.max(...yVals);
          // Always set domain as [maxY, minY] for y-axis so min is at bottom, max at top
          scale = d3ScaleLinear()
            .domain([maxY, minY])
            .range([margins!.top!, containerHeight - margins!.bottom!]);
        }
        scaleMap[type] = scale;
      });
      return scaleMap;
    }

    axes.forEach(axis => {
      const { type, scaleType, domain } = axis;
      // Calculate domain if not provided
      let calculatedDomain: [any, any];
      if (domain) {
        calculatedDomain = domain;
      } else {
        calculatedDomain = calculateDomain(allPoints, type, scaleType);
      }
      // Calculate range based on coordinate system and axis type
      const calculatedRange = calculateRange(
        type,
        coordinateSystem,
        containerWidth,
        containerHeight,
        margins!,
        coordinateSystemProps,
      );
      // Create scale based on type
      const scale = createScale(scaleType, calculatedDomain, calculatedRange, coordinateSystemProps);
      scaleMap[type] = scale;
    });
    return scaleMap;
  }, [data, axes, coordinateSystem, containerWidth, containerHeight, margins, coordinateSystemProps]);

  const getPointPosition = React.useCallback(
    (point: ChartDataPoint) => {
      switch (coordinateSystem) {
        case CoordinateSystem.Cartesian:
          return {
            x: scales[AxisType.X] ? scales[AxisType.X](point.x) : 0,
            y: scales[AxisType.Y] ? scales[AxisType.Y](point.y) : 0,
          };

        case CoordinateSystem.Polar:
          if (point.r !== undefined && point.theta !== undefined) {
            const r = scales[AxisType.Radial] ? scales[AxisType.Radial](point.r) : 0;
            const theta = scales[AxisType.Angular] ? scales[AxisType.Angular](point.theta) : 0;

            // Use centerX, centerY from coordinateSystemProps.polar if provided
            const polarProps = coordinateSystemProps?.polar || {};
            const centerX =
              polarProps.centerX ?? margins!.left! + (containerWidth - margins!.left! - margins!.right!) / 2;
            const centerY =
              polarProps.centerY ?? margins!.top! + (containerHeight - margins!.top! - margins!.bottom!) / 2;

            return {
              x: centerX + r * Math.cos(theta),
              y: centerY + r * Math.sin(theta),
            };
          }
          return { x: 0, y: 0 };

        case CoordinateSystem.Logarithmic:
          return {
            x: scales[AxisType.LogX] ? scales[AxisType.LogX](point.x) : 0,
            y: scales[AxisType.LogY] ? scales[AxisType.LogY](point.y) : 0,
          };

        default:
          return { x: 0, y: 0 };
      }
    },
    [scales, coordinateSystem, margins, containerWidth, containerHeight, coordinateSystemProps],
  );

  const getPointFromPosition = React.useCallback(
    (x: number, y: number): ChartDataPoint | null => {
      switch (coordinateSystem) {
        case CoordinateSystem.Cartesian:
          if (scales[AxisType.X] && scales[AxisType.Y]) {
            return {
              x: scales[AxisType.X].invert(x),
              y: scales[AxisType.Y].invert(y),
            };
          }
          break;

        case CoordinateSystem.Polar:
          if (scales[AxisType.Radial] && scales[AxisType.Angular]) {
            const polarProps = coordinateSystemProps?.polar || {};
            const centerX =
              polarProps.centerX ?? margins!.left! + (containerWidth - margins!.left! - margins.right!) / 2;
            const centerY =
              polarProps.centerY ?? margins!.top! + (containerHeight - margins!.top! - margins.bottom!) / 2;

            const dx = x - centerX;
            const dy = y - centerY;
            const r = Math.sqrt(dx * dx + dy * dy);
            let theta = Math.atan2(dy, dx);
            if (theta < 0) theta += 2 * Math.PI;

            return {
              x: 0, // Not used in polar but required by ChartDataPoint
              y: 0, // Not used in polar but required by ChartDataPoint
              r: scales[AxisType.Radial].invert(r),
              theta: scales[AxisType.Angular].invert(theta),
            };
          }
          break;

        case CoordinateSystem.Logarithmic:
          if (scales[AxisType.LogX] && scales[AxisType.LogY]) {
            return {
              x: scales[AxisType.LogX].invert(x),
              y: scales[AxisType.LogY].invert(y),
            };
          }
          break;
      }
      return null;
    },
    [scales, coordinateSystem, margins, containerWidth, containerHeight],
  );

  return {
    scales,
    getPointPosition,
    getPointFromPosition,
  };
}

/**
 * Calculate domain for a given axis type and scale type
 */
function calculateDomain(points: ChartDataPoint[], axisType: AxisType, scaleType: ScaleType): [any, any] {
  const values = points
    .map(point => {
      switch (axisType) {
        case AxisType.X:
        case AxisType.LogX:
          return point.x;
        case AxisType.Y:
        case AxisType.LogY:
          return point.y;
        case AxisType.Radial:
          return point.r;
        case AxisType.Angular:
          return point.theta;
        default:
          return 0;
      }
    })
    .filter(val => val !== undefined && val !== null && typeof val === 'number');

  if (values.length === 0) {
    // For log, must be > 0
    return scaleType === ScaleType.Log ? [1, 10] : [0, 1];
  }

  const min = d3Min(values) as number;
  const max = d3Max(values) as number;

  if (axisType === AxisType.Radial) {
    // Always start from 0 for radial axis
    return [0, max];
  }

  if (scaleType === ScaleType.Log) {
    // For log scale, domain must be strictly positive and no padding
    return [Math.max(min, 1e-6), max];
  }

  // Add padding for better visualization (linear, etc.)
  const padding = (max - min) * 0.1;
  return [min - padding, max + padding];
}

/**
 * Calculate range for a given axis type and coordinate system
 */
function calculateRange(
  axisType: AxisType,
  coordinateSystem: CoordinateSystem,
  containerWidth: number,
  containerHeight: number,
  margins: any,
  coordinateSystemProps?: any,
): [number, number] {
  switch (coordinateSystem) {
    case CoordinateSystem.Cartesian:
      switch (axisType) {
        case AxisType.X:
        case AxisType.LogX:
          return [margins.left!, containerWidth - margins.right!];
        case AxisType.Y:
        case AxisType.LogY:
          return [containerHeight - margins.bottom, margins.top!];
        case AxisType.YSecondary:
          return [containerWidth - margins.right!, margins.left!];
        default:
          return [0, 1];
      }

    case CoordinateSystem.Polar:
      const polarProps = coordinateSystemProps?.polar;
      const maxRadius =
        polarProps?.radius ??
        Math.min(
          (containerWidth - margins.left! - margins.right!) / 2,
          (containerHeight - margins.top! - margins.bottom!) / 2,
        );

      switch (axisType) {
        case AxisType.Radial:
          return [0, maxRadius];
        case AxisType.Angular:
          return [0, 2 * Math.PI];
        default:
          return [0, 1];
      }

    case CoordinateSystem.Logarithmic:
      switch (axisType) {
        case AxisType.LogX:
          return [margins.left!, containerWidth - margins.right!];
        case AxisType.LogY:
          return [containerHeight - margins.bottom, margins.top!];
        default:
          return [0, 1];
      }

    default:
      return [0, 1];
  }
}

/**
 * Create a D3 scale based on scale type
 */
function createScale(scaleType: ScaleType, domain: [any, any], range: [number, number], coordinateSystemProps?: any) {
  switch (scaleType) {
    case ScaleType.Linear:
      return d3ScaleLinear().domain(domain).range(range);

    case ScaleType.Log:
      const base = coordinateSystemProps?.logarithmic?.base ?? 10;
      const nice = coordinateSystemProps?.logarithmic?.nice ?? true;
      const scale = d3ScaleLog().base(base).domain(domain).range(range);
      return nice ? scale.nice() : scale;

    case ScaleType.Time:
      return d3ScaleTime().domain(domain).range(range);

    case ScaleType.Band:
      return d3ScaleBand().domain(domain).range(range);

    case ScaleType.Point:
      return d3ScalePoint().domain(domain).range(range);

    default:
      return d3ScaleLinear().domain(domain).range(range);
  }
}
