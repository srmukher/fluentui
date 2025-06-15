import * as React from 'react';
import { select as d3Select } from 'd3-selection';
import { axisBottom as d3AxisBottom, axisLeft as d3AxisLeft, axisRight as d3AxisRight } from 'd3-axis';
import { format as d3Format } from 'd3-format';
import { timeFormat as d3TimeFormat } from 'd3-time-format';
import { AxisConfig, AxisType, ScaleType, CoordinateSystem } from './Chart.types';

export interface AxisProps {
  type: AxisType;
  scale: any; // D3 scale object
  config: AxisConfig;
  coordinateSystem: CoordinateSystem;
  containerWidth: number;
  containerHeight: number;
  margins: any;
  className?: string;
  transform?: string;
  coordinateSystemProps?: any;
}

/**
 * Unified Axis component that renders different types of axes
 */
export const Axis: React.FunctionComponent<AxisProps> = React.forwardRef<SVGGElement, AxisProps>((props, ref) => {
  const {
    type,
    scale,
    config,
    coordinateSystem,
    containerWidth,
    containerHeight,
    margins,
    className,
    transform,
    coordinateSystemProps,
  } = props;
  const axisRef = React.useRef<SVGGElement>();

  // For polar axes, render SVG elements directly
  if (coordinateSystem === CoordinateSystem.Polar) {
    // Use centerX, centerY, radius from coordinateSystemProps.polar if provided
    const polarProps = coordinateSystemProps?.polar || {};
    const centerX = polarProps.centerX ?? margins.left + (containerWidth - margins.left - margins.right) / 2;
    const centerY = polarProps.centerY ?? margins.top + (containerHeight - margins.top - margins.bottom) / 2;
    const maxRadius =
      polarProps.radius ??
      Math.min(
        (containerWidth - margins.left - margins.right) / 2,
        (containerHeight - margins.top - margins.bottom) / 2,
      );
    const tickCount = config.tickCount || 5;
    const showGrid = config.showGrid !== false;
    const tickPadding = config.tickPadding ?? 10;
    const tickFormat = config.tickFormat;
    let ticks: number[] = [];
    let tickLabels: string[] = [];

    if (type === AxisType.Radial) {
      // Radial: ticks are radii
      ticks = scale.ticks ? scale.ticks(tickCount) : scale.domain();
      tickLabels = ticks.map(t =>
        tickFormat ? (typeof tickFormat === 'function' ? tickFormat(t) : d3Format(tickFormat)(t)) : t.toString(),
      );
      return (
        <g className={className} transform={transform} ref={ref}>
          {/* Render concentric circles for each tick */}
          {showGrid &&
            ticks.map((r, i) => (
              <circle key={i} cx={centerX} cy={centerY} r={scale(r)} fill="none" stroke="#bbb" strokeDasharray="2,2" />
            ))}
          {/* Render tick labels */}
          {ticks.map((r, i) => (
            <text
              key={i}
              x={centerX}
              y={centerY - scale(r) - tickPadding}
              textAnchor="middle"
              fontSize={12}
              fill="#222"
            >
              {tickLabels[i]}
            </text>
          ))}
        </g>
      );
    } else if (type === AxisType.Angular) {
      // Angular: ticks are angles
      ticks = scale.ticks ? scale.ticks(tickCount) : scale.domain();
      tickLabels = ticks.map(t =>
        tickFormat ? (typeof tickFormat === 'function' ? tickFormat(t) : d3Format(tickFormat)(t)) : t.toString(),
      );
      return (
        <g className={className} transform={transform} ref={ref}>
          {/* Render spokes for each angle tick */}
          {showGrid &&
            ticks.map((theta, i) => {
              const angle = scale(theta);
              const x2 = centerX + maxRadius * Math.cos(angle);
              const y2 = centerY + maxRadius * Math.sin(angle);
              return <line key={i} x1={centerX} y1={centerY} x2={x2} y2={y2} stroke="#bbb" strokeDasharray="2,2" />;
            })}
          {/* Render tick labels at the end of each spoke */}
          {ticks.map((theta, i) => {
            const angle = scale(theta);
            const labelRadius = maxRadius + tickPadding + 10;
            const x = centerX + labelRadius * Math.cos(angle);
            const y = centerY + labelRadius * Math.sin(angle);
            return (
              <text key={i} x={x} y={y} textAnchor="middle" fontSize={12} fill="#222" alignmentBaseline="middle">
                {tickLabels[i]}
              </text>
            );
          })}
        </g>
      );
    }
    // Fallback for unknown polar axis type
    return null;
  }

  // For Cartesian and Logarithmic, use D3 axis generators as before
  React.useEffect(() => {
    if (!axisRef.current || !scale) return;
    const axis = createAxis(type, scale, config, coordinateSystem);
    if (axis) {
      d3Select(axisRef.current).call(axis).selectAll('text').attr('aria-hidden', 'true');
    }
  }, [type, scale, config, coordinateSystem, containerWidth, containerHeight, margins]);

  return (
    <g
      ref={(node: SVGGElement | null) => {
        axisRef.current = node!;
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      }}
      className={className}
      transform={transform}
    />
  );
});

