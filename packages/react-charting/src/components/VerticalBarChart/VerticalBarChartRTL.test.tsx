import { IVerticalBarChartDataPoint, IVerticalBarChartProps, VerticalBarChart } from '../../index';
import { getByClass, getById, testScreenResolution, testWithWait, testWithoutWait } from '../../utilities/TestUtility';
import { DefaultPalette, ThemeProvider } from '@fluentui/react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import * as React from 'react';
import { DarkTheme } from '@fluentui/theme-samples';
import { VerticalBarChartBase } from './VerticalBarChart.base';
// import { chartPoints } from './VerticalBarChart.test';

const data = [
  { x: 'A', y: 10 },
  { x: 'B', y: 20 },
  { x: 'C', y: 30 },
];

const stringData = [
  { x: 'A', y: '10' },
  { x: 'B', y: '20' },
  { x: 'C', y: '30' },
];

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

describe('VerticalBarChart', () => {
  testWithoutWait('renders without crashing', VerticalBarChart, { data }, container => () => {
    expect(container).toMatchSnapshot();
  });
  testWithWait(
    'Check if the bars have the correct height and width',
    VerticalBarChart,
    { data, width: 100 },
    container => () => {
      const bars = getById(container, /_VBC_bar/i);
      expect(bars[0].getAttribute('y')).toBe('10');
      expect(bars[0].getAttribute('width')).toBe('100');
      expect(bars[1]).toHaveAttribute('y', '20');
      expect(bars[1]).toHaveAttribute('width', '100');
      expect(bars[2]).toHaveAttribute('y', '30');
      expect(bars[2]).toHaveAttribute('width', '100');
    },
  );
  testWithoutWait(
    'Check if the bars have the correct colors',
    VerticalBarChart,
    {
      data,
      colors: ['#0078d4'],
      useSingleColor: true,
    },
    container => () => {
      const bars = getById(container, /_VBC_bar/i);
      expect(bars[0]).toHaveAttribute('fill', '#0078d4');
      expect(bars[1]).toHaveAttribute('fill', '#0078d4');
      expect(bars[2]).toHaveAttribute('fill', '#0078d4');
    },
  );
  testWithoutWait('Check if the bars have the correct labels', VerticalBarChart, { data }, container => () => {
    const labels = getById(container, /barlabel/i);
    expect(labels[0]).toHaveTextContent('10');
    expect(labels[1]).toHaveTextContent('20');
    expect(labels[2]).toHaveTextContent('30');
  });
  testWithoutWait(
    'Check if the bars have the correct numeric data types',
    VerticalBarChart,
    { data },
    container => () => {
      const bars = getById(container, /_VBC_bar/i);
      expect(bars[0]).toHaveAttribute('data-isnumeric', 'true');
      expect(bars[1]).toHaveAttribute('data-isnumeric', 'true');
      expect(bars[2]).toHaveAttribute('data-isnumeric', 'true');
    },
  );
  testWithoutWait(
    'Check if the bars have the correct string data types',
    VerticalBarChart,
    { data: stringData },
    container => () => {
      const bars = getById(container, /_VBC_bar/i);
      expect(bars[0]).toHaveAttribute('data-isnumeric', 'false');
      expect(bars[1]).toHaveAttribute('data-isnumeric', 'false');
      expect(bars[2]).toHaveAttribute('data-isnumeric', 'false');
    },
  );
  testWithWait(
    'Check if the callout appears on the chart when hovered',
    VerticalBarChart,
    { data },
    container => () => {
      const bars = getById(container, /_VBC_bar/i);
      fireEvent.mouseOver(bars[0]);
      expect(getById(container, /callout/i)[0]).toHaveTextContent('10');
      fireEvent.mouseLeave(bars[0]);
      fireEvent.mouseOver(bars[1]);
      expect(getById(container, /callout/i)[0]).toHaveTextContent('20');
    },
  );
  testWithWait('Check if the callout moves with the mouse', VerticalBarChart, { data }, container => () => {
    const bars = getById(container, /_VBC_bar/i);
    fireEvent.mouseOver(bars[0]);
    fireEvent.mouseMove(bars[0], { clientX: 50, clientY: 50 });
    expect(getById(container, /callout/i)[0]).toHaveAttribute('transform', 'translate(50,50)');
  });
  testWithWait(
    'Check if the callout disappears when the mouse leaves the chart',
    VerticalBarChart,
    { data },
    container => () => {
      const bars = getById(container, /_VBC_bar/i);
      fireEvent.mouseOver(bars[0]);
      fireEvent.mouseLeave(bars[0]);
      expect(getById(container, /callout/i)).toHaveLength(0);
    },
  );
  testWithWait(
    'Check if the component renders without any errors with line',
    VerticalBarChart,
    { data: pointsWithLine },
    container => () => {
      expect(container).toMatchSnapshot();
      const lines = getById(container, /_VBC_line/i);
      expect(lines).toHaveLength(1);
    },
  );
  testWithWait(
    'Check if the line has the correct height and width',
    VerticalBarChart,
    { data: pointsWithLine, width: 100 },
    container => () => {
      const lines = getById(container, /_VBC_line/i);
      expect(lines[0]).toHaveAttribute('y1', '10');
      expect(lines[0]).toHaveAttribute('y2', '20');
      expect(lines[0]).toHaveAttribute('x1', '0');
      expect(lines[0]).toHaveAttribute('x2', '100');
    },
  );
  testWithWait(
    'Check if the line has the correct color',
    VerticalBarChart,
    {
      data: pointsWithLine,
      lineLegendText: 'just line',
      lineLegendColor: 'brown',
    },
    container => () => {
      const lines = getById(container, /_VBC_line/i);
      expect(lines[0]).toHaveAttribute('stroke', 'brown');
    },
  );
  testWithWait(
    'Check if the line has the correct data points',
    VerticalBarChart,
    { data: pointsWithLine },
    container => () => {
      const lines = getById(container, /_VBC_line/i);
      expect(lines[0]).toHaveAttribute('data-isnumeric', 'true');
      expect(lines[0]).toHaveAttribute('x', '0');
      expect(lines[0]).toHaveAttribute('y', '7000');
    },
  );
  testWithWait(
    'Check if the line has the correct numeric data types',
    VerticalBarChart,
    { data: pointsWithLine },
    container => () => {
      const lines = getById(container, /_VBC_line/i);
      expect(lines[0]).toHaveAttribute('data-isnumeric', 'true');
    },
  );
  testWithWait(
    'Callout should not appear on the chart on hover on line',
    VerticalBarChart,
    { data: pointsWithLine },
    container => () => {
      const lines = getById(container, /_VBC_line/i);
      fireEvent.mouseOver(lines[0]);
      expect(getById(container, /callout/i)).toHaveLength(0);
    },
  );
  testWithWait(
    'Callout should not move with the mouse on hover on line',
    VerticalBarChart,
    { data: pointsWithLine },
    container => () => {
      const lines = getById(container, /_VBC_line/i);
      fireEvent.mouseOver(lines[0]);
      fireEvent.mouseMove(lines[0], { clientX: 50, clientY: 50 });
      expect(getById(container, /callout/i)).toHaveLength(0);
    },
  );
  testWithWait(
    'Check if the callout has the correct data on hover on bar',
    VerticalBarChart,
    { data },
    container => () => {
      const bars = getById(container, /_VBC_bar/i);
      fireEvent.mouseOver(bars[0]);
      expect(getById(container, /callout/i)[0]).toHaveTextContent('10');
    },
  );
  testWithWait(
    'Check if the callout has the correct position on hover on bar',
    VerticalBarChart,
    { data },
    container => () => {
      const bars = getById(container, /_VBC_bar/i);
      fireEvent.mouseOver(bars[0]);
      fireEvent.mouseMove(bars[0], { clientX: 50, clientY: 50 });
      fireEvent.mouseOver(bars[0]);
      expect(getById(container, /callout/i)[0]).toHaveAttribute('transform', 'translate(50,50)');
    },
  );

  testWithWait(
    'Check if the callout has the correct numeric data types on hover on bar',
    VerticalBarChart,
    { data },
    container => () => {
      const bars = getById(container, /_VBC_bar/i);
      fireEvent.mouseOver(bars[0]);
      expect(getById(container, /callout/i)[0]).toHaveAttribute('data-isnumeric', 'true');
    },
  );
  testWithWait(
    'Check if the callout has the correct string data types on hover on bar',
    VerticalBarChart,
    { data: stringData },
    container => () => {
      const bars = getById(container, /_VBC_bar/i);
      fireEvent.mouseOver(bars[0]);
      expect(getById(container, /callout/i)[0]).toHaveAttribute('data-isnumeric', 'false');
    },
  );
  testWithWait('Check if the legends render without any errors', VerticalBarChart, { data }, container => () => {
    const legends = getById(container, /_VBC_legend/i);
    expect(legends).toHaveLength(3);
  });
  testWithWait('Check if the legends have the correct data', VerticalBarChart, { data }, container => () => {
    const legends = getById(container, /_VBC_legend/i);
    expect(legends[0]).toHaveTextContent('A');
    expect(legends[1]).toHaveTextContent('B');
    expect(legends[2]).toHaveTextContent('C');
  });
  testWithWait(
    'Check if the opacity changes specifically for legends on mouseover legends',
    VerticalBarChart,
    { data },
    container => () => {
      const legends = getById(container, /_VBC_legend/i);
      fireEvent.mouseOver(legends[0]);
      expect(legends[0]).toHaveAttribute('opacity', '1');
      expect(legends[1]).toHaveAttribute('opacity', '0.67');
      expect(legends[2]).toHaveAttribute('opacity', '0.67');
      const bars = getById(container, /_VBC_bar/i);
      expect(bars[0]).toHaveAttribute('opacity', '1');
      expect(bars[1]).toHaveAttribute('opacity', '0.67');
      expect(bars[2]).toHaveAttribute('opacity', '0.67');
    },
  );
  testWithWait(
    'Check if the xaxis and xaxis ticks renders without any errors',
    VerticalBarChart,
    { data },
    container => () => {
      const xAxis = getById(container, /xAxisGElementchart/i);
      expect(xAxis).toBeInTheDocument();
      const ticks = getById(container, /tick/i);
      expect(ticks).toHaveLength(3);
      expect(ticks[0]).toHaveTextContent('A');
      expect(ticks[1]).toHaveTextContent('B');
      expect(ticks[2]).toHaveTextContent('C');
      expect(typeof ticks[0]).toBe('string');
      expect(typeof ticks[1]).toBe('string');
      expect(typeof ticks[2]).toBe('string');
    },
  );
  testWithWait('Check if the x-axis has the correct position', VerticalBarChart, { data }, container => () => {
    const xAxis = getById(container, /xAxisGElementchart/i);
    expect(xAxis).toHaveAttribute('transform', 'translate(0,100)');
  });
  testWithWait(
    'Check if the x-axis ticks are rotated correctly',
    VerticalBarChart,
    { data: simplePoints, rotateXAxisLables: true },
    container => () => {
      const ticks = getById(container, /tick/i);
      expect(ticks[0]).toHaveAttribute('transform', 'translate(0,0) rotate(-45)');
      expect(ticks[1]).toHaveAttribute('transform', 'translate(0,0) rotate(-45)');
      expect(ticks[2]).toHaveAttribute('transform', 'translate(0,0) rotate(-45)');
    },
  );
  //Check if the y-axis renders without any errors
  testWithWait(
    'Check if the y-axis and y-axis ticks renders without any errors',
    VerticalBarChart,
    { data },
    container => () => {
      const yAxis = getById(container, /yAxisGElementchart/i);
      expect(yAxis).toBeInTheDocument();
      const ticks = getByClass(container, /tick/i);
      expect(ticks).toHaveLength(3);
      expect(ticks[0]).toBe(10);
      expect(ticks[1]).toBe(20);
      expect(ticks[2]).toBe(30);
    },
  );
  //Check if the y-axis has the correct position
  testWithWait('Check if the y-axis has the correct position', VerticalBarChart, { data }, container => () => {
    const yAxis = getById(container, /yAxisGElementchart/i);
    expect(yAxis).toHaveAttribute('transform', 'translate(0,0)');
  });
  //Check if the y-axis has the correct data types
  testWithWait(
    'Check if the y-axis has the correct numeric data types',
    VerticalBarChart,
    { data },
    container => () => {
      const yAxis = getById(container, /yAxisGElementchart/i);
      expect(yAxis).toHaveAttribute('data-isnumeric', 'true');
    },
  );
  //Check if the y-axis has the correct string data types
  testWithWait(
    'Check if the y-axis has the correct string data types',
    VerticalBarChart,
    { data: stringData },
    container => () => {
      const yAxis = getById(container, /yAxisGElementchart/i);
      expect(yAxis).toHaveAttribute('data-isnumeric', 'false');
    },
  );
  //Click on a legend item and check if the corresponding bar is highlighted
  testWithWait('Check if the bar is highlighted on click on legend', VerticalBarChart, { data }, container => () => {
    const legends = getById(container, /_VBC_legend/i);
    fireEvent.click(legends[0]);
    const bars = getById(container, /_VBC_bar/i);
    expect(bars[0]).toHaveAttribute('opacity', '1');
    expect(bars[1]).toHaveAttribute('opacity', '0.67');
    expect(bars[2]).toHaveAttribute('opacity', '0.67');
  });
  //Hover over a legend item and then move the mouse away from the legend and check if the highlight is removed from the corresponding bar
  testWithWait(
    'Hover over a legend item and then move the mouse away from the legend and check if the highlight is \
  removed from the corresponding bar',
    VerticalBarChart,
    { data },
    container => () => {
      const legends = getById(container, /_VBC_legend/i);
      fireEvent.mouseOver(legends[0]);
      fireEvent.mouseOut(legends[0]);
      const bars = getById(container, /_VBC_bar/i);
      expect(bars[0]).toHaveAttribute('opacity', '1');
      expect(bars[1]).toHaveAttribute('opacity', '1');
      expect(bars[2]).toHaveAttribute('opacity', '1');
    },
  );
  testWithWait(
    'Should show the x-axis labels tooltip when hovered',
    VerticalBarChart,
    { data: pointsWithLine, showXAxisLablesTooltip: true },
    container => {
      const bars = getById(container, /_VBC_bar/i);
      expect(bars).toHaveLength(8);
      fireEvent.mouseOver(bars[0]);
      // Assert
      expect(getById(container, /showDots/i)).toHaveLength(5);
      expect(getById(container, /showDots/i)[0]!.textContent!).toEqual('20,0...');
    },
  );
  testWithoutWait(
    'Should not show any rendered legends when hideLegend is true',
    VerticalBarChart,
    { data: pointsWithLine, hideLegend: true },
    container => {
      expect(getById(container, /_VBC_legend/i)).toHaveLength(0);
    },
  );
  testWithWait(
    'Should render the bars with labels hidden',
    VerticalBarChart,
    { data: data, hideLabels: true },
    container => {
      // Assert
      expect(getByClass(container, /barLabel/i)).toHaveLength(0);
    },
  );
});

