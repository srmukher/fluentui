import { render, screen, cleanup, queryAllByAttribute, fireEvent } from '@testing-library/react';
import * as React from 'react';
import { IChartDataPoint, IChartProps } from '../../DonutChart';
import { DonutChart } from './DonutChart';

const points: IChartDataPoint[] = [
  { legend: 'first', data: 20000, color: '#E5E5E5', xAxisCalloutData: '2020/04/30' },
  { legend: 'second', data: 39000, color: '#0078D4', xAxisCalloutData: '2020/04/20' },
];

const chartTitle = 'Donut chart example';

const chartPoints: IChartProps = {
  chartTitle: chartTitle,
  chartData: points,
};

test('renders DonutChart correctly', () => {
  const { container } = render(<DonutChart data={chartPoints} innerRadius={55} />);
  expect(container).toMatchSnapshot();
});

test('renders hideLegend correctly', () => {
  const { container } = render(<DonutChart data={chartPoints} hideLegend={true} />);
  expect(container).toMatchSnapshot();
});

test('renders hideTooltip correctly', () => {
  const { container } = render(<DonutChart data={chartPoints} hideTooltip={true} />);
  expect(container).toMatchSnapshot();
});

test('renders enabledLegendsWrapLines correctly', () => {
  const { container } = render(<DonutChart data={chartPoints} enabledLegendsWrapLines={true} />);
  expect(container).toMatchSnapshot();
});

test('Should mount legend when hideLegend is false', () => {
  render(<DonutChart data={chartPoints} />);
  const hideLegendDOM = screen.queryByText('first');
  expect(hideLegendDOM).toBeDefined();
});

test('Should mount callout when hideTootip false ', () => {
  const { container } = render(<DonutChart data={chartPoints} />);
  const hideLegendDOM = container.querySelectorAll('[class^="ms-Layer"]');
  expect(hideLegendDOM).toBeDefined();
});

test('Should not render onRenderCalloutPerStack ', () => {
  const { container } = render(<DonutChart data={chartPoints} />);
  const renderedDOM = container.getElementsByClassName('.onRenderCalloutPerStack');
  expect(renderedDOM!.length).toBe(0);
});

test('Should render onRenderCalloutPerDataPoint ', () => {
  const { container } = render(
    <DonutChart
      data={chartPoints}
      onRenderCalloutPerDataPoint={(props: IChartDataPoint) =>
        props ? (
          <div className="onRenderCalloutPerDataPoint">
            <p>Custom Callout Content</p>
          </div>
        ) : null
      }
    />,
  );
  const getById = queryAllByAttribute.bind(null, 'id');
  fireEvent.mouseOver(getById(container, /Pie/i)[0]);
  const renderedDOM = screen.queryByText('Custom Callout Content');
  expect(renderedDOM).toBeDefined();
});

test('Should not render onRenderCalloutPerDataPoint ', () => {
  const { container } = render(<DonutChart data={chartPoints} />);
  const renderedDOM = container.getElementsByClassName('.onRenderCalloutPerDataPoint');
  expect(renderedDOM!.length).toBe(0);
});

test('Should render callout correctly on mouseover', () => {
  const { container } = render(<DonutChart data={chartPoints} innerRadius={55} calloutProps={{ doNotLayer: true }} />);
  const getById = queryAllByAttribute.bind(null, 'id');
  fireEvent.mouseOver(getById(container, /Pie/i)[0]);
  expect(container).toMatchSnapshot();
});

test('Should render callout correctly on mousemove', () => {
  const { container } = render(<DonutChart data={chartPoints} innerRadius={55} calloutProps={{ doNotLayer: true }} />);
  const getById = queryAllByAttribute.bind(null, 'id');
  fireEvent.mouseMove(getById(container, /Pie/i)[0]);
  const html1 = container.innerHTML;
  fireEvent.mouseLeave(getById(container, /Pie/i)[0]);
  fireEvent.mouseMove(getById(container, /Pie/i)[1]);
  const html2 = container.innerHTML;
  expect(html1).not.toEqual(html2);
});

test('Should render customized callout on mouseover', () => {
  const { container } = render(
    <DonutChart
      data={chartPoints}
      innerRadius={55}
      calloutProps={{ doNotLayer: true }}
      onRenderCalloutPerDataPoint={(props: IChartDataPoint) =>
        props ? (
          <div>
            <pre>{JSON.stringify(props, null, 2)}</pre>
          </div>
        ) : null
      }
    />,
  );
  const getById = queryAllByAttribute.bind(null, 'id');
  fireEvent.mouseOver(getById(container, /Pie/i)[0]);
  expect(container).toMatchSnapshot();
});

test('Should set state correctly on blur', () => {
  // Arrange
  const { container } = render(<DonutChart data={chartPoints} innerRadius={55} />);

  // Act
  const getById = queryAllByAttribute.bind(null, 'id');
  fireEvent.blur(getById(container, /Pie/i)[0]);

  //Assert
  // expect(wrapper.find('DonutChartBase').state('focusedArcId')).toBe('');
  // const tree = toJson(wrapper, { mode: 'deep' });
  // expect(tree).toMatchSnapshot();
});

test('Should set state correctly on mouse leave', () => {
  // Arrange
  const { container } = render(<DonutChart data={chartPoints} innerRadius={55} calloutProps={{ doNotLayer: true }} />);

  // Act
  const getById = queryAllByAttribute.bind(null, 'id');
  fireEvent.mouseOver(getById(container, /Pie/i)[0]);
  expect(getById(container, /callout/i)[0]).toBeDefined();
  fireEvent.mouseLeave(getById(container, /Pie/i)[0]);

  // Assert
  expect(getById(container, /callout/i)[0]).toHaveStyle('opacity: 0');
});

test('Should behave correctly on mouse over on legends', () => {
  // Arrange
  const { container } = render(<DonutChart data={chartPoints} innerRadius={55} hideLegend={false} />);

  // Act
  const legend = screen.queryByText('first');
  fireEvent.mouseOver(legend!);

  // Assert
  expect(container).toMatchSnapshot();
});

test('Should set state correctly on mouse click on legends (path where selected legend state is not set)', () => {
  // Arrange
  const { container } = render(<DonutChart data={chartPoints} innerRadius={55} hideLegend={false} />);

  // Act
  const legend = screen.queryByText('first');
  fireEvent.click(legend!);

  // Assert
  expect(container).toMatchSnapshot();
});

test('Should set state correctly on mouse out of legends', () => {
  // Arrange
  const { container } = render(<DonutChart data={chartPoints} innerRadius={55} hideLegend={false} />);

  // Act
  const legend = screen.queryByText('first');
  fireEvent.mouseOut(legend!);

  // Assert
  expect(container).toMatchSnapshot();
});

test('Should have focus ring on focus event', () => {
  // Arrange
  const { container } = render(<DonutChart data={chartPoints} innerRadius={55} calloutProps={{ doNotLayer: true }} />);

  // Act
  const getById = queryAllByAttribute.bind(null, 'id');
  fireEvent.focus(getById(container, /Pie/i)[0]);

  // Assert
  const getByClass = queryAllByAttribute.bind(null, 'class');
  expect(getByClass(container, /focusRing/i)).toBeDefined();
});
