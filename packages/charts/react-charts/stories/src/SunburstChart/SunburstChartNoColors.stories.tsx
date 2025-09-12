import * as React from 'react';
import type { JSXElement } from '@fluentui/react-components';
import { SunburstChart, SunburstChartData } from '@fluentui/react-charts';

export const SunburstChartWithoutColors = (): JSXElement => {
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
          // No color specified - will use transparent fallback
          children: [
            { id: 'usa', label: 'USA', value: 60 },
            { id: 'canada', label: 'Canada', value: 15 },
            { id: 'mexico', label: 'Mexico', value: 10 },
          ],
        },
        {
          id: 'europe',
          label: 'Europe',
          value: 5,
          // No color specified - will use transparent fallback
          children: [
            { id: 'germany', label: 'Germany', value: 25 },
            { id: 'france', label: 'France', value: 20 },
            { id: 'uk', label: 'UK', value: 15 },
            { id: 'others-eu', label: 'Others', value: 10 },
          ],
        },
        {
          id: 'asia',
          label: 'Asia',
          value: 8,
          // No color specified - will use transparent fallback
          children: [
            { id: 'china', label: 'China', value: 35 },
            { id: 'japan', label: 'Japan', value: 20 },
            { id: 'india', label: 'India', value: 15 },
          ],
        },
      ],
    },
    chartTitle: 'Sales Distribution (No Colors)',
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

SunburstChartWithoutColors.parameters = {
  docs: {
    description: {
      story:
        'Example of a sunburst chart where no colors are specified in the data. The component will use transparent as fallback, demonstrating that it only renders colors present in the data.',
    },
  },
};
