# Migration Guide: From CartesianChart to UnifiedChart

This guide explains how to migrate from the old `CartesianChart` component to the new unified `UnifiedChart` component that supports multiple coordinate systems.

## Overview

The new `UnifiedChart` component replaces `CartesianChart` and adds support for:

- **Cartesian coordinates** (x, y) - same as before
- **Polar coordinates** (r, θ) - new capability
- **Logarithmic coordinates** - new capability

## Key Differences

### 1. Data Structure

**Old CartesianChart:**

```typescript
const points = [
  {
    legend: 'Series 1',
    data: [
      { x: 1, y: 10 },
      { x: 2, y: 20 },
    ],
    color: '#0078d4',
  },
];
```

**New UnifiedChart:**

```typescript
const data: ChartSeries[] = [
  {
    key: 'series1',
    name: 'Series 1',
    data: [
      { x: 1, y: 10 },
      { x: 2, y: 20 },
    ],
    color: '#0078d4',
  },
];
```

### 2. Axis Configuration

**Old CartesianChart:**

```typescript
// Axis types were inferred from data
xAxisType={XAxisTypes.NumericAxis}
yAxisType={YAxisType.NumericAxis}
```

**New UnifiedChart:**

```typescript
const axes: AxisConfig[] = [
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
```

## Migration Examples

### Example 1: Basic Line Chart Migration

**Before (CartesianChart):**

```typescript
import { CartesianChart } from './CommonComponents';

const LineChart = () => {
  const points = [
    {
      legend: 'Sales',
      data: [
        { x: 1, y: 10 },
        { x: 2, y: 20 },
        { x: 3, y: 15 },
      ],
      color: '#0078d4',
    },
  ];

  return (
    <CartesianChart
      points={points}
      chartType={ChartTypes.LineChart}
      xAxisType={XAxisTypes.NumericAxis}
      yAxisType={YAxisType.NumericAxis}
      width={600}
      height={400}
      margins={{ top: 20, bottom: 35, left: 40, right: 20 }}
    >
      {props => <g>{/* Render chart content */}</g>}
    </CartesianChart>
  );
};
```

**After (UnifiedChart):**

```typescript
import { UnifiedChart, CoordinateSystem, AxisType, ScaleType } from './CommonComponents';

const LineChart = () => {
  const data = [
    {
      key: 'sales',
      name: 'Sales',
      data: [
        { x: 1, y: 10 },
        { x: 2, y: 20 },
        { x: 3, y: 15 },
      ],
      color: '#0078d4',
    },
  ];

  const axes = [
    {
      type: AxisType.X,
      scaleType: ScaleType.Linear,
      title: 'Time',
      tickCount: 5,
      showGrid: true,
    },
    {
      type: AxisType.Y,
      scaleType: ScaleType.Linear,
      title: 'Sales',
      tickCount: 4,
      showGrid: true,
    },
  ];

  return (
    <UnifiedChart
      data={data}
      axes={axes}
      coordinateSystem={CoordinateSystem.Cartesian}
      width={600}
      height={400}
      margins={{ top: 20, bottom: 35, left: 40, right: 20 }}
    >
      {props => (
        <g>
          {/* Render chart content using props.getPointPosition() */}
          {data.map(series => (
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
            </g>
          ))}
        </g>
      )}
    </UnifiedChart>
  );
};
```

### Example 2: Polar Chart (New Capability)

```typescript
const PolarChart = () => {
  const data = [
    {
      key: 'polar1',
      name: 'Polar Series',
      data: [
        { x: 0, y: 0, r: 10, theta: 0 },
        { x: 0, y: 0, r: 20, theta: Math.PI / 4 },
        { x: 0, y: 0, r: 15, theta: Math.PI / 2 },
      ],
      color: '#0078d4',
    },
  ];

  const axes = [
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

  return (
    <UnifiedChart
      data={data}
      axes={axes}
      coordinateSystem={CoordinateSystem.Polar}
      width={600}
      height={400}
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
      {props => <g>{/* Render polar chart content */}</g>}
    </UnifiedChart>
  );
};
```

### Example 3: Logarithmic Chart (New Capability)

```typescript
const LogarithmicChart = () => {
  const data = [
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

  const axes = [
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

  return (
    <UnifiedChart
      data={data}
      axes={axes}
      coordinateSystem={CoordinateSystem.Logarithmic}
      width={600}
      height={400}
      coordinateSystemProps={{
        logarithmic: {
          base: 10,
          nice: true,
        },
      }}
    >
      {props => <g>{/* Render logarithmic chart content */}</g>}
    </UnifiedChart>
  );
};
```

## Key Changes in Render Props

### Old CartesianChart:

```typescript
children={(props: IChildProps) => {
  // props.xScale, props.yScale, props.containerWidth, props.containerHeight
  return <g>{/* chart content */}</g>;
}}
```

### New UnifiedChart:

```typescript
children={(props: ChartRenderProps) => {
  // props.scales, props.getPointPosition(), props.getPointFromPosition()
  // props.containerWidth, props.containerHeight, props.coordinateSystem
  return <g>{/* chart content */}</g>;
}}
```

## Migration Helper Function

Use the provided migration helper to convert old props:

```typescript
import { migrateFromCartesianChart } from './examples/UnifiedChartExample';

const oldProps = {
  points: [...],
  xAxisType: XAxisTypes.NumericAxis,
  yAxisType: YAxisType.NumericAxis,
  // ... other props
};

const newProps = migrateFromCartesianChart(oldProps);

return <UnifiedChart {...newProps}>{/* children */}</UnifiedChart>;
```

## Benefits of Migration

1. **Unified API**: Same component for all chart types
2. **New Capabilities**: Polar and logarithmic charts
3. **Better Type Safety**: Full TypeScript support
4. **Improved Performance**: Shared hooks and optimized rendering
5. **Enhanced Flexibility**: Customizable axis configurations
6. **Future-Proof**: Easy to add new coordinate systems

## Breaking Changes

1. **Data Structure**: `points` → `data` with different format
2. **Axis Configuration**: Explicit axis config instead of inferred types
3. **Render Props**: Different props structure in children function
4. **Coordinate System**: Must specify coordinate system type

## Support

For questions or issues with migration, refer to the examples in `examples/UnifiedChartExample.tsx` or create an issue in the repository.
