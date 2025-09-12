import * as React from 'react';
import { DeclarativeChart } from './DeclarativeChart';

export const TestSunburst = () => {
  const sunburstSchema = {
    plotlySchema: {
      data: [
        {
          type: 'sunburst',
          labels: ['A', 'B', 'C', 'D'],
          parents: ['', 'A', 'A', 'B'],
          values: [10, 20, 30, 40],
          marker: {
            colors: ['#ff0000', '#00ff00', '#0000ff', '#ffff00'],
          },
        },
      ],
      layout: {
        title: 'Test Sunburst',
      },
    },
  };

  console.log('Sunburst schema:', JSON.stringify(sunburstSchema, null, 2));

  return (
    <div>
      <h2>Test Sunburst Chart</h2>
      <DeclarativeChart chartSchema={sunburstSchema} />
    </div>
  );
};
