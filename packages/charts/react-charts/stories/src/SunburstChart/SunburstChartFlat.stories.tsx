import * as React from 'react';
import type { JSXElement } from '@fluentui/react-components';
import { SunburstChart, SunburstChartData } from '@fluentui/react-charts';

export const SunburstChartFlat = (): JSXElement => {
  // This example uses the flat data structure (Plotly schema) with patterns
  const data: SunburstChartData = {
    flat: {
      ids: [
        'North America',
        'Europe',
        'Asia',
        'USA',
        'Canada',
        'Mexico',
        'Germany',
        'France',
        'UK',
        'Others Europe',
        'China',
        'Japan',
        'India',
      ],
      parents: [
        '',
        '',
        '',
        'North America',
        'North America',
        'North America',
        'Europe',
        'Europe',
        'Europe',
        'Europe',
        'Asia',
        'Asia',
        'Asia',
      ],
      labels: [
        'North America',
        'Europe',
        'Asia',
        'USA',
        'Canada',
        'Mexico',
        'Germany',
        'France',
        'UK',
        'Others Europe',
        'China',
        'Japan',
        'India',
      ],
      values: [0, 0, 0, 60, 15, 10, 25, 20, 15, 10, 35, 20, 15],
      marker: {
        colors: [
          '#636EFA',
          '#EF553B',
          '#00CC96',
          '#636EFA',
          '#636EFA',
          '#636EFA',
          '#EF553B',
          '#EF553B',
          '#EF553B',
          '#EF553B',
          '#00CC96',
          '#00CC96',
          '#00CC96',
        ],
        pattern: {
          shape: ['', '', '', '', '/', 'x', '', '/', 'x', '.', '', '/', 'x'],
        },
      },
    },
    chartTitle: 'Sales by Region with Patterns',
  };

  return (
    <SunburstChart
      data={data}
      width={500}
      height={500}
      innerRadius={30}
      levelThickness={50}
      branchValues="remainder"
      showLabelsInPercent={false}
      culture={typeof window !== 'undefined' ? window.navigator.language : 'en-us'}
    />
  );
};

SunburstChartFlat.parameters = {
  docs: {
    description: {
      story:
        'A sunburst chart using flat data structure (Plotly schema) with pattern fills for some segments. Colors are explicitly defined in the marker.colors array.',
    },
  },
};
