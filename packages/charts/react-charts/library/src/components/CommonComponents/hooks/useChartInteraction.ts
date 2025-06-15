import * as React from 'react';
import { UseChartInteractionProps, UseChartInteractionReturn, ChartDataPoint } from '../Chart.types';

/**
 * Hook for managing chart interactions like hover and click
 */
export function useChartInteraction(props: UseChartInteractionProps): UseChartInteractionReturn {
  const { onChartMouseLeave, onPointHover, onPointClick } = props;

  const handleMouseLeave = React.useCallback(() => {
    onChartMouseLeave?.();
  }, [onChartMouseLeave]);

  const handlePointHover = React.useCallback(
    (point: ChartDataPoint, event: React.MouseEvent) => {
      onPointHover?.(point, event);
    },
    [onPointHover],
  );

  const handlePointClick = React.useCallback(
    (point: ChartDataPoint, event: React.MouseEvent) => {
      onPointClick?.(point, event);
    },
    [onPointClick],
  );

  return {
    handleMouseLeave,
    handlePointHover,
    handlePointClick,
  };
}
