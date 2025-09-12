import * as React from 'react';
import { render } from '@testing-library/react';
import { SunburstChart } from './SunburstChart';
import { SunburstChartData } from './SunburstChart.types';

describe('SunburstChart', () => {
  const testData: SunburstChartData = {
    root: {
      id: 'root',
      label: 'Root',
      value: 100,
      children: [
        {
          id: 'child1',
          label: 'Child 1',
          value: 60,
          children: [
            { id: 'grandchild1', label: 'Grandchild 1', value: 30 },
            { id: 'grandchild2', label: 'Grandchild 2', value: 30 },
          ],
        },
        { id: 'child2', label: 'Child 2', value: 40 },
      ],
    },
  };

  it('renders without crashing', () => {
    render(<SunburstChart data={testData} />);
  });

  it('renders with flat data structure', () => {
    const flatData: SunburstChartData = {
      flat: {
        ids: ['root', 'child1', 'child2', 'grandchild1', 'grandchild2'],
        parents: ['', 'root', 'root', 'child1', 'child1'],
        labels: ['Root', 'Child 1', 'Child 2', 'Grandchild 1', 'Grandchild 2'],
        values: [0, 30, 40, 15, 15],
      },
    };
    render(<SunburstChart data={flatData} />);
  });

  it('renders with custom dimensions', () => {
    render(<SunburstChart data={testData} width={400} height={400} />);
  });

  it('renders with inner radius', () => {
    render(<SunburstChart data={testData} innerRadius={50} />);
  });

  it('renders with custom level thickness', () => {
    render(<SunburstChart data={testData} levelThickness={60} />);
  });

  it('renders with patterns when pattern data is provided', () => {
    const dataWithPatterns: SunburstChartData = {
      flat: {
        ids: ['root', 'child1', 'child2'],
        parents: ['', 'root', 'root'],
        labels: ['Root', 'Child 1', 'Child 2'],
        values: [0, 60, 40],
        marker: {
          colors: ['#636EFA', '#EF553B', '#00CC96'],
          pattern: {
            shape: ['', '/', 'x'],
          },
        },
      },
    };
    render(<SunburstChart data={dataWithPatterns} />);
  });
});
