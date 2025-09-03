import * as React from 'react';
import { SunburstChart } from '../SunburstChart/index';

// Create a DonutChart variant which uses these default styles and this styled subcomponent.
/**
 * Donutchart component.
 * {@docCategory DonutChart}
 */
export const Sunburst: React.FunctionComponent<unknown> = props => {
  // Temporary wrapper to preserve import path; forward props
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <SunburstChart {...(props as any)} />;
};
