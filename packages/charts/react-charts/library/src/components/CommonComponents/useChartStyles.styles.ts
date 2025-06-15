import { makeStyles } from '@griffel/react';
import { ChartStyleProps, ChartStyles } from './Chart.types';

// Define styles at the top level
const useStyles = makeStyles({
  root: {
    display: 'flex',
    width: '100%',
    height: '100%',
    flexDirection: 'column',
    overflow: 'hidden',
    fontFamily: 'inherit',
  },
  chartWrapper: {
    flex: '1 1 auto',
    overflow: 'auto',
  },
  svg: {
    display: 'block',
  },
  axisTitle: {
    fontSize: '12px',
    fontWeight: '600',
    fill: 'currentColor',
    textAnchor: 'middle',
  },
  chartTitle: {
    fontSize: '14px',
    fontWeight: '600',
    fill: 'currentColor',
    textAnchor: 'middle',
  },
  legendContainer: {
    flexShrink: 0,
    padding: '8px',
  },
  tooltip: {
    position: 'absolute',
    pointerEvents: 'none',
    zIndex: 1000,
  },
  svgTooltip: {
    pointerEvents: 'none',
  },
});

export const useChartStyles = (props: ChartStyleProps): ChartStyles => {
  return useStyles();
};
