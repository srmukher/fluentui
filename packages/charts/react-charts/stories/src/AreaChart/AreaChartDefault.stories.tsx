import * as React from 'react';
import {
  AreaChart,
  AxisConfig,
  AxisType,
  ChartSeries,
  CoordinateSystem,
  ScaleType,
  UnifiedChart,
} from '@fluentui/react-charts';
import { Switch, Field, Radio, RadioGroup } from '@fluentui/react-components';

export const AreaChartBasic = () => {
  const [width, setWidth] = React.useState<number>(700);
  const [height, setHeight] = React.useState<number>(300);
  const [isCalloutSelected, setIsCalloutSelected] = React.useState<boolean>(false);
  const [showAxisTitles, setShowAxisTitles] = React.useState<boolean>(true);
  const [legendMultiSelect, setLegendMultiSelect] = React.useState<boolean>(false);
  const [changeChartMode, setChangeChartMode] = React.useState<boolean>(false);

  React.useEffect(() => {
    const style = document.createElement('style');
    const focusStylingCSS = `
      .containerDiv [contentEditable=true]:focus,
      .containerDiv [tabindex]:focus,
      .containerDiv area[href]:focus,
      .containerDiv button:focus,
      .containerDiv iframe:focus,
      .containerDiv input:focus,
      .containerDiv select:focus,
      .containerDiv textarea:focus {
        outline: -webkit-focus-ring-color auto 5px;
      }
    `;
    style.appendChild(document.createTextNode(focusStylingCSS));
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const _onWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWidth(parseInt(e.target.value, 10));
  };
  const _onHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHeight(parseInt(e.target.value, 10));
  };

  const _onSwitchAxisTitlesCheckChange = React.useCallback(ev => {
    setShowAxisTitles(ev.currentTarget.checked);
  }, []);

  const _onSwitchLegendMultiSelect = React.useCallback(ev => {
    setLegendMultiSelect(ev.currentTarget.checked);
  }, []);

  const _onSwitchChartMode = React.useCallback(ev => {
    setChangeChartMode(ev.currentTarget.checked);
  }, []);

  const chart1Points = [
    {
      x: 20,
      y: 7000,
      xAxisCalloutData: '2018/01/01',
      yAxisCalloutData: '35%',
    },
    {
      x: 25,
      y: 9000,
      xAxisCalloutData: '2018/01/15',
      yAxisCalloutData: '45%',
    },
    {
      x: 30,
      y: 13000,
      xAxisCalloutData: '2018/01/28',
      yAxisCalloutData: '65%',
    },
    {
      x: 35,
      y: 15000,
      xAxisCalloutData: '2018/02/01',
      yAxisCalloutData: '75%',
    },
    {
      x: 40,
      y: 11000,
      xAxisCalloutData: '2018/03/01',
      yAxisCalloutData: '55%',
    },
    {
      x: 45,
      y: 8760,
      xAxisCalloutData: '2018/03/15',
      yAxisCalloutData: '43%',
    },
    {
      x: 50,
      y: 3500,
      xAxisCalloutData: '2018/03/28',
      yAxisCalloutData: '18%',
    },
    {
      x: 55,
      y: 20000,
      xAxisCalloutData: '2018/04/04',
      yAxisCalloutData: '100%',
    },
    {
      x: 60,
      y: 17000,
      xAxisCalloutData: '2018/04/15',
      yAxisCalloutData: '85%',
    },
    {
      x: 65,
      y: 1000,
      xAxisCalloutData: '2018/05/05',
      yAxisCalloutData: '5%',
    },
    {
      x: 70,
      y: 12000,
      xAxisCalloutData: '2018/06/01',
      yAxisCalloutData: '60%',
    },
    {
      x: 75,
      y: 6876,
      xAxisCalloutData: '2018/01/15',
      yAxisCalloutData: '34%',
    },
    {
      x: 80,
      y: 12000,
      xAxisCalloutData: '2018/04/30',
      yAxisCalloutData: '60%',
    },
    {
      x: 85,
      y: 7000,
      xAxisCalloutData: '2018/05/04',
      yAxisCalloutData: '35%',
    },
    {
      x: 90,
      y: 10000,
      xAxisCalloutData: '2018/06/01',
      yAxisCalloutData: '50%',
    },
  ];

  const chart2Points = chart1Points.map((point, index) => {
    return {
      x: point.x,
      y: point.y + 5000,
      xAxisCalloutData: point.xAxisCalloutData,
      yAxisCalloutData: point.yAxisCalloutData,
    };
  });

  const chart3Points = chart1Points.map((point, index) => {
    return {
      x: point.x,
      y: point.y + 7000,
      xAxisCalloutData: point.xAxisCalloutData,
      yAxisCalloutData: point.yAxisCalloutData,
    };
  });

  const chartPoints = [
    {
      legend: 'legend1',
      data: chart1Points,
    },
    {
      legend: 'legend2',
      data: chart2Points,
    },
    {
      legend: 'legend3',
      data: chart3Points,
    },
  ];

  const chartData = {
    chartTitle: 'Area chart basic example',
    lineChartData: chartPoints,
  };

  const exampleData: ChartSeries[] = [
    {
      key: 'series1',
      name: 'Series 1',
      data: [
        { x: 1, y: 10 },
        { x: 2, y: 20 },
        { x: 3, y: 15 },
        { x: 4, y: 25 },
        { x: 5, y: 30 },
      ],
      color: '#0078d4',
    },
    {
      key: 'series2',
      name: 'Series 2',
      data: [
        { x: 1, y: 5 },
        { x: 2, y: 15 },
        { x: 3, y: 10 },
        { x: 4, y: 20 },
        { x: 5, y: 25 },
      ],
      color: '#107c10',
    },
  ];

  // Axis configuration for Cartesian coordinate system
  const cartesianAxes: AxisConfig[] = [
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

  const polarAxes: AxisConfig[] = [
    {
      type: AxisType.Angular,
      scaleType: ScaleType.Linear,
      title: 'Angle (θ)',
      tickCount: 8,
      showGrid: true,
    },
    {
      type: AxisType.Radial,
      scaleType: ScaleType.Linear,
      title: 'Radius (r)',
      tickCount: 5,
      showGrid: true,
    },
  ];

  // Axis configuration for Logarithmic coordinate system
  const logarithmicAxes: AxisConfig[] = [
    {
      type: AxisType.LogX,
      scaleType: ScaleType.Log,
      title: 'Log X',
      tickCount: 5,
      showGrid: true,
    },
    {
      type: AxisType.LogY,
      scaleType: ScaleType.Log,
      title: 'Log Y',
      tickCount: 4,
      showGrid: true,
    },
  ];

  const CartesianChartExample: React.FC = () => {
    return (
      <UnifiedChart
        data={exampleData}
        axes={cartesianAxes}
        coordinateSystem={CoordinateSystem.Cartesian}
        width={600}
        height={400}
        chartTitle="Cartesian Chart Example"
        margins={{ top: 20, bottom: 35, left: 40, right: 20 }}
      >
        {(props: any) => (
          <g>
            {/* Render lines for each series */}
            {exampleData.map((series, seriesIndex) => (
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
                {/* Render points */}
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
    );
  };

  /**
   * Example 2: Polar Chart (new capability)
   */
  const PolarChartExample: React.FC = () => {
    const polarData: ChartSeries[] = [
      {
        key: 'polar1',
        name: 'Polar Series',
        data: [
          { x: 0, y: 0, r: 10, theta: 0 },
          { x: 0, y: 0, r: 20, theta: Math.PI / 4 },
          { x: 0, y: 0, r: 15, theta: Math.PI / 2 },
          { x: 0, y: 0, r: 25, theta: (3 * Math.PI) / 4 },
          { x: 0, y: 0, r: 30, theta: Math.PI },
          { x: 0, y: 0, r: 20, theta: (5 * Math.PI) / 4 },
          { x: 0, y: 0, r: 15, theta: (3 * Math.PI) / 2 },
          { x: 0, y: 0, r: 10, theta: (7 * Math.PI) / 4 },
        ],
        color: '#0078d4',
      },
    ];

    return (
      <UnifiedChart
        data={polarData}
        axes={polarAxes}
        coordinateSystem={CoordinateSystem.Polar}
        width={600}
        height={400}
        chartTitle="Polar Chart Example"
        margins={{ top: 20, bottom: 35, left: 40, right: 20 }}
        coordinateSystemProps={{
          polar: {
            startAngle: 0,
            endAngle: 2 * Math.PI,
          },
        }}
      >
        {(props: any) => (
          <g>
            {polarData.map(series => (
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
    );
  };

  /**
   * Example 3: Logarithmic Chart (new capability)
   */
  const LogarithmicChartExample: React.FC = () => {
    const logData: ChartSeries[] = [
      {
        key: 'log1',
        name: 'Logarithmic Series',
        data: [
          { x: 1, y: 1 },
          { x: 10, y: 10 },
          { x: 100, y: 100 },
          { x: 1000, y: 1000 },
        ],
        color: '#0078d4',
      },
    ];

    return (
      <UnifiedChart
        data={logData}
        axes={logarithmicAxes}
        coordinateSystem={CoordinateSystem.Logarithmic}
        width={600}
        height={400}
        chartTitle="Logarithmic Chart Example"
        margins={{ top: 20, bottom: 35, left: 40, right: 20 }}
        coordinateSystemProps={{
          logarithmic: {
            base: 10,
            nice: true,
          },
        }}
      >
        {(props: any) => (
          <g>
            {logData.map(series => (
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
    );
  };

  const rootStyle = { width: `${width}px`, height: `${height}px` };

  return (
    <>
      <div style={{ display: 'flex' }}>
        <label htmlFor="changeWidth_Basic">Change Width:</label>
        <input
          type="range"
          value={width}
          min={200}
          max={1000}
          id="changeWidth_Basic"
          onChange={_onWidthChange}
          aria-valuetext={`ChangeWidthSlider${width}`}
        />
        <label htmlFor="changeHeight_Basic">Change Height:</label>
        <input
          type="range"
          value={height}
          min={200}
          max={1000}
          id="changeHeight_Basic"
          onChange={_onHeightChange}
          aria-valuetext={`ChangeHeightslider${height}`}
        />
      </div>
      <Field label="Pick one">
        <RadioGroup
          defaultValue="basicExample"
          onChange={(_ev, option) => {
            if (isCalloutSelected) {
              setIsCalloutSelected(true);
            } else {
              setIsCalloutSelected(false);
            }
          }}
        >
          <Radio value="basicExample" label="Basic Example" />
          <Radio value="calloutExample" label="Custom Callout Example" />
        </RadioGroup>
      </Field>
      <div style={{ marginTop: '10px' }}>
        <Switch
          label={showAxisTitles ? 'Show Axis titles' : 'Hide axis titles'}
          checked={showAxisTitles}
          onChange={_onSwitchAxisTitlesCheckChange}
        />
      </div>
      <div style={{ marginTop: '10px' }}>
        <Switch
          label={legendMultiSelect ? 'Select multiple legends ON' : 'Select multiple legends OFF'}
          checked={legendMultiSelect}
          onChange={_onSwitchLegendMultiSelect}
        />
      </div>
      <div style={{ marginTop: '10px' }}>
        <Switch
          label={changeChartMode ? 'Change chart mode to toZeroY ON' : 'Change chart mode to toZeroY OFF'}
          checked={changeChartMode}
          onChange={_onSwitchChartMode}
        />
      </div>
      <div>
        <CartesianChartExample />
        <PolarChartExample />
        <LogarithmicChartExample />
      </div>
    </>
  );
};
AreaChartBasic.parameters = {
  docs: {
    description: {},
  },
};
