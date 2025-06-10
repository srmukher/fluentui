import * as React from 'react';
import { styled } from '../../Utilities';
import { getStyles } from './DonutChart.styles';
import SunburstChart from './SunburstBaseChart';

// Create a DonutChart variant which uses these default styles and this styled subcomponent.
/**
 * Donutchart component.
 * {@docCategory DonutChart}
 */
export const Sunburst: React.FunctionComponent<any> = styled<any, any, any>(SunburstChart, getStyles);
