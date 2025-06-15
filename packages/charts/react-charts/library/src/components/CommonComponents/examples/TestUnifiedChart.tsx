import * as React from 'react';
import { UnifiedChart } from '../Chart';
import { CoordinateSystem, AxisType, ScaleType, ChartSeries, AxisConfig } from '../Chart.types';

/**
 * Simple test component to verify the makeStyles fix works
 */
export const TestUnifiedChart: React.FC = () => {
  const data: ChartSeries[] = [
    {
      key: 'test1',
      name: 'Test Series',
      data: [
        { x: 1, y: 10 },
        { x: 2, y: 20 },
        { x: 3, y: 15 },
      ],
      color: '#0078d4',
    },
  ];

  const axes: AxisConfig[] = [
    {
      type: AxisType.X,
      scaleType: ScaleType.Linear,
      title: 'X Axis',
      tickCount: 5,
      showGrid: true,
    },
    {
      type: AxisType.Y,
      scaleType: ScaleType.Linear,
      title: 'Y Axis',
      tickCount: 4,
      showGrid: true,
    },
  ];

  return (
    <div style={{ width: '600px', height: '400px' }}>
      <UnifiedChart
        data={data}
        axes={axes}
        coordinateSystem={CoordinateSystem.Cartesian}
        width={600}
        height={400}
        chartTitle="Test Chart"
        margins={{ top: 20, bottom: 35, left: 40, right: 20 }}
      >
        {props => (
          <g>
            {data.map(series => (
              <g key={series.key}>
                <path
                  d={series.data
                    .map((point, index) => {
                      const position = props.getPointPosition(point);
                      return `${index === 0 ? 'M' : 'L'} ${position.x} ${position.y}`;
                    })
                    .join(' ')}
                  stroke={series.color}
                  strokeWidth={2}
                  fill="none"
                />
                {series.data.map((point, pointIndex) => {
                  const position = props.getPointPosition(point);
                  return (
                    <circle
                      key={pointIndex}
                      cx={position.x}
                      cy={position.y}
                      r={4}
                      fill={series.color}
                      stroke="white"
                      strokeWidth={1}
                    />
                  );
                })}
              </g>
            ))}
          </g>
        )}
      </UnifiedChart>
    </div>
  );
};
