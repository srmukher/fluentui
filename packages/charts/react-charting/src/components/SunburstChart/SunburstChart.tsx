import * as React from 'react';
import { styled } from '../../Utilities';
import { getStyles } from './SunburstChart.styles';
import { SunburstChartBase } from './SunburstChart.base';
import { ISunburstChartProps, ISunburstChartStyleProps, ISunburstChartStyles } from './SunburstChart.types';

export const SunburstChart: React.FunctionComponent<ISunburstChartProps> = styled<
  ISunburstChartProps,
  ISunburstChartStyleProps,
  ISunburstChartStyles
>(SunburstChartBase, getStyles);
