import * as React from 'react';
import { render, screen, queryAllByAttribute, fireEvent } from '@testing-library/react';
import { chartPoints } from './VerticalBarChart.test';
import { DefaultPalette, IRenderFunction } from '@fluentui/react';
import { IVerticalBarChartDataPoint } from '@fluentui/react-charting';
import { VerticalBarChart } from '../VerticalBarChart/VerticalBarChart';

const pointsWithLine: IVerticalBarChartDataPoint[] = [
  {
    x: 0,
    y: 10000,
    legend: 'Oranges',
    color: DefaultPalette.accent,
    xAxisCalloutData: '2020/04/30',
    yAxisCalloutData: '10%',
    lineData: {
      y: 7000,
      yAxisCalloutData: '34%',
    },
  },
  {
    x: 10000,
    y: 50000,
    legend: 'Dogs',
    color: DefaultPalette.blueDark,
    xAxisCalloutData: '2020/04/30',
    yAxisCalloutData: '20%',
    lineData: {
      y: 30000,
    },
  },
  {
    x: 25000,
    y: 30000,
    legend: 'Apples',
    color: DefaultPalette.blueMid,
    xAxisCalloutData: '2020/04/30',
    yAxisCalloutData: '37%',
    lineData: {
      y: 3000,
      yAxisCalloutData: '43%',
    },
  },
  {
    x: 40000,
    y: 13000,
    legend: 'Bananas',
    color: DefaultPalette.blueLight,
    xAxisCalloutData: '2020/04/30',
    yAxisCalloutData: '88%',
  },
  {
    x: 52000,
    y: 43000,
    legend: 'Giraffes',
    color: DefaultPalette.blue,
    xAxisCalloutData: '2020/04/30',
    yAxisCalloutData: '71%',
    lineData: {
      y: 30000,
    },
  },
  {
    x: 68000,
    y: 30000,
    legend: 'Cats',
    color: DefaultPalette.blueDark,
    xAxisCalloutData: '2020/04/30',
    yAxisCalloutData: '40%',
    lineData: {
      y: 5000,
    },
  },
  {
    x: 80000,
    y: 20000,
    legend: 'Elephants',
    color: DefaultPalette.blue,
    xAxisCalloutData: '2020/04/30',
    yAxisCalloutData: '87%',
    lineData: {
      y: 16000,
    },
  },
  {
    x: 92000,
    y: 45000,
    legend: 'Monkeys',
    color: DefaultPalette.blueLight,
    xAxisCalloutData: '2020/04/30',
    yAxisCalloutData: '33%',
    lineData: {
      y: 40000,
      yAxisCalloutData: '45%',
    },
  },
];

const simplePoints: IVerticalBarChartDataPoint[] = [
  {
    x: 'This is a medium long label. ',
    y: 3500,
    color: '#627CEF',
  },
  {
    x: 'This is a long label This is a long label',
    y: 2500,
    color: '#C19C00',
  },
  {
    x: 'This label is as long as the previous one',
    y: 1900,
    color: '#E650AF',
  },
  {
    x: 'A short label',
    y: 2800,
    color: '#0E7878',
  },
];

describe('Vertical bar chart - Subcomponent bar', () => {
  test('Should render the bar with the given width', async () => {
    // Arrange
    render(<VerticalBarChart data={chartPoints} barWidth={100} />);
    await new Promise(resolve => setTimeout(resolve));
    const bar = screen.getAllByText((content, element) => element!.tagName.toLowerCase() === 'rect')[1];

    // Assert
    expect(bar.getAttribute('width')).toEqual('100');
  });
  test('Should render the bars with the specified colors', async () => {
    // Arrange
    // colors mentioned in the data points itself
    render(<VerticalBarChart data={chartPoints} />);
    await new Promise(resolve => setTimeout(resolve));
    const bars = screen.getAllByText((content, element) => element!.tagName.toLowerCase() === 'rect');

    // Assert
    expect(bars[0].getAttribute('fill')).toEqual('#0078d4');
    expect(bars[1].getAttribute('fill')).toEqual('#002050');
    expect(bars[2].getAttribute('fill')).toEqual('#00188f');
  });
  test('Should render the bars with the a single color', async () => {
    // Arrange
    render(<VerticalBarChart data={chartPoints} useSingleColor={true} />);
    await new Promise(resolve => setTimeout(resolve));
    const bars = screen.getAllByText((content, element) => element!.tagName.toLowerCase() === 'rect');

    // Assert
    expect(bars[0].getAttribute('fill')).toEqual('#00bcf2');
    expect(bars[1].getAttribute('fill')).toEqual('#00bcf2');
    expect(bars[2].getAttribute('fill')).toEqual('#00bcf2');
  });
  test('Should render the bars with labels hidden', async () => {
    // Arrange
    const { container } = render(<VerticalBarChart data={chartPoints} hideLabels={true} />);
    await new Promise(resolve => setTimeout(resolve));
    const getByClass = queryAllByAttribute.bind(null, 'class');

    // Assert
    expect(getByClass(container, /barLabel/i)).toHaveLength(0);
  });
});

describe('Vertical bar chart - Subcomponent line', () => {
  test('Should render line along with bars', () => {
    // Arrange
    render(<VerticalBarChart data={pointsWithLine} />);
    const line = screen.getAllByText((content, element) => element!.tagName.toLowerCase() === 'path');

    // Assert
    expect(line).not.toHaveLength(0);
  });
  test('Should highlight the data points and render the corresponding callout', () => {
    // Arrange
    const { container } = render(<VerticalBarChart data={pointsWithLine} />);
    const getById = queryAllByAttribute.bind(null, 'id');
    const firstPointonLine = screen.getAllByText((content, element) => element!.tagName.toLowerCase() === 'circle')[0];
    expect(firstPointonLine).toBeDefined();
    fireEvent.mouseOver(firstPointonLine);

    // Assert
    expect(firstPointonLine.getAttribute('visibility')).toEqual('visibility');
    // expect(getById(container, /toolTipcallout/i)[0]).toHaveStyle('opacity: 1');
  });
});
