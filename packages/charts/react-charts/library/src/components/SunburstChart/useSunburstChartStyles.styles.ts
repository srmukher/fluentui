import { makeStyles, mergeClasses } from '@griffel/react';
import { tokens, typographyStyles } from '@fluentui/react-theme';
import { SunburstChartProps, SunburstChartStyles } from './SunburstChart.types';
import type { SlotClassNames } from '@fluentui/react-utilities';

/**
 * @internal
 */
export const sunburstClassNames: SlotClassNames<SunburstChartStyles> = {
  root: 'fui-sunburst__root',
  chart: 'fui-sunburst__chart',
  legendContainer: 'fui-sunburst__legendContainer',
  chartWrapper: 'fui-sunburst__chartWrapper',
};

/**
 * Base Styles
 */
const useStyles = makeStyles({
  root: {
    ...typographyStyles.body1,
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    alignItems: 'center',
  },
  chart: {
    boxSizing: 'content-box',
    alignmentAdjust: 'center',
    display: 'block',
    overflow: 'visible',
  },
  legendContainer: {
    paddingTop: tokens.spacingVerticalL,
    width: '100%',
  },
  chartWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
});

/**
 * Apply styling to the SunburstChart component
 */
export const useSunburstChartStyles = (props: SunburstChartProps): SunburstChartStyles => {
  const { className } = props;
  const baseStyles = useStyles();

  return {
    root: mergeClasses(sunburstClassNames.root, baseStyles.root, className),
    chart: mergeClasses(sunburstClassNames.chart, baseStyles.chart),
    legendContainer: mergeClasses(sunburstClassNames.legendContainer, baseStyles.legendContainer),
    chartWrapper: mergeClasses(sunburstClassNames.chartWrapper, baseStyles.chartWrapper),
  };
};
