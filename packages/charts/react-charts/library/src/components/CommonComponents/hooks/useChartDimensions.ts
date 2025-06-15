import * as React from 'react';
import { UseChartDimensionsProps, UseChartDimensionsReturn, Margins } from '../Chart.types';

/**
 * Hook for managing chart dimensions and responsive behavior
 */
export function useChartDimensions(props: UseChartDimensionsProps): UseChartDimensionsReturn {
  const { width, height, parentRef, margins: initialMargins } = props;

  const [containerWidth, setContainerWidth] = React.useState<number>(0);
  const [containerHeight, setContainerHeight] = React.useState<number>(0);
  const [margins, setMargins] = React.useState<Margins>({
    top: initialMargins?.top ?? 20,
    bottom: initialMargins?.bottom ?? 35,
    left: initialMargins?.left ?? 40,
    right: initialMargins?.right ?? 20,
  });

  const chartContainerRef = React.useRef<HTMLDivElement>(null);

  const calculateDimensions = React.useCallback(() => {
    let newWidth = width || 0;
    let newHeight = height || 0;

    if (parentRef) {
      const parentRect = parentRef.getBoundingClientRect();
      newWidth = parentRect.width;
      newHeight = parentRect.height;
    } else if (chartContainerRef.current) {
      const containerRect = chartContainerRef.current.getBoundingClientRect();
      newWidth = containerRect.width;
      newHeight = containerRect.height;
    }

    // Apply minimum dimensions
    newWidth = Math.max(newWidth, 200);
    newHeight = Math.max(newHeight, 200);

    setContainerWidth(newWidth);
    setContainerHeight(newHeight);
  }, [width, height, parentRef]);

  const resize = React.useCallback(() => {
    calculateDimensions();
  }, [calculateDimensions]);

  // Initial calculation and resize listener
  React.useEffect(() => {
    calculateDimensions();

    const handleResize = () => {
      calculateDimensions();
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [calculateDimensions]);

  // Update margins when initialMargins changes
  React.useEffect(() => {
    if (initialMargins) {
      setMargins({
        top: initialMargins.top ?? 20,
        bottom: initialMargins.bottom ?? 35,
        left: initialMargins.left ?? 40,
        right: initialMargins.right ?? 20,
      });
    }
  }, [initialMargins]);

  return {
    containerWidth,
    containerHeight,
    margins,
    resize,
  };
}
