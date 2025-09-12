import * as React from 'react';
import { DeclarativeChart, Schema } from './DeclarativeChart';

/**
 * Test component to verify SunburstChart integration with DeclarativeChart
 */
export const SunburstIntegrationTest: React.FC = () => {
  const sunburstSchema: Schema = {
    plotlySchema: {
      data: [
        {
          type: 'sunburst',
          ids: ['Root', 'A', 'A1', 'A2', 'A3', 'B', 'B1', 'B2', 'C', 'C1', 'C2', 'C3'],
          parents: ['', 'Root', 'A', 'A', 'A', 'Root', 'B', 'B', 'Root', 'C', 'C', 'C'],
          labels: ['Root', 'A', 'A1', 'A2', 'A3', 'B', 'B1', 'B2', 'C', 'C1', 'C2', 'C3'],
          values: [100, 50, 20, 15, 15, 30, 15, 15, 20, 8, 6, 6],
          marker: {
            colors: [
              '#636efa',
              '#EF553B',
              '#00cc96',
              '#ab63fa',
              '#FFA15A',
              '#19d3f3',
              '#FF6692',
              '#B6E880',
              '#FF97FF',
              '#FECB52',
              '#636efa',
              '#EF553B',
            ],
          },
        },
      ],
      layout: {
        title: 'Sunburst Chart Integration Test',
        margin: { t: 50, l: 25, r: 25, b: 25 },
      },
    },
  };

  return (
    <div style={{ width: '100%', height: '400px' }}>
      <h3>Sunburst Chart Integration Test</h3>
      <DeclarativeChart chartSchema={sunburstSchema} />
    </div>
  );
};
