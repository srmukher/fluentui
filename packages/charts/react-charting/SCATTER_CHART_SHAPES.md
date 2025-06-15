# Scatter Chart Shapes

The Scatter Chart component now supports different marker shapes for data points. This allows for better visual distinction between different data series and improved accessibility.

## Available Shapes

The following shapes are available for scatter chart markers:

- **circle** - Circular markers (default)
- **square** - Square markers
- **triangle** - Triangular markers
- **diamond** - Diamond-shaped markers
- **pyramid** - Pyramid-shaped markers
- **hexagon** - Hexagonal markers
- **pentagon** - Pentagonal markers
- **octagon** - Octagonal markers
- **cross** - Cross-shaped markers
- **x** - X-shaped markers
- **rectangle** - Rectangular markers

## Usage

### Setting Shape for Individual Data Points

You can set the shape for individual data points by adding a `shape` property to each data point:

```typescript
const data: IChartProps = {
  scatterChartData: [
    {
      legend: 'My Series',
      data: [
        {
          x: 10,
          y: 50,
          markerSize: 12,
          shape: 'circle', // Individual point shape
        },
        {
          x: 20,
          y: 75,
          markerSize: 15,
          shape: 'square', // Different shape for this point
        },
      ],
      color: '#0078d4',
    },
  ],
};
```

### Setting Shape for Entire Series

You can also set a default shape for an entire series using the `legendShape` property:

```typescript
const data: IChartProps = {
  scatterChartData: [
    {
      legend: 'Circle Series',
      legendShape: 'circle', // Default shape for all points in this series
      data: [
        {
          x: 10,
          y: 50,
          markerSize: 12,
          // shape property is optional - will use legendShape if not specified
        },
        {
          x: 20,
          y: 75,
          markerSize: 15,
        },
      ],
      color: '#0078d4',
    },
    {
      legend: 'Square Series',
      legendShape: 'square',
      data: [
        {
          x: 30,
          y: 100,
          markerSize: 12,
        },
      ],
      color: '#107c10',
    },
  ],
};
```

### Shape Precedence

When both `shape` (individual point) and `legendShape` (series) are specified, the individual point's `shape` takes precedence. If neither is specified, the default is `circle`.

## Legend Integration

The legend automatically reflects the shape used for each series. When you set `legendShape` on a series, the legend will display that shape instead of the default rectangle.

## Accessibility

Each shape maintains proper accessibility attributes:

- `role="img"` for screen readers
- `aria-label` with descriptive text
- Proper focus management
- Keyboard navigation support

## Examples

### Basic Example with Different Shapes

```typescript
import { ScatterChart, IChartProps, DataVizPalette } from '@fluentui/react-charting';

const data: IChartProps = {
  chartTitle: 'Scatter Chart with Different Shapes',
  scatterChartData: [
    {
      legend: 'Circle Points',
      legendShape: 'circle',
      data: [
        { x: 10, y: 50, markerSize: 12, shape: 'circle' },
        { x: 20, y: 75, markerSize: 15, shape: 'circle' },
      ],
      color: DataVizPalette.color1,
    },
    {
      legend: 'Square Points',
      legendShape: 'square',
      data: [
        { x: 40, y: 120, markerSize: 12, shape: 'square' },
        { x: 50, y: 150, markerSize: 15, shape: 'square' },
      ],
      color: DataVizPalette.color2,
    },
    {
      legend: 'Triangle Points',
      legendShape: 'triangle',
      data: [
        { x: 70, y: 200, markerSize: 12, shape: 'triangle' },
        { x: 80, y: 220, markerSize: 15, shape: 'triangle' },
      ],
      color: DataVizPalette.color3,
    },
  ],
};

<ScatterChart data={data} height={400} width={700} margin={{ top: 20, right: 20, bottom: 30, left: 40 }} />;
```

### Mixed Shapes in Single Series

```typescript
const data: IChartProps = {
  scatterChartData: [
    {
      legend: 'Mixed Shapes',
      data: [
        { x: 10, y: 50, markerSize: 12, shape: 'circle' },
        { x: 20, y: 75, markerSize: 15, shape: 'square' },
        { x: 30, y: 100, markerSize: 18, shape: 'triangle' },
        { x: 40, y: 125, markerSize: 20, shape: 'diamond' },
      ],
      color: '#0078d4',
    },
  ],
};
```

## Best Practices

1. **Consistency**: Use consistent shapes within a series for better visual clarity
2. **Contrast**: Choose shapes that are easily distinguishable from each other
3. **Accessibility**: Ensure sufficient color contrast and consider colorblind users
4. **Size**: Larger shapes may be more visible but can clutter the chart
5. **Legend**: Always include a legend when using multiple shapes to help users understand the mapping

## Migration from Previous Versions

Existing scatter charts will continue to work without changes. The default behavior remains the same (circular markers). To add shapes to existing charts, simply add the `shape` or `legendShape` properties as needed.