describe('Vertical bar chart - Extra', () => {
  testWithoutWait(
    'Check if the bars have the correct multiple color',
    VerticalBarChart,
    {
      data,
      colors: ['#0078d4', '#004578', '#001e3c'],
      useSingleColor: false,
    },
    container => () => {
      const bars = getById(container, /_VBC_bar/i);
      expect(bars[0]).toHaveAttribute('fill', '#0078d4');
      expect(bars[1]).toHaveAttribute('fill', '#004578');
      expect(bars[2]).toHaveAttribute('fill', '#001e3c');
    },
  );
  testWithoutWait(
    'Should highlight the data points and not render the corresponding callout',
    VerticalBarChart,
    { data: pointsWithLine },
    container => {
      const firstPointonLine = getById(container, /_VBC_point/i)[0];
      expect(firstPointonLine).toBeDefined();
      fireEvent.mouseOver(firstPointonLine);
      // Assert
      expect(firstPointonLine.getAttribute('visibility')).toEqual('visibility');
      expect(getById(container, /toolTipcallout/i)).toHaveLength(0);
    },
  );
  testWithWait(
    'Should show the custom callout over the bar on mouse over',
    VerticalBarChart,
    {
      data: pointsWithLine,
      calloutProps: { doNotLayer: true },
      onRenderCalloutPerDataPoint: (props: IVerticalBarChartProps) =>
        props ? (
          <div className="onRenderCalloutPerDataPoint">
            <p>Custom Callout Content</p>
          </div>
        ) : null,
    },
    container => {
      const bars = getById(container, /_VBC_bar/i);
      expect(bars).toHaveLength(8);
      fireEvent.mouseOver(bars[0]);
      // Assert
      expect(getById(container, /toolTipcallout/i)).toBeDefined();
      expect(screen.queryByText('Custom Callout Content')).toBeDefined();
    },
  );
  testWithWait(
    'Should not show the custom callout over the line on mouse over',
    VerticalBarChart,
    {
      data: pointsWithLine,
      calloutProps: { doNotLayer: true },
      onRenderCalloutPerDataPoint: (props: IVerticalBarChartProps) =>
        props ? (
          <div className="onRenderCalloutPerDataPoint">
            <p>Custom Callout Content</p>
          </div>
        ) : null,
    },
    container => {
      const line = getById(container, /_VBC_line/i)[0];
      expect(line).toBeDefined();
      fireEvent.mouseOver(line);
      // Assert
      expect(getById(container, /toolTipcallout/i)).toBeDefined();
      expect(screen.queryByText('Custom Callout Content')).toBeNull();
    },
  );
  testWithWait(
    'Should reduce the opacity of the other bars/lines and their legends on mouse over a line legend',
    VerticalBarChart,
    { data: pointsWithLine, lineLegendText: 'just line' },
    container => {
      const bars = getById(container, /_VBC_bar/i);
      const line = getById(container, /_VBC_line/i)[0];
      const legends = screen.getAllByText((content, element) => element!.tagName.toLowerCase() === 'button');
      expect(line).toBeDefined();
      expect(bars).toHaveLength(8);
      expect(legends).toHaveLength(9);
      fireEvent.mouseOver(screen.getByText('just line'));
      expect(line.getAttribute('opacity')).toEqual('1');
      expect(screen.getByText('Oranges')).toHaveStyle('opacity: 0.67');
      expect(screen.getByText('Dogs')).toHaveStyle('opacity: 0.67');
      expect(screen.getByText('Apples')).toHaveStyle('opacity: 0.67');
      expect(screen.getByText('Bananas')).toHaveStyle('opacity: 0.67');
      expect(screen.getByText('Giraffes')).toHaveStyle('opacity: 0.67');
      expect(screen.getByText('Cats')).toHaveStyle('opacity: 0.67');
      expect(screen.getByText('Elephants')).toHaveStyle('opacity: 0.67');
      expect(screen.getByText('Monkeys')).toHaveStyle('opacity: 0.67');
      expect(line).toBeDefined();
      expect(bars[0]).toBeDefined();
      expect(bars[0]).toHaveStyle('opacity: 0.1');
      expect(bars[1]).toBeDefined();
      expect(bars[1]).toHaveStyle('opacity: 0.1');
      expect(bars[2]).toBeDefined();
      expect(bars[2]).toHaveStyle('opacity: 0.1');
      expect(bars[3]).toBeDefined();
      expect(bars[3]).toHaveStyle('opacity: 0.1');
      expect(bars[4]).toBeDefined();
      expect(bars[4]).toHaveStyle('opacity: 0.1');
      expect(bars[5]).toBeDefined();
      expect(bars[5]).toHaveStyle('opacity: 0.1');
      expect(bars[6]).toBeDefined();
      expect(bars[6]).toHaveStyle('opacity: 0.1');
      expect(bars[7]).toBeDefined();
      expect(bars[7]).toHaveStyle('opacity: 0.1');
    },
  );
  test('Should call the handler on mouse over bar and on mouse leave from bar', async () => {
    // Arrange
    const handleMouseOver = jest.spyOn(VerticalBarChartBase.prototype as any, '_onBarHover');
    const { container } = render(<VerticalBarChart data={pointsWithLine} calloutProps={{ doNotLayer: true }} />);
    await waitFor(() => {
      const bars = getById(container, /_VBC_bar/i);
      expect(bars).toHaveLength(8);
      fireEvent.mouseOver(bars[0]);
      // Assert
      expect(handleMouseOver).toHaveBeenCalled();
    });
  });
});

describe('Screen resolution', () => {
  testScreenResolution(() => {
    const { container } = render(<VerticalBarChart data={data} width={300} height={300} />);
    // Assert
    expect(container).toMatchSnapshot();
  });
});

test('Should reflect theme change', () => {
  // Arrange
  const { container } = render(
    <ThemeProvider theme={DarkTheme}>
      <VerticalBarChart culture={window.navigator.language} data={data} />
    </ThemeProvider>,
  );
  // Assert
  expect(container).toMatchSnapshot();
});
