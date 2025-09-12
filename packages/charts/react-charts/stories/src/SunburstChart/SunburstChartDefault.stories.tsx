import * as React from 'react';
import type { JSXElement } from '@fluentui/react-components';
import { SunburstChart, SunburstChartData } from '@fluentui/react-charts';

export const SunburstChartBasic = (): JSXElement => {
  const data: SunburstChartData = {
    root: {
      id: 'root',
      label: 'Total Sales',
      value: 0, // remainder mode: this is the remainder
      children: [
        {
          id: 'north-america',
          label: 'North America',
          value: 10,
          color: '#636EFA', // Specify color directly in data
          children: [
            { id: 'usa', label: 'USA', value: 60, color: '#636EFA' },
            { id: 'canada', label: 'Canada', value: 15, color: '#636EFA' },
            { id: 'mexico', label: 'Mexico', value: 10, color: '#636EFA' },
          ],
        },
        {
          id: 'europe',
          label: 'Europe',
          value: 5,
          color: '#EF553B', // Red for Europe
          children: [
            { id: 'germany', label: 'Germany', value: 25, color: '#EF553B' },
            { id: 'france', label: 'France', value: 20, color: '#EF553B' },
            { id: 'uk', label: 'UK', value: 15, color: '#EF553B' },
            { id: 'others-eu', label: 'Others', value: 10, color: '#EF553B' },
          ],
        },
        {
          id: 'asia',
          label: 'Asia',
          value: 8,
          color: '#00CC96', // Green for Asia
          children: [
            { id: 'china', label: 'China', value: 35, color: '#00CC96' },
            { id: 'japan', label: 'Japan', value: 20, color: '#00CC96' },
            { id: 'india', label: 'India', value: 15, color: '#00CC96' },
          ],
        },
      ],
    },
    chartTitle: 'Global Sales Distribution',
  };

  return (
    <SunburstChart
      data={data}
      width={400}
      height={400}
      innerRadius={0}
      levelThickness={40}
      branchValues="remainder"
      culture={typeof window !== 'undefined' ? window.navigator.language : 'en-us'}
    />
  );
};

SunburstChartBasic.parameters = {
  docs: {
    description: {
      story:
        'A basic sunburst chart showing hierarchical data with colors specified directly in the data. The component only uses colors that are provided in the data structure.',
    },
  },
};
