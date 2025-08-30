import { ISunburstChartStyleProps, ISunburstChartStyles } from './SunburstChart.types';

export const getStyles = (props: ISunburstChartStyleProps): ISunburstChartStyles => {
  const { className, width, height, theme } = props;
  return {
    root: [
      theme.fonts.medium,
      'ms-SunburstChart',
      {
        alignItems: 'center',
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
      },
      className,
    ],
    chart: {
      width,
      height,
      boxSizing: 'content-box',
      overflow: 'visible',
      alignmentAdjust: 'center',
      display: 'block',
    },
    legendContainer: {
      paddingTop: '16px',
      width: `${width}px`,
    },
  };
};
