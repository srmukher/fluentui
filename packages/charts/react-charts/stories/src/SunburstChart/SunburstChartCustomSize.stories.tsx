import * as React from 'react';
import type { JSXElement } from '@fluentui/react-components';
import { SunburstChart, SunburstChartData } from '@fluentui/react-charts';

export const SunburstChartCustomSize = (): JSXElement => {
  // Example with custom dimensions and increased inner radius
  const data: SunburstChartData = {
    chartTitle: 'Department Budget Distribution',
    root: {
      id: 'root',
      label: 'Company',
      children: [
        {
          id: 'engineering',
          label: 'Engineering',
          value: 100,
          color: '#636EFA', // Blue for Engineering
          children: [
            {
              id: 'frontend',
              label: 'Frontend',
              value: 40,
              color: '#636EFA',
              children: [
                { id: 'react', label: 'React', value: 25, color: '#636EFA' },
                { id: 'angular', label: 'Angular', value: 15, color: '#636EFA' },
              ],
            },
            {
              id: 'backend',
              label: 'Backend',
              value: 35,
              color: '#636EFA',
              children: [
                { id: 'nodejs', label: 'Node.js', value: 20, color: '#636EFA' },
                { id: 'python', label: 'Python', value: 15, color: '#636EFA' },
              ],
            },
            { id: 'devops', label: 'DevOps', value: 25, color: '#636EFA' },
          ],
        },
        {
          id: 'marketing',
          label: 'Marketing',
          value: 60,
          color: '#EF553B', // Red for Marketing
          children: [
            { id: 'digital', label: 'Digital', value: 35, color: '#EF553B' },
            { id: 'traditional', label: 'Traditional', value: 25, color: '#EF553B' },
          ],
        },
        {
          id: 'sales',
          label: 'Sales',
          value: 80,
          color: '#00CC96', // Green for Sales
          children: [
            { id: 'enterprise', label: 'Enterprise', value: 50, color: '#00CC96' },
            { id: 'smb', label: 'SMB', value: 30, color: '#00CC96' },
          ],
        },
      ],
    },
  };

  return (
    <SunburstChart
      data={data}
      width={700}
      height={600}
      innerRadius={80}
      levelThickness={80}
      branchValues="total"
      showLabelsInPercent={true}
      culture={typeof window !== 'undefined' ? window.navigator.language : 'en-us'}
    />
  );
};

SunburstChartCustomSize.parameters = {
  docs: {
    description: {
      story:
        'A sunburst chart with custom dimensions (700x600), larger inner radius (80px), and thicker levels (80px). Colors are explicitly defined for each department (Blue for Engineering, Red for Marketing, Green for Sales).',
    },
  },
};
