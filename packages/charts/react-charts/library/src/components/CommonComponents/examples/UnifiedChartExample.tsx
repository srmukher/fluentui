import * as React from 'react';
import { UnifiedChart } from '../Chart';
import { CoordinateSystem, AxisType, ScaleType, ChartSeries, AxisConfig } from '../Chart.types';

/**
 * Example showing how to use the new UnifiedChart instead of CartesianChart
 */

// Example data structure for the new unified chart
const exampleData: ChartSeries[] = [
  {
    key: 'series1',
    name: 'Series 1',
    data: [
      { x: 1, y: 10 },
      { x: 2, y: 20 },
      { x: 3, y: 15 },
      { x: 4, y: 25 },
      { x: 5, y: 30 },
    ],
    color: '#0078d4',
  },
  {
    key: 'series2',
    name: 'Series 2',
    data: [
      { x: 1, y: 5 },
      { x: 2, y: 15 },
      { x: 3, y: 10 },
      { x: 4, y: 20 },
      { x: 5, y: 25 },
    ],
    color: '#107c10',
  },
];

// Axis configuration for Cartesian coordinate system
const cartesianAxes: AxisConfig[] = [
  {
    type: AxisType.X,
    scaleType: ScaleType.Linear,
    title: 'X Axis',
    tickCount: 5,
    showGrid: true,
  },
  {
    type: AxisType.Y,
    scaleType: ScaleType.Linear,
    title: 'Y Axis',
    tickCount: 4,
    showGrid: true,
  },
];

// Axis configuration for Polar coordinate system
const polarAxes: AxisConfig[] = [
  {
    type: AxisType.Angular,
    scaleType: ScaleType.Linear,
    title: 'Angle (θ)',
    tickCount: 8,
    showGrid: true,
  },
  {
    type: AxisType.Radial,
    scaleType: ScaleType.Linear,
    title: 'Radius (r)',
    tickCount: 5,
    showGrid: true,
  },
];

// Axis configuration for Logarithmic coordinate system
const logarithmicAxes: AxisConfig[] = [
  {
    type: AxisType.LogX,
    scaleType: ScaleType.Log,
    title: 'Log X',
    tickCount: 5,
    showGrid: true,
  },
  {
    type: AxisType.LogY,
    scaleType: ScaleType.Log,
    title: 'Log Y',
    tickCount: 4,
    showGrid: true,
  },
];

/**
 * Example 1: Cartesian Chart (replaces CartesianChart)
 */
export const CartesianChartExample: React.FC = () => {
  return (
    <UnifiedChart
      data={exampleData}
      axes={cartesianAxes}
      coordinateSystem={CoordinateSystem.Cartesian}
      width={600}
      height={400}
      chartTitle="Cartesian Chart Example"
      margins={{ top: 20, bottom: 35, left: 40, right: 20 }}
    >
      {(props: any) => (
        <g>
          {/* Render lines for each series */}
          {exampleData.map((series, seriesIndex) => (
            <g key={series.key}>
              <path
                d={series.data
                  .map((point, index) => {
                    const position = props.getPointPosition(point);
                    return `${index === 0 ? 'M' : 'L'} ${position.x} ${position.y}`;
                  })
                  .join(' ')}
                stroke={series.color}
                strokeWidth={2}
                fill="none"
              />
              {/* Render points */}
              {series.data.map((point, pointIndex) => {
                const position = props.getPointPosition(point);
                return (
                  <circle
                    key={pointIndex}
                    cx={position.x}
                    cy={position.y}
                    r={4}
                    fill={series.color}
                    stroke="white"
                    strokeWidth={1}
                  />
                );
              })}
            </g>
          ))}
        </g>
      )}
    </UnifiedChart>
  );
};

/**
 * Example 2: Polar Chart (new capability)
 */
export const PolarChartExample: React.FC = () => {
  const polarData: ChartSeries[] = [
    {
      key: 'polar1',
      name: 'Polar Series',
      data: [
        { x: 0, y: 0, r: 10, theta: 0 },
        { x: 0, y: 0, r: 20, theta: Math.PI / 4 },
        { x: 0, y: 0, r: 15, theta: Math.PI / 2 },
        { x: 0, y: 0, r: 25, theta: (3 * Math.PI) / 4 },
        { x: 0, y: 0, r: 30, theta: Math.PI },
        { x: 0, y: 0, r: 20, theta: (5 * Math.PI) / 4 },
        { x: 0, y: 0, r: 15, theta: (3 * Math.PI) / 2 },
        { x: 0, y: 0, r: 10, theta: (7 * Math.PI) / 4 },
      ],
      color: '#0078d4',
    },
  ];

  return (
    <UnifiedChart
      data={polarData}
      axes={polarAxes}
      coordinateSystem={CoordinateSystem.Polar}
      width={600}
      height={400}
      chartTitle="Polar Chart Example"
      margins={{ top: 20, bottom: 35, left: 40, right: 20 }}
      coordinateSystemProps={{
        polar: {
          centerX: 300,
          centerY: 200,
          radius: 150,
          startAngle: 0,
          endAngle: 2 * Math.PI,
        },
      }}
    >
      {(props: any) => (
        <g>
          {polarData.map(series => (
            <g key={series.key}>
              <path
                d={series.data
                  .map((point, index) => {
                    const position = props.getPointPosition(point);
                    return `${index === 0 ? 'M' : 'L'} ${position.x} ${position.y}`;
                  })
                  .join(' ')}
                stroke={series.color}
                strokeWidth={2}
                fill="none"
              />
              {series.data.map((point, pointIndex) => {
                const position = props.getPointPosition(point);
                return (
                  <circle
                    key={pointIndex}
                    cx={position.x}
                    cy={position.y}
                    r={4}
                    fill={series.color}
                    stroke="white"
                    strokeWidth={1}
                  />
                );
              })}
            </g>
          ))}
        </g>
      )}
    </UnifiedChart>
  );
};

