jest.mock('react-dom');
import * as React from 'react';
import { resetIds } from '../../Utilities';
import * as renderer from 'react-test-renderer';
import { mount, ReactWrapper } from 'enzyme';
import { IDonutChartProps, DonutChart } from './index';
import { IDonutChartState, DonutChartBase } from './DonutChart.base';
import { IChartProps, IChartDataPoint } from '../../index';
import toJson from 'enzyme-to-json';

// Wrapper of the DonutChart to be tested.
let wrapper: ReactWrapper<IDonutChartProps, IDonutChartState, DonutChartBase> | undefined;

function sharedBeforeEach() {
  resetIds();
}

function sharedAfterEach() {
  if (wrapper) {
    wrapper.unmount();
    wrapper = undefined;
  }

  // Do this after unmounting the wrapper to make sure if any timers cleaned up on unmount are
  // cleaned up in fake timers world
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((global.setTimeout as any).mock) {
    jest.useRealTimers();
  }
}

const points: IChartDataPoint[] = [
  { legend: 'first', data: 20000, color: '#E5E5E5', xAxisCalloutData: '2020/04/30' },
  { legend: 'second', data: 39000, color: '#0078D4', xAxisCalloutData: '2020/04/20' },
];

const chartTitle = 'Stacked Bar chart example';

const chartPoints: IChartProps = {
  chartTitle: chartTitle,
  chartData: points,
};

