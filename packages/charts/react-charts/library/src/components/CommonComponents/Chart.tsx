import * as React from 'react';
import { useChartDimensions } from './hooks/useChartDimensions';
import { useChartScales } from './hooks/useChartScales';
import { useChartInteraction } from './hooks/useChartInteraction';
import { Axis } from './Axis';
import { ChartPopover } from './ChartPopover';
import { Legends } from '../Legends/index';
import { useChartStyles } from './useChartStyles.styles';
import { UnifiedChartProps, ChartRenderProps, CoordinateSystem, AxisType, ChartDataPoint } from './Chart.types';

/**
 * Unified Chart component that supports multiple coordinate systems
 */
export const UnifiedChart: React.FunctionComponent<UnifiedChartProps> = React.forwardRef<
  HTMLDivElement,
  UnifiedChartProps
>((props, forwardedRef) => {
  const {
    data,
    axes,
    coordinateSystem = CoordinateSystem.Cartesian,
    coordinateSystemProps,
    calloutProps,
    legendProps,
    children,
    chartTitle,
    hideLegend = false,
    hideTooltip = false,
    svgProps,
    onChartMouseLeave,
    componentRef,
    ...restProps
  } = props;

  // Use shared hooks
  const { containerWidth, containerHeight, margins, resize } = useChartDimensions({
    width: props.width,
    height: props.height,
    parentRef: props.parentRef,
    margins: props.margins,
  });

  const { scales, getPointPosition, getPointFromPosition } = useChartScales({
    data,
    axes,
    coordinateSystem,
    containerWidth,
    containerHeight,
    margins,
    coordinateSystemProps,
  });

  const { handleMouseLeave } = useChartInteraction({
    onChartMouseLeave,
    onPointHover: (point: ChartDataPoint, event: React.MouseEvent) => {
      // Handle point hover - can be extended for tooltips
    },
    onPointClick: (point: ChartDataPoint, event: React.MouseEvent) => {
      // Handle point click - can be extended for interactions
    },
  });

  const classes = useChartStyles(props);

  // Chart container ref
  const chartContainerRef = React.useRef<HTMLDivElement>();

  // Expose chart interface
  React.useImperativeHandle(
    componentRef,
    () => ({
      chartContainer: chartContainerRef.current ?? null,
      resize,
      getScales: () => scales,
    }),
    [scales, resize],
  );

  // Prepare render props for children
  const renderProps: ChartRenderProps = {
    scales,
    containerWidth,
    containerHeight,
    coordinateSystem,
    margins,
    getPointPosition,
    getPointFromPosition,
  };

  // Generate callout if needed
  let callout: JSX.Element | null = null;
  if (!hideTooltip && calloutProps?.isPopoverOpen) {
    callout = <ChartPopover {...calloutProps} />;
  }

  // Generate legends if needed
  let legends: JSX.Element | null = null;
  if (!hideLegend && legendProps && legendProps.legends && legendProps.legends.length > 0) {
    legends = <Legends {...legendProps} legends={legendProps.legends} />;
  }

  return (
    <div
      className={classes.root}
      role="presentation"
      ref={(node: HTMLDivElement) => {
        chartContainerRef.current = node;
        if (typeof forwardedRef === 'function') {
          forwardedRef(node);
        } else if (forwardedRef) {
          forwardedRef.current = node;
        }
      }}
      onMouseLeave={handleMouseLeave}
      {...restProps}
    >
      <div className={classes.chartWrapper}>
        <svg
          width={containerWidth}
          height={containerHeight}
          aria-label={chartTitle}
          style={{ display: 'block' }}
          {...svgProps}
        >
          {/* Render axes */}
          {axes.map((axisConfig, index) => {
            const scale = scales[axisConfig.type];
            if (!scale) return null;

            const transform = getAxisTransform(
              axisConfig.type,
              coordinateSystem,
              containerWidth,
              containerHeight,
              margins,
            );
            const className = getAxisClassName(axisConfig.type, coordinateSystem);

            return (
              <Axis
                key={`${axisConfig.type}-${index}`}
                type={axisConfig.type}
                scale={scale}
                config={axisConfig}
                coordinateSystem={coordinateSystem}
                containerWidth={containerWidth}
                containerHeight={containerHeight}
                margins={margins}
                className={className}
                transform={transform}
                coordinateSystemProps={coordinateSystemProps}
              />
            );
          })}

          {/* Render chart content */}
          {children(renderProps)}

          {/* Render axis titles */}
          {axes.map((axisConfig, index) => {
            if (!axisConfig.title) return null;
            return (
              <text
                key={`title-${axisConfig.type}-${index}`}
                className={classes.axisTitle}
                transform={getAxisTitleTransform(
                  axisConfig.type,
                  coordinateSystem,
                  containerWidth,
                  containerHeight,
                  margins,
                )}
                textAnchor="middle"
              >
                {axisConfig.title}
              </text>
            );
          })}
        </svg>
      </div>

      {/* Render legends */}
      {legends && <div className={classes.legendContainer}>{legends}</div>}

      {/* Render callout */}
      {callout && <React.Suspense fallback={<div>Loading...</div>}>{callout}</React.Suspense>}
    </div>
  );
});

