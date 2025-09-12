import { SunburstChart } from '@fluentui/react-charts';

export { SunburstChartBasic } from './SunburstChartDefault.stories';
export { SunburstChartFlat } from './SunburstChartFlat.stories';
export { SunburstChartCustomSize } from './SunburstChartCustomSize.stories';
export { SunburstChartWithoutColors } from './SunburstChartNoColors.stories';

export default {
  title: 'Charts/SunburstChart',
  component: SunburstChart,
  parameters: {
    docs: {
      description: {
        component:
          'A sunburst chart for hierarchical data visualization. Colors are only rendered when specified in the data - no default color palette is applied.',
      },
    },
  },
};
