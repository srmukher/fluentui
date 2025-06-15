/**
 * Helper functions for Cartesian axes/scales/margins, extracted for UnifiedChart and hooks.
 */
// Helper functions extracted from CartesianChart.tsx for reuse in UnifiedChart and hooks
// Export all helpers needed for axis/scale/margin creation
// Example:
// export function createNumericXAxis(...) { ... }
// export function createStringXAxis(...) { ... }
// export function createDateXAxis(...) { ... }
// export function createYAxis(...) { ... }
// export function getDomainNRangeValues(...) { ... }
// export function getCartesianMargins(props) { ... }
// ...

export {
  createNumericXAxis,
  createStringXAxis,
  createDateXAxis,
  createYAxis,
  getDomainNRangeValues,
  getMinMaxOfYAxis,
  XAxisTypes,
  YAxisType,
  ChartTypes,
} from '../../utilities/utilities';
export type { IMargins, IXAxisParams, IYAxisParams, ITickParams } from '../../utilities/utilities';
