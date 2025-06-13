import * as React from 'react';
import { LineChart } from './LineChart';
import { ILineChartProps } from './LineChart.types';

/**
 * Example demonstrating how to use gradient support in LineChart
 */
export const LineChartGradientExample: React.FunctionComponent = () => {
  const data: ILineChartProps['data'] = {
    chartTitle: 'Line Chart with Gradient Support',
    lineChartData: [
      {
        legend: 'Line with Custom Gradient',
        data: [
          { x: 1, y: 10 },
          { x: 2, y: 20 },
          { x: 3, y: 15 },
          { x: 4, y: 25 },
          { x: 5, y: 30 },
        ],
        // Custom gradient colors [startColor, endColor]
        gradient: ['#ff0000', '#00ff00'],
      },
      {
        legend: 'Line with Default Gradient',
        data: [
          { x: 1, y: 5 },
          { x: 2, y: 15 },
          { x: 3, y: 10 },
          { x: 4, y: 20 },
          { x: 5, y: 25 },
        ],
        // No gradient specified - will use default gradient palette
      },
      {
        legend: 'Line with Blue to Purple Gradient',
        data: [
          { x: 1, y: 8 },
          { x: 2, y: 18 },
          { x: 3, y: 12 },
          { x: 4, y: 22 },
          { x: 5, y: 28 },
        ],
        gradient: ['#0066cc', '#9933cc'],
      },
    ],
  };

  return (
    <div style={{ width: '600px', height: '400px' }}>
      <LineChart data={data} enableGradient={true} height={400} width={600} />
    </div>
  );
};

export default LineChartGradientExample;