describe('DonutChart snapShot testing', () => {
  it('renders DonutChart correctly', () => {
    // Arrange
    const component = renderer.create(<DonutChart data={chartPoints} innerRadius={55} />);

    // Assert
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders hideLegend correctly', () => {
    const component = renderer.create(<DonutChart data={chartPoints} hideLegend={true} />);
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders hideTooltip correctly', () => {
    // Arrange
    const component = renderer.create(<DonutChart data={chartPoints} hideTooltip={true} />);

    // Assert
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders enabledLegendsWrapLines correctly', () => {
    // Arrange
    const component = renderer.create(<DonutChart data={chartPoints} enabledLegendsWrapLines={true} />);

    // Assert
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders value inside onf the pie', () => {
    // Arrange
    const component = renderer.create(<DonutChart data={chartPoints} valueInsideDonut={1000} />);

    // Assert
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});

describe('DonutChart - basic props', () => {
  beforeEach(sharedBeforeEach);
  afterEach(sharedAfterEach);

  it('Should mount legend when hideLegend false ', () => {
    // Arrange
    wrapper = mount(<DonutChart data={chartPoints} />);

    // Assert
    const hideLegendDOM = wrapper.getDOMNode().querySelectorAll('[class^="legendContainer"]');
    expect(hideLegendDOM).toBeDefined();
  });

  it('Should mount callout when hideTootip false ', () => {
    // Arrange
    wrapper = mount(<DonutChart data={chartPoints} />);

    // Assert
    const hideLegendDOM = wrapper.getDOMNode().querySelectorAll('[class^="ms-Layer"]');
    expect(hideLegendDOM).toBeDefined();
  });

  it('Should not render onRenderCalloutPerStack ', () => {
    // Arrange
    wrapper = mount(<DonutChart data={chartPoints} />);

    // Assert
    const renderedDOM = wrapper.getDOMNode().getElementsByClassName('.onRenderCalloutPerStack');
    expect(renderedDOM!.length).toBe(0);
  });

  it('Should render onRenderCalloutPerDataPoint ', () => {
    // Arrange
    wrapper = mount(
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

    // Assert
    const renderedDOM = wrapper.getDOMNode().getElementsByClassName('.onRenderCalloutPerDataPoint');
    expect(renderedDOM).toBeDefined();
  });

  it('Should not render onRenderCalloutPerDataPoint ', () => {
    // Arrange
    wrapper = mount(<DonutChart data={chartPoints} />);

    // Assert
    const renderedDOM = wrapper.getDOMNode().getElementsByClassName('.onRenderCalloutPerDataPoint');
    expect(renderedDOM!.length).toBe(0);
  });
});

describe('DonutChart - mouse events', () => {
  beforeEach(sharedBeforeEach);
  afterEach(sharedAfterEach);

  it('Should render callout correctly on mouseover', () => {
    // Arrange
    wrapper = mount(<DonutChart data={chartPoints} innerRadius={55} calloutProps={{ doNotLayer: true }} />);

    // Act
    wrapper.find('path[id^="_Pie_"]').at(0).simulate('mouseover');

    // Assert
    const tree = toJson(wrapper, { mode: 'deep' });
    expect(tree).toMatchSnapshot();
  });

  it('Should render callout correctly on mousemove', () => {
    // Arrange
    wrapper = mount(<DonutChart data={chartPoints} innerRadius={55} calloutProps={{ doNotLayer: true }} />);

    // Act
    wrapper.find('path[id^="_Pie_"]').at(0).simulate('mousemove');
    const html1 = wrapper.html();
    wrapper.find('path[id^="_Pie_"]').at(0).simulate('mouseleave');
    wrapper.find('path[id^="_Pie_"]').at(1).simulate('mousemove');
    const html2 = wrapper.html();

    // Assert
    expect(html1).not.toBe(html2);
  });

  it('Should render customized callout on mouseover', () => {
    // Arrange
    wrapper = mount(
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

    // Act
    wrapper.find('path[id^="_Pie_"]').at(0).simulate('mouseover');

    // Assert
    const tree = toJson(wrapper, { mode: 'deep' });
    expect(tree).toMatchSnapshot();
  });

  describe('DonutChart - value inside donut handler event testing', () => {
    beforeEach(sharedBeforeEach);
    afterEach(sharedAfterEach);

    it('Should render callout correctly on valueinside', () => {
      // Arrange
      wrapper = mount(<DonutChart data={chartPoints} innerRadius={55} valueInsideDonut={'Text inside'} />);

      // Assert before Act
      expect(wrapper.find('DonutChartBase').state('showHover')).toBe(false);

      // Act
      wrapper.find('DonutChartBase').setState({ activeLegend: 'first' });
      wrapper.mount();
      wrapper.find('path[id^="_Pie_"]').at(0).simulate('mouseover');

      // Assert
      expect(wrapper.find('DonutChartBase').state('showHover')).toBe(true);
      const tree = toJson(wrapper, { mode: 'deep' });
      expect(tree).toMatchSnapshot();
    });
  });

  describe('DonutChart - on dismiss handler event testing', () => {
    beforeEach(sharedBeforeEach);
    afterEach(sharedAfterEach);

    it('Should set state correctly on blur', () => {
      // Arrange
      wrapper = mount(<DonutChart data={chartPoints} innerRadius={55} />);

      // Act
      wrapper.find('path[id^="_Pie_"]').at(0).simulate('blur');

      //Assert
      expect(wrapper.find('DonutChartBase').state('focusedArcId')).toBe('');
      const tree = toJson(wrapper, { mode: 'deep' });
      expect(tree).toMatchSnapshot();
    });

    it('Should set state correctly on focus', () => {
      // Arrange
      wrapper = mount(<DonutChart data={chartPoints} innerRadius={55} />);

      // Act
      wrapper.find('path[id^="_Pie_"]').at(0).simulate('focus');

      // Assert
      expect(wrapper.find('DonutChartBase').state('showHover')).toBe(true);
      expect(wrapper.find('DonutChartBase').state('legend')).toBe('first');
      expect(wrapper.find('DonutChartBase').state('color')).toBe('#E5E5E5');
      expect(wrapper.find('DonutChartBase').state('xCalloutValue')).toBe('2020/04/30');
      expect(wrapper.find('DonutChartBase').state('yCalloutValue')).toBeUndefined();
      expect(wrapper.find('DonutChartBase').state('callOutAccessibilityData')).toBeUndefined();
      const tree = toJson(wrapper, { mode: 'deep' });
      expect(tree).toMatchSnapshot();
    });

    it('Should set state correctly on close callout', () => {
      // Arrange
      wrapper = mount(<DonutChart data={chartPoints} innerRadius={55} calloutProps={{ doNotLayer: true }} />);

      // Act
      wrapper.find('path[id^="_Pie_"]').at(0).simulate('focus');
      const callout = wrapper.find('Callout').at(0);
      callout.simulate('close');

      //Assert
      expect(wrapper.find('DonutChartBase').state('showHover')).toBe(true);
      expect(wrapper.find('DonutChartBase').state('legend')).toBe('first');
      expect(wrapper.find('DonutChartBase').state('color')).toBe('#E5E5E5');
      expect(wrapper.find('DonutChartBase').state('xCalloutValue')).toBe('2020/04/30');
      expect(wrapper.find('DonutChartBase').state('yCalloutValue')).toBeUndefined();
      expect(wrapper.find('DonutChartBase').state('callOutAccessibilityData')).toBeUndefined();
      const tree = toJson(wrapper, { mode: 'deep' });
      expect(tree).toMatchSnapshot();
    });

    it('Should set state correctly on mouse leave', () => {
      // Arrange
      wrapper = mount(<DonutChart data={chartPoints} innerRadius={55} />);

      // Act
      wrapper.find('DonutChartBase').first().at(0).simulate('mouseleave');

      // Assert
      expect(wrapper.find('DonutChartBase').state('showHover')).toBe(false);
      const tree = toJson(wrapper, { mode: 'deep' });
      expect(tree).toMatchSnapshot();
    });

    it('Should behave correctly on mouse over on legends', () => {
      // Arrange
      wrapper = mount(<DonutChart data={chartPoints} innerRadius={55} hideLegend={false} />);

      // Act
      wrapper.find('LegendsBase').find('button').at(0).simulate('mouseover');

      // Assert
      const tree = toJson(wrapper, { mode: 'deep' });
      expect(tree).toMatchSnapshot();
    });

    it('Should set state correctly on mouse click on legends (path where selected legend state is not set)', () => {
      // Arrange
      wrapper = mount(<DonutChart data={chartPoints} innerRadius={55} hideLegend={false} />);

      // Act
      wrapper.find('LegendsBase').find('button').at(0).simulate('click');

      // Assert
      expect(wrapper.find('DonutChartBase').state('selectedLegend')).toBe('first');
      const tree = toJson(wrapper, { mode: 'deep' });
      expect(tree).toMatchSnapshot();
    });

    it('Should set state correctly on mouse click on legends (path where selected legend state is set)', () => {
      // Arrange
      wrapper = mount(<DonutChart data={chartPoints} innerRadius={55} hideLegend={false} />);

      // Act
      wrapper.find('DonutChartBase').setState({ selectedLegend: 'first' });
      wrapper.find('LegendsBase').find('button').at(0).simulate('click');

      // Assert
      expect(wrapper.find('DonutChartBase').state('selectedLegend')).toBe('');
      const tree = toJson(wrapper, { mode: 'deep' });
      expect(tree).toMatchSnapshot();
    });

    it('Should set state correctly on mouse out of legends', () => {
      // Arrange
      wrapper = mount(<DonutChart data={chartPoints} innerRadius={55} hideLegend={false} />);

      // Act
      wrapper.find('LegendsBase').find('button').at(0).simulate('mouseout');

      // Assert
      expect(wrapper.find('DonutChartBase').state('activeLegend')).toBe('');
      const tree = toJson(wrapper, { mode: 'deep' });
      expect(tree).toMatchSnapshot();
    });

    it('Should set the height and width correctly as given in props', () => {
      // Arrange
      wrapper = mount(<DonutChart data={chartPoints} innerRadius={55} height={200} width={600} />);

      // Act
      wrapper.find('path[id^="_Pie_"]').at(0).simulate('mouseover');

      // Assert
      expect(wrapper.find('DonutChartBase').state('_height')).toEqual(160);
      expect(wrapper.find('DonutChartBase').state('_width')).toEqual(600);
      const tree = toJson(wrapper, { mode: 'deep' });
      expect(tree).toMatchSnapshot();
    });
  });
});
