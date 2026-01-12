import * as React from 'react';
import type { JSXElement } from '@fluentui/react-components';
import { DataVizPalette, GaugeChart, getColorFromToken } from '@fluentui/react-charts';
import { GaugeChartAnnotation } from '@fluentui/react-charts/library/src/components/GaugeChart';

export const GaugeChartWithAnnotations = (): JSXElement => {
  const [chartValue, setChartValue] = React.useState<number>(65);

  const _onValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setChartValue(parseInt(e.target.value, 10));
  };

  const annotations: GaugeChartAnnotation[] = [
    {
      id: 'threshold-low',
      type: 'threshold',
      text: 'Low',
      position: 'outer-arc',
      value: 33,
      color: getColorFromToken(DataVizPalette.error),
      fontSize: 11,
    },
    {
      id: 'threshold-medium',
      type: 'threshold',
      text: 'Medium',
      position: 'outer-arc',
      value: 66,
      color: getColorFromToken(DataVizPalette.warning),
      fontSize: 11,
    },
    {
      id: 'threshold-high',
      type: 'threshold',
      text: 'High',
      position: 'outer-arc',
      value: 100,
      color: getColorFromToken(DataVizPalette.success),
      fontSize: 11,
    },
    {
      id: 'current-value',
      type: 'value-marker',
      text: `${chartValue}%`,
      position: 'above-needle',
      fontSize: 14,
      color: getColorFromToken(DataVizPalette.neutral),
    },
  ];

  return (
    <>
      <div style={{ marginBottom: '20px' }}>
        <label htmlFor="annotation-value-slider">Current value:</label>
        <input
          type="range"
          value={chartValue}
          min={0}
          max={100}
          id="annotation-value-slider"
          onChange={_onValueChange}
          aria-valuetext={`Current value: ${chartValue}`}
          style={{ marginLeft: '10px' }}
        />
        <span style={{ marginLeft: '10px' }}>{chartValue}%</span>
      </div>

      <GaugeChart
        width={300}
        height={150}
        chartValue={chartValue}
        maxValue={100}
        minValue={0}
        segments={[
          {
            legend: 'Low',
            size: 33,
            color: DataVizPalette.error,
          },
          {
            legend: 'Medium',
            size: 33,
            color: DataVizPalette.warning,
          },
          {
            legend: 'High',
            size: 34,
            color: DataVizPalette.success,
          },
        ]}
        chartTitle="Performance Metrics"
        sublabel="with threshold annotations"
        annotations={annotations}
      />
    </>
  );
};

export const GaugeChartInnerAnnotations = (): JSXElement => {
  const [chartValue, setChartValue] = React.useState<number>(75);

  const _onValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setChartValue(parseInt(e.target.value, 10));
  };

  const annotations: GaugeChartAnnotation[] = [
    {
      id: 'label-safe',
      type: 'zone-label',
      text: 'Safe Zone',
      position: 'inner-arc',
      value: 25,
      fontSize: 12,
      color: getColorFromToken(DataVizPalette.success),
    },
    {
      id: 'label-caution',
      type: 'zone-label',
      text: 'Caution',
      position: 'inner-arc',
      value: 50,
      fontSize: 12,
      color: getColorFromToken(DataVizPalette.warning),
    },
    {
      id: 'label-danger',
      type: 'zone-label',
      text: 'Danger',
      position: 'inner-arc',
      value: 75,
      fontSize: 12,
      color: getColorFromToken(DataVizPalette.error),
    },
    {
      id: 'current-marker',
      type: 'value-marker',
      text: `${chartValue}°C`,
      position: 'below-needle',
      fontSize: 13,
      color: getColorFromToken(DataVizPalette.neutral),
    },
  ];

  return (
    <>
      <div style={{ marginBottom: '20px' }}>
        <label htmlFor="temp-value-slider">Temperature (°C):</label>
        <input
          type="range"
          value={chartValue}
          min={0}
          max={100}
          id="temp-value-slider"
          onChange={_onValueChange}
          aria-valuetext={`Temperature: ${chartValue}°C`}
          style={{ marginLeft: '10px' }}
        />
        <span style={{ marginLeft: '10px' }}>{chartValue}°C</span>
      </div>

      <GaugeChart
        width={300}
        height={150}
        chartValue={chartValue}
        maxValue={100}
        minValue={0}
        segments={[
          {
            legend: 'Safe',
            size: 33,
            color: DataVizPalette.success,
          },
          {
            legend: 'Caution',
            size: 34,
            color: DataVizPalette.warning,
          },
          {
            legend: 'Danger',
            size: 33,
            color: DataVizPalette.error,
          },
        ]}
        chartTitle="Temperature Gauge"
        sublabel="with inner zone labels"
        annotations={annotations}
      />
    </>
  );
};