Axis.displayName = 'Axis';

/**
 * Create the appropriate D3 axis based on type and coordinate system
 */
function createAxis(type: AxisType, scale: any, config: AxisConfig, coordinateSystem: CoordinateSystem) {
  const { tickCount, tickFormat, tickValues, tickPadding = 10, tickSize = 6, showGrid = true } = config;

  let axis: any;

  switch (coordinateSystem) {
    case CoordinateSystem.Cartesian:
      axis = createCartesianAxis(type, scale, config);
      break;
    case CoordinateSystem.Polar:
      axis = createPolarAxis(type, scale, config);
      break;
    case CoordinateSystem.Logarithmic:
      axis = createLogarithmicAxis(type, scale, config);
      break;
    default:
      axis = createCartesianAxis(type, scale, config);
  }

  // Apply common configurations
  if (tickCount !== undefined) {
    axis.ticks(tickCount);
  }

  if (tickValues) {
    axis.tickValues(tickValues);
  }

  axis.tickPadding(tickPadding).tickSize(tickSize);

  // Apply tick formatting
  if (tickFormat) {
    if (typeof tickFormat === 'string') {
      if (config.scaleType === ScaleType.Time) {
        axis.tickFormat(d3TimeFormat(tickFormat));
      } else {
        axis.tickFormat(d3Format(tickFormat));
      }
    } else {
      axis.tickFormat(tickFormat);
    }
  }

  // Add grid lines if requested
  if (showGrid) {
    axis.tickSizeInner(-getGridSize(type, coordinateSystem));
  }

  return axis;
}

/**
 * Create Cartesian axis
 */
function createCartesianAxis(type: AxisType, scale: any, config: AxisConfig) {
  switch (type) {
    case AxisType.X:
    case AxisType.LogX:
      return d3AxisBottom(scale);
    case AxisType.Y:
    case AxisType.LogY:
      return d3AxisLeft(scale);
    case AxisType.YSecondary:
      return d3AxisRight(scale);
    default:
      return d3AxisBottom(scale);
  }
}

/**
 * Create Polar axis
 */
function createPolarAxis(type: AxisType, scale: any, config: AxisConfig) {
  switch (type) {
    case AxisType.Angular:
      // Angular axis is typically rendered as a circle
      return d3AxisBottom(scale);
    case AxisType.Radial:
      // Radial axis is typically rendered as lines from center
      return d3AxisLeft(scale);
    default:
      return d3AxisBottom(scale);
  }
}

/**
 * Create Logarithmic axis
 */
function createLogarithmicAxis(type: AxisType, scale: any, config: AxisConfig) {
  switch (type) {
    case AxisType.LogX:
      return d3AxisBottom(scale);
    case AxisType.LogY:
      return d3AxisLeft(scale);
    default:
      return d3AxisBottom(scale);
  }
}

/**
 * Get grid size for different axis types
 */
function getGridSize(type: AxisType, coordinateSystem: CoordinateSystem): number {
  switch (coordinateSystem) {
    case CoordinateSystem.Cartesian:
      switch (type) {
        case AxisType.X:
        case AxisType.LogX:
          return 1000; // Large value to extend across chart
        case AxisType.Y:
        case AxisType.LogY:
        case AxisType.YSecondary:
          return 1000; // Large value to extend across chart
        default:
          return 0;
      }
    case CoordinateSystem.Polar:
      switch (type) {
        case AxisType.Angular:
          return 1000; // Large value for circular grid
        case AxisType.Radial:
          return 1000; // Large value for radial grid
        default:
          return 0;
      }
    case CoordinateSystem.Logarithmic:
      switch (type) {
        case AxisType.LogX:
          return 1000;
        case AxisType.LogY:
          return 1000;
        default:
          return 0;
      }
    default:
      return 0;
  }
}