/**
 * Example 3: Logarithmic Chart (new capability)
 */
export const LogarithmicChartExample: React.FC = () => {
  const logData: ChartSeries[] = [
    {
      key: 'log1',
      name: 'Logarithmic Series',
      data: [
        { x: 1, y: 1 },
        { x: 10, y: 10 },
        { x: 100, y: 100 },
        { x: 1000, y: 1000 },
      ],
      color: '#0078d4',
    },
  ];

  return (
    <UnifiedChart
      data={logData}
      axes={logarithmicAxes}
      coordinateSystem={CoordinateSystem.Logarithmic}
      width={600}
      height={400}
      chartTitle="Logarithmic Chart Example"
      margins={{ top: 20, bottom: 35, left: 40, right: 20 }}
      coordinateSystemProps={{
        logarithmic: {
          base: 10,
          nice: true,
        },
      }}
    >
      {(props: any) => (
        <g>
          {logData.map(series => (
            <g key={series.key}>
              <path
                d={series.data
                  .map((point, index) => {
                    const position = props.getPointPosition(point);
                    return `${index === 0 ? 'M' : 'L'} ${position.x} ${position.y}`;
                  })
                  .join(' ')}
                stroke={series.color}
                strokeWidth={2}
                fill="none"
              />
              {series.data.map((point, pointIndex) => {
                const position = props.getPointPosition(point);
                return (
                  <circle
                    key={pointIndex}
                    cx={position.x}
                    cy={position.y}
                    r={4}
                    fill={series.color}
                    stroke="white"
                    strokeWidth={1}
                  />
                );
              })}
            </g>
          ))}
        </g>
      )}
    </UnifiedChart>
  );
};

/**
 * Migration helper: Convert old CartesianChart props to new UnifiedChart props
 */
export const migrateFromCartesianChart = (oldProps: any) => {
  // Convert old points format to new data format
  const data: ChartSeries[] = oldProps.points.map((point: any, index: number) => ({
    key: `series-${index}`,
    name: point.legend || `Series ${index + 1}`,
    data: point.data || [point],
    color: point.color,
  }));

  // Convert old axis types to new axis config
  const axes: AxisConfig[] = [];

  if (oldProps.xAxisType) {
    axes.push({
      type: AxisType.X,
      scaleType: getScaleTypeFromAxisType(oldProps.xAxisType),
      title: oldProps.xAxisTitle,
      tickCount: oldProps.xAxisTickCount,
      tickFormat: oldProps.tickFormat,
      showGrid: true,
    });
  }

  if (oldProps.yAxisType) {
    axes.push({
      type: AxisType.Y,
      scaleType: getScaleTypeFromAxisType(oldProps.yAxisType),
      title: oldProps.yAxisTitle,
      tickCount: oldProps.yAxisTickCount,
      tickFormat: oldProps.yAxisTickFormat,
      showGrid: true,
    });
  }

  return {
    data,
    axes,
    coordinateSystem: CoordinateSystem.Cartesian,
    width: oldProps.width,
    height: oldProps.height,
    margins: oldProps.margins,
    chartTitle: oldProps.chartTitle,
    hideLegend: oldProps.hideLegend,
    hideTooltip: oldProps.hideTooltip,
    calloutProps: oldProps.calloutProps,
    legendProps: oldProps.legendProps,
    svgProps: oldProps.svgProps,
    onChartMouseLeave: oldProps.onChartMouseLeave,
    componentRef: oldProps.componentRef,
  };
};

function getScaleTypeFromAxisType(axisType: any): ScaleType {
  switch (axisType) {
    case 'NumericAxis':
      return ScaleType.Linear;
    case 'DateAxis':
      return ScaleType.Time;
    case 'StringAxis':
      return ScaleType.Band;
    default:
      return ScaleType.Linear;
  }
}