export const GaugeChartMultipleAnnotations = (): JSXElement => {
  const [chartValue, setChartValue] = React.useState<number>(50);

  const _onValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setChartValue(parseInt(e.target.value, 10));
  };

  const annotations: GaugeChartAnnotation[] = [
    // Top label
    {
      id: 'title-top',
      type: 'text-label',
      text: 'System Status',
      position: 'top',
      fontSize: 13,
      color: getColorFromToken(DataVizPalette.neutral),
    },
    // Threshold markers
    {
      id: 'marker-25',
      type: 'threshold',
      text: '25%',
      position: 'outer-arc',
      value: 25,
      fontSize: 10,
      color: getColorFromToken(DataVizPalette.error),
      offset: [0, 5],
    },
    {
      id: 'marker-50',
      type: 'threshold',
      text: '50%',
      position: 'outer-arc',
      value: 50,
      fontSize: 10,
      color: getColorFromToken(DataVizPalette.warning),
      offset: [0, 5],
    },
    {
      id: 'marker-75',
      type: 'threshold',
      text: '75%',
      position: 'outer-arc',
      value: 75,
      fontSize: 10,
      color: getColorFromToken(DataVizPalette.success),
      offset: [0, 5],
    },
    {
      id: 'marker-100',
      type: 'threshold',
      text: 'Max',
      position: 'outer-arc',
      value: 100,
      fontSize: 10,
      color: getColorFromToken(DataVizPalette.neutral),
      offset: [0, 5],
    },
    // Current value
    {
      id: 'current',
      type: 'value-marker',
      text: `${chartValue}%`,
      position: 'above-needle',
      fontSize: 14,
      color: getColorFromToken(DataVizPalette.neutral),
    },
  ];

  return (
    <>
      <div style={{ marginBottom: '20px' }}>
        <label htmlFor="complex-value-slider">Value:</label>
        <input
          type="range"
          value={chartValue}
          min={0}
          max={100}
          id="complex-value-slider"
          onChange={_onValueChange}
          aria-valuetext={`Value: ${chartValue}%`}
          style={{ marginLeft: '10px' }}
        />
        <span style={{ marginLeft: '10px' }}>{chartValue}%</span>
      </div>

      <GaugeChart
        width={350}
        height={180}
        chartValue={chartValue}
        maxValue={100}
        minValue={0}
        segments={[
          {
            legend: 'Critical',
            size: 25,
            color: DataVizPalette.error,
          },
          {
            legend: 'Warning',
            size: 25,
            color: DataVizPalette.warning,
          },
          {
            legend: 'Good',
            size: 25,
            color: getColorFromToken(DataVizPalette.success),
          },
          {
            legend: 'Excellent',
            size: 25,
            color: getColorFromToken(DataVizPalette.success),
          },
        ]}
        chartTitle="Performance Indicator"
        sublabel="with comprehensive annotations"
        annotations={annotations}
      />
    </>
  );
};

export default {
  title: 'Charts/GaugeChart/Annotations',
  component: GaugeChart,
};
