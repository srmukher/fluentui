# LineChart Gradient Support

The LineChart component now supports gradient fills for lines, allowing you to create visually appealing charts with smooth color transitions.

## Features

- **Custom Gradients**: Define your own gradient colors for each line
- **Default Gradient Palette**: Automatic gradient colors when custom gradients are not specified
- **Theme Support**: Gradients adapt to light/dark themes
- **Performance Optimized**: Works with both optimized and non-optimized rendering modes

## Usage

### Basic Gradient Usage

To enable gradients, simply set the `enableGradient` prop to `true`:

```tsx
import { LineChart } from '@fluentui/react-charting';

const data = {
  lineChartData: [
    {
      legend: 'Sales',
      data: [
        { x: 1, y: 10 },
        { x: 2, y: 20 },
        { x: 3, y: 15 },
        { x: 4, y: 25 },
        { x: 5, y: 30 },
      ],
    },
  ],
};

<LineChart data={data} enableGradient={true} height={400} width={600} />;
```

### Custom Gradient Colors

You can specify custom gradient colors for each line using the `gradient` property:

```tsx
const data = {
  lineChartData: [
    {
      legend: 'Revenue',
      data: [
        { x: 1, y: 10 },
        { x: 2, y: 20 },
        { x: 3, y: 15 },
        { x: 4, y: 25 },
        { x: 5, y: 30 },
      ],
      // Custom gradient: [startColor, endColor]
      gradient: ['#ff0000', '#00ff00'], // Red to Green
    },
    {
      legend: 'Profit',
      data: [
        { x: 1, y: 5 },
        { x: 2, y: 15 },
        { x: 3, y: 10 },
        { x: 4, y: 20 },
        { x: 5, y: 25 },
      ],
      gradient: ['#0066cc', '#9933cc'], // Blue to Purple
    },
  ],
};
```

### Mixed Gradient and Solid Colors

You can mix lines with gradients and solid colors in the same chart:

```tsx
const data = {
  lineChartData: [
    {
      legend: 'Gradient Line',
      data: [...],
      gradient: ['#ff0000', '#00ff00'],
    },
    {
      legend: 'Solid Color Line',
      data: [...],
      color: '#0000ff', // This line will use solid blue
    },
  ],
};
```

## Gradient Direction

Gradients are applied horizontally from left to right across each line segment. The gradient direction is:

- **Start**: Left side of the line segment
- **End**: Right side of the line segment

## Default Gradient Palette

When `enableGradient` is `true` but no custom gradient is specified, the component uses a predefined gradient palette that:

- Automatically cycles through different gradient combinations
- Adapts to light and dark themes
- Provides visually distinct gradients for multiple lines

## Theme Support

Gradients automatically adapt to the current theme:

- **Light Theme**: Uses lighter gradient variations
- **Dark Theme**: Uses darker gradient variations

## Performance Considerations

- Gradient support works with both `optimizeLargeData` modes
- SVG gradients are efficiently rendered using `<linearGradient>` elements
- No performance impact when `enableGradient` is `false`

## API Reference

### ILineChartProps

| Property         | Type      | Default | Description                     |
| ---------------- | --------- | ------- | ------------------------------- |
| `enableGradient` | `boolean` | `false` | Enable gradient fills for lines |

### ILineChartPoints

| Property   | Type               | Description                                              |
| ---------- | ------------------ | -------------------------------------------------------- |
| `gradient` | `[string, string]` | Optional custom gradient colors `[startColor, endColor]` |

## Examples

See `LineChartGradientExample.tsx` for a complete working example of gradient usage.

## Browser Support

Gradient support requires SVG `<linearGradient>` support, which is available in all modern browsers:

- Chrome 1+
- Firefox 1.5+
- Safari 3+
- Edge 12+
- IE 9+