UnifiedChart.displayName = 'UnifiedChart';

/**
 * Get transform for axis positioning
 */
function getAxisTransform(
  axisType: AxisType,
  coordinateSystem: CoordinateSystem,
  containerWidth: number,
  containerHeight: number,
  margins: any,
): string {
  switch (coordinateSystem) {
    case CoordinateSystem.Cartesian:
      switch (axisType) {
        case AxisType.X:
        case AxisType.LogX:
          return `translate(0, ${containerHeight - margins.bottom})`;
        case AxisType.Y:
        case AxisType.LogY:
          return `translate(${margins.left}, 0)`;
        case AxisType.YSecondary:
          return `translate(${containerWidth - margins.right}, 0)`;
        default:
          return '';
      }

    // case CoordinateSystem.Polar:
    //   const centerX = margins.left + (containerWidth - margins.left - margins.right) / 2;
    //   const centerY = margins.top + (containerHeight - margins.top - margins.bottom) / 2;
    //   switch (axisType) {
    //     case AxisType.Angular:
    //       return `translate(${centerX}, ${centerY})`;
    //     case AxisType.Radial:
    //       return `translate(${centerX}, ${centerY})`;
    //     default:
    //       return '';
    //   }

    case CoordinateSystem.Logarithmic:
      switch (axisType) {
        case AxisType.LogX:
          return `translate(0, ${containerHeight - margins.bottom})`;
        case AxisType.LogY:
          return `translate(${margins.left}, 0)`;
        default:
          return '';
      }

    default:
      return '';
  }
}

/**
 * Get CSS class name for axis
 */
function getAxisClassName(axisType: AxisType, coordinateSystem: CoordinateSystem): string {
  const baseClass = 'fui-chart__axis';
  switch (coordinateSystem) {
    case CoordinateSystem.Cartesian:
      return `${baseClass} ${baseClass}--${axisType}`;
    case CoordinateSystem.Polar:
      return `${baseClass} ${baseClass}--polar-${axisType}`;
    case CoordinateSystem.Logarithmic:
      return `${baseClass} ${baseClass}--log-${axisType}`;
    default:
      return baseClass;
  }
}

/**
 * Get transform for axis title positioning
 */
function getAxisTitleTransform(
  axisType: AxisType,
  coordinateSystem: CoordinateSystem,
  containerWidth: number,
  containerHeight: number,
  margins: any,
): string {
  const titleMargin = 8;

  switch (coordinateSystem) {
    case CoordinateSystem.Cartesian:
      switch (axisType) {
        case AxisType.X:
        case AxisType.LogX:
          return `translate(${margins.left + (containerWidth - margins.left - margins.right) / 2}, ${
            containerHeight - titleMargin
          })`;
        case AxisType.Y:
        case AxisType.LogY:
          return `translate(${titleMargin}, ${
            margins.top + (containerHeight - margins.top - margins.bottom) / 2
          }) rotate(-90)`;
        case AxisType.YSecondary:
          return `translate(${containerWidth - titleMargin}, ${
            margins.top + (containerHeight - margins.top - margins.bottom) / 2
          }) rotate(90)`;
        default:
          return '';
      }

    case CoordinateSystem.Polar:
      const centerX = margins.left + (containerWidth - margins.left - margins.right) / 2;
      const centerY = margins.top + (containerHeight - margins.top - margins.bottom) / 2;
      switch (axisType) {
        case AxisType.Angular:
          return `translate(${centerX}, ${margins.top + titleMargin})`;
        case AxisType.Radial:
          return `translate(${margins.left + titleMargin}, ${centerY}) rotate(-90)`;
        default:
          return '';
      }

    case CoordinateSystem.Logarithmic:
      switch (axisType) {
        case AxisType.LogX:
          return `translate(${margins.left + (containerWidth - margins.left - margins.right) / 2}, ${
            containerHeight - titleMargin
          })`;
        case AxisType.LogY:
          return `translate(${titleMargin}, ${
            margins.top + (containerHeight - margins.top - margins.bottom) / 2
          }) rotate(-90)`;
        default:
          return '';
      }

    default:
      return '';
  }
}
