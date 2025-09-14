/* eslint-disable react/jsx-no-bind */
import * as React from 'react';
import { SunburstChartProps } from './SunburstChart.types';
import { useSunburstChartStyles } from './useSunburstChartStyles.styles';
import { ChartDataPoint } from '../../types/index';
import { areArraysEqual, useRtl } from '../../utilities/index';
import { Legends, Legend, LegendContainer } from '../../index';
import { useId } from '@fluentui/react-utilities';
import { useFocusableGroup } from '@fluentui/react-tabster';
import { ChartPopover } from '../CommonComponents/ChartPopover';
import { ImageExportOptions } from '../../types/index';
import { toImage } from '../../utilities/image-export-utils';
import { Arc } from '../DonutChart/Arc/Arc';
import { ArcData } from '../DonutChart/Arc/Arc.types';
import { scaleLinear as d3ScaleLinear } from 'd3-scale';
import { rgb } from 'd3-color';

const MIN_LEGEND_CONTAINER_HEIGHT = 40;

type Segment = ArcData & {
  node: SunburstNode;
  depth: number;
  path: string[];
  isZeroRemainder?: boolean;
};

interface SunburstNode {
  id: string;
  label: string;
  value?: number;
  children?: SunburstNode[];
  color?: string;
  xAxisCalloutData?: string;
  yAxisCalloutData?: string;
  callOutAccessibilityData?: { ariaLabel?: string; ariaDescription?: string };
  onClick?: () => void;
}

interface SunburstFlatData {
  ids: string[];
  parents: Array<string | null | ''>;
  labels: string[];
  values: number[];
  marker?: {
    colors?: string[];
    pattern?: {
      shape?: string[];
    };
  };
}

// Create a SunburstChart variant which uses these default styles and this styled subcomponent.
/**
 * Sunburst chart component.
 * {@docCategory SunburstChart}
 */
export const SunburstChart: React.FunctionComponent<SunburstChartProps> = React.forwardRef<
  HTMLDivElement,
  SunburstChartProps
>((props, forwardedRef) => {
  console.log('Sunburst data ********8 = ', props.data);
  const _rootElem = React.useRef<HTMLDivElement | null>(null);
  const _uniqText: string = useId('_Sunburst_');
  /* eslint-disable @typescript-eslint/no-explicit-any */
  let _calloutAnchorPoint: ChartDataPoint | null;
  const prevSize = React.useRef<{ width?: number; height?: number }>({});

  const [value, setValue] = React.useState<string | undefined>('');
  const [legend, setLegend] = React.useState<string | undefined>('');
  const [_width, setWidth] = React.useState<number | undefined>(props.width || 300);
  const [_height, setHeight] = React.useState<number | undefined>(props.height || 300);
  const [activeLegend, setActiveLegend] = React.useState<string | undefined>(undefined);
  const [color, setColor] = React.useState<string | undefined>('');
  const [xCalloutValue, setXCalloutValue] = React.useState<string>('');
  const [yCalloutValue, setYCalloutValue] = React.useState<string>('');
  const [selectedLegends, setSelectedLegends] = React.useState<string[]>(props.legendProps?.selectedLegends || []);
  const [focusedArcId, setFocusedArcId] = React.useState<string>('');
  const [dataPointCalloutProps, setDataPointCalloutProps] = React.useState<ChartDataPoint | undefined>();
  const [clickPosition, setClickPosition] = React.useState({ x: 0, y: 0 });
  const [isPopoverOpen, setPopoverOpen] = React.useState(false);
  const prevPropsRef = React.useRef<SunburstChartProps | null>(null);
  const _legendsRef = React.useRef<LegendContainer>(null);
  const _isRTL: boolean = useRtl();

  const focusableAttributes = useFocusableGroup();
  const classes = useSunburstChartStyles(props);

  React.useEffect(() => {
    _fitParentContainer();
  }, []);

  React.useEffect(() => {
    if (prevPropsRef.current) {
      const prevProps = prevPropsRef.current;
      if (!areArraysEqual(prevProps.legendProps?.selectedLegends, props.legendProps?.selectedLegends)) {
        setSelectedLegends(props.legendProps?.selectedLegends || []);
      }
    }
    prevPropsRef.current = props;
  }, [props]);

  React.useEffect(() => {
    if (prevSize.current.height !== props.height || prevSize.current.width !== props.width) {
      _fitParentContainer();
    }
    prevSize.current.height = props.height;
    prevSize.current.width = props.width;
  }, [props.width, props.height]);

  React.useImperativeHandle(
    props.componentRef,
    () => ({
      chartContainer: _rootElem.current,
      toImage: (opts?: ImageExportOptions): Promise<string> => {
        return toImage(_rootElem.current, _legendsRef.current?.toSVG, _isRTL, opts);
      },
    }),
    [],
  );

  function _fitParentContainer(): void {
    const container = _rootElem.current;
    if (!container) {
      return;
    }

    const containerWidth = container.offsetWidth;
    const containerHeight = container.offsetHeight;

    const newWidth = props.width ?? containerWidth;
    const newHeight = props.height
      ? props.height - MIN_LEGEND_CONTAINER_HEIGHT
      : containerHeight - MIN_LEGEND_CONTAINER_HEIGHT;

    setWidth(newWidth);
    setHeight(newHeight);
  }

  function _hoverCallback(data: ChartDataPoint, mouseEvent: React.MouseEvent<SVGPathElement>): void {
    mouseEvent.persist();
    if (_calloutAnchorPoint !== data) {
      _calloutAnchorPoint = data;
      setDataPointCalloutProps(data);
      setClickPosition({ x: mouseEvent.clientX, y: mouseEvent.clientY });
      setValue(data.data!.toString());
      setLegend(data.legend);
      setColor(data.color!);
      setXCalloutValue(data.xAxisCalloutData!);
      setYCalloutValue(data.yAxisCalloutData!);
      setPopoverOpen(true);
    }
  }

  function _focusCallback(
    data: ChartDataPoint,
    id: string,
    event: React.FocusEvent<SVGPathElement>,
    element: SVGPathElement | null,
  ): void {
    setDataPointCalloutProps(data);
    if (element) {
      const elementRect = element.getBoundingClientRect();
      setClickPosition({ x: elementRect.x + elementRect.width / 2, y: elementRect.y });
    }
    setValue(data.data!.toString());
    setLegend(data.legend);
    setColor(data.color!);
    setXCalloutValue(data.xAxisCalloutData!);
    setYCalloutValue(data.yAxisCalloutData!);
    setFocusedArcId(id);
    setPopoverOpen(true);
  }

  function _hoverLeave(): void {
    /**/
    _calloutAnchorPoint = null;
    setPopoverOpen(false);
  }

  function _onBlur(): void {
    setFocusedArcId('');
    setPopoverOpen(false);
  }

  function _onLegendClick(customMessage: string): void {
    if (selectedLegends.indexOf(customMessage) > -1) {
      setSelectedLegends(selectedLegends.filter((legend: string) => legend !== customMessage));
    } else {
      setSelectedLegends([...selectedLegends, customMessage]);
    }
  }

  function _onLegendHover(customMessage: string): void {
    if (props.legendProps?.canSelectMultipleLegends) {
      setActiveLegend(customMessage);
    }
  }

  function _onLegendLeave(isLegendFocused?: boolean): void {
    if (!!isLegendFocused || props.legendProps?.canSelectMultipleLegends) {
      setActiveLegend('');
    }
  }

  function _getHighlightedLegend(): string[] {
    return selectedLegends.length > 0 ? selectedLegends : activeLegend ? [activeLegend] : [];
  }

  // Build tree from data
  const { root, nodes } = buildTree(props.data);

  // Compute layout and segments
  const segments = computeLayout(root, {
    ...props,
    branchValues: props.branchValues || 'remainder',
  });

  const depthCounts: Record<number, number> = {};
  segments.forEach(seg => {
    depthCounts[seg.depth] = (depthCounts[seg.depth] || 0) + 1;
  });

  // Build legend color mapping
  const legendColorMap: Record<string, string> = {};
  const nodeById = new Map<string, SunburstNode & { depth: number }>();
  for (let i = 0; i < nodes.length; i++) {
    const n = nodes[i] as SunburstNode & { depth: number };
    nodeById.set(n.id, n);
  }

  // Get top-level values for legend ordering
  const topLevelValue = new Map<string, number>();
  for (let s = 0; s < segments.length; s++) {
    const seg = segments[s];
    if (seg.depth === 0) {
      const totalForLegend =
        props.branchValues === 'remainder' ? (seg.node as any).__computedTotal || seg.value || 0 : seg.value || 0;
      topLevelValue.set(seg.node.id, totalForLegend);
    }
  }

  const levelNodesRaw = getLegendLevelNodes(nodes);
  const levelNodes = levelNodesRaw
    .map(n => ({
      id: n.id,
      title: n.label || n.id,
      value: topLevelValue.get(n.id) ?? nodeById.get(n.id)?.value ?? 0,
    }))
    .sort((a, b) => (b.value || 0) - (a.value || 0));

  const legendItems: Legend[] = levelNodes.map((ln, index) => {
    const node = nodeById.get(ln.id);
    // Only use colors from data, no fallback colors
    const color = node?.color || 'transparent';
    legendColorMap[ln.id] = color;
    const title = ln.title;
    return {
      title,
      color,
      action: () => _onLegendClick(title),
      hoverAction: () => _onLegendHover(title),
      onMouseOutAction: () => _onLegendLeave(),
    };
  });

  const donutMarginHorizontal = props.hideLabels ? 0 : 80;
  const donutMarginVertical = props.hideLabels ? 0 : 40;
  const innerRadius = props.innerRadius || 0;

  // Calculate the maximum depth from the nodes to determine required radius
  const maxDepth = nodes.reduce((max, node) => {
    const nodeDepth = (node as any).depth || 0;
    return Math.max(max, nodeDepth);
  }, 0);

  // Calculate required radius to fit all layers
  const totalRequiredRadius = innerRadius + getAccumulatedThickness(props, maxDepth + 1);

  // Use the larger of available space or required space to ensure all layers are visible
  const availableRadius = Math.min((_width || 0) - donutMarginHorizontal, (_height || 0) - donutMarginVertical) / 2;
  const outerRadius = Math.max(availableRadius, totalRequiredRadius);

  const centerX = (_width || 0) / 2;
  const centerY = (_height || 0) / 2;

  const activeArc = _expandHighlightedLegends(_getHighlightedLegend(), nodes);

  function _shouldHavePattern(index: number, data: typeof props.data): boolean {
    const patternShapes = data.flat?.marker?.pattern?.shape;
    if (Array.isArray(patternShapes)) {
      if (index < patternShapes.length) {
        const shape = patternShapes[index];
        return !!(shape && shape !== '' && shape !== 'none');
      }
    }
    return false;
  }

  function _getPatternShape(index: number, data: typeof props.data): string {
    const patternShapes = data.flat?.marker?.pattern?.shape;
    if (Array.isArray(patternShapes) && index < patternShapes.length) {
      const shape = patternShapes[index];
      return shape && shape !== '' && shape !== 'none' ? shape : '';
    }
    return '';
  }

  function _generatePatternDef(patternId: string, color: string, shape: string): JSX.Element {
    const key = patternId;

    switch (shape) {
      case '/':
        return (
          <pattern
            key={key}
            id={patternId}
            patternUnits="userSpaceOnUse"
            width={6}
            height={6}
            patternTransform="rotate(45)"
          >
            <rect x={0} y={0} width={6} height={6} fill={color} />
            <line x1={0} y1={0} x2={0} y2={6} stroke="#ffffff" strokeWidth={2} />
          </pattern>
        );

      case 'x':
        return (
          <pattern key={key} id={patternId} patternUnits="userSpaceOnUse" width={8} height={8}>
            <rect x={0} y={0} width={8} height={8} fill={color} />
            <line x1={0} y1={0} x2={8} y2={8} stroke="#ffffff" strokeWidth={1.5} />
            <line x1={0} y1={8} x2={8} y2={0} stroke="#ffffff" strokeWidth={1.5} />
          </pattern>
        );

      case '.':
        return (
          <pattern key={key} id={patternId} patternUnits="userSpaceOnUse" width={8} height={8}>
            <rect x={0} y={0} width={8} height={8} fill={color} />
            <circle cx={4} cy={4} r={1.5} fill="#ffffff" />
          </pattern>
        );

      case '\\':
        return (
          <pattern
            key={key}
            id={patternId}
            patternUnits="userSpaceOnUse"
            width={6}
            height={6}
            patternTransform="rotate(-45)"
          >
            <rect x={0} y={0} width={6} height={6} fill={color} />
            <line x1={0} y1={0} x2={0} y2={6} stroke="#ffffff" strokeWidth={2} />
          </pattern>
        );

      case '|':
        return (
          <pattern key={key} id={patternId} patternUnits="userSpaceOnUse" width={6} height={6}>
            <rect x={0} y={0} width={6} height={6} fill={color} />
            <line x1={3} y1={0} x2={3} y2={6} stroke="#ffffff" strokeWidth={2} />
          </pattern>
        );

      case '-':
        return (
          <pattern key={key} id={patternId} patternUnits="userSpaceOnUse" width={6} height={6}>
            <rect x={0} y={0} width={6} height={6} fill={color} />
            <line x1={0} y1={3} x2={6} y2={3} stroke="#ffffff" strokeWidth={2} />
          </pattern>
        );

      case '+':
        return (
          <pattern key={key} id={patternId} patternUnits="userSpaceOnUse" width={8} height={8}>
            <rect x={0} y={0} width={8} height={8} fill={color} />
            <line x1={4} y1={0} x2={4} y2={8} stroke="#ffffff" strokeWidth={1.5} />
            <line x1={0} y1={4} x2={8} y2={4} stroke="#ffffff" strokeWidth={1.5} />
          </pattern>
        );
      default:
        return (
          <pattern
            key={key}
            id={patternId}
            patternUnits="userSpaceOnUse"
            width={6}
            height={6}
            patternTransform="rotate(45)"
          >
            <rect x={0} y={0} width={6} height={6} fill={color} />
            <line x1={0} y1={0} x2={0} y2={6} stroke="#ffffff" strokeWidth={2} />
          </pattern>
        );
    }
  }

  function _getOriginalDataIndex(segment: Segment, data: typeof props.data): number {
    if (!data.flat) {
      return -1;
    }

    const flatData = data.flat as any;
    const nodeId = segment.node.id;

    if (flatData.ids && Array.isArray(flatData.ids)) {
      const index = flatData.ids.indexOf(nodeId);
      return index;
    }

    return -1;
  }

  function _expandHighlightedLegends(
    selected: string[],
    nodes: Array<SunburstNode & { depth: number; parentId?: string | null }>,
  ): string[] {
    if (!selected || selected.length === 0) {
      return [];
    }

    let depth0Count = 0;
    for (let i = 0; i < nodes.length; i++) {
      if ((nodes[i] as SunburstNode & { depth: number }).depth === 0) {
        depth0Count++;
        if (depth0Count > 1) {
          break;
        }
      }
    }
    const targetDepth = depth0Count === 1 ? 1 : 0;

    const rootsToExpand: SunburstNode[] = [];
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i] as SunburstNode & { depth: number };
      if (n.depth !== targetDepth) {
        continue;
      }
      const title = n.label || n.id;
      if (selected.includes(title) || selected.includes(n.id)) {
        rootsToExpand.push(n);
      }
    }

    const ids = new Set<string>();
    const pushNode = (node: SunburstNode | undefined) => {
      if (!node) {
        return;
      }
      const nodeId = node.id;
      if (typeof nodeId === 'string') {
        ids.add(nodeId);
      }
      const children = node.children || [];
      for (let j = 0; j < children.length; j++) {
        pushNode(children[j]);
      }
    };
    for (let r = 0; r < rootsToExpand.length; r++) {
      pushNode(rootsToExpand[r]);
    }

    return Array.from(ids);
  }

  return nodes.length > 0 ? (
    <div className={classes.root} ref={_rootElem} {...focusableAttributes}>
      <div className={classes.chartWrapper}>
        <svg className={classes.chart} aria-label={props.data.chartTitle} width={_width} height={_height}>
          <g transform={`translate(${centerX},${centerY})`}>
            {/* DEBUG: Check if we have pattern data */}
            {(() => {
              const flatData = (props.data as any).flat;
              return null;
            })()}

            {/* Pattern definitions based on schema data */}
            <defs>
              {segments
                .map((seg, index) => {
                  const segColor = resolveColor(seg, index, props, nodes, legendColorMap);
                  const nodeId = seg.node.id;
                  const flatData = (props.data as any).flat;
                  let patternShape: string | undefined;

                  // Use the same logic as in pattern usage to ensure consistency
                  const patterns = flatData?.patterns || flatData?.marker?.patterns || flatData?.marker?.pattern?.shape;

                  if (patterns && flatData?.ids) {
                    const nodeIndex = flatData.ids.indexOf(nodeId);
                    if (nodeIndex >= 0 && patterns[nodeIndex]) {
                      patternShape = patterns[nodeIndex];
                    }
                  }

                  if (!patternShape) return null;

                  const safeNodeId = nodeId.replace(/[^a-zA-Z0-9-_]/g, '_'); // Replace invalid CSS ID characters
                  const patternId = `pattern_${safeNodeId}_${patternShape.replace(/[^a-zA-Z0-9-_]/g, '_')}`;

                  switch (patternShape) {
                    case '/':
                      return (
                        <pattern
                          key={patternId}
                          id={patternId}
                          patternUnits="userSpaceOnUse"
                          width="8"
                          height="8"
                          patternTransform="rotate(45)"
                        >
                          <rect x="0" y="0" width="8" height="8" fill={segColor} />
                          <line x1="0" y1="0" x2="0" y2="8" stroke="white" strokeWidth="2" />
                        </pattern>
                      );
                    case 'x':
                      return (
                        <pattern key={patternId} id={patternId} patternUnits="userSpaceOnUse" width="10" height="10">
                          <rect x="0" y="0" width="10" height="10" fill={segColor} />
                          <line x1="2" y1="2" x2="8" y2="8" stroke="white" strokeWidth="1.5" />
                          <line x1="8" y1="2" x2="2" y2="8" stroke="white" strokeWidth="1.5" />
                        </pattern>
                      );
                    case '+':
                      return (
                        <pattern key={patternId} id={patternId} patternUnits="userSpaceOnUse" width="10" height="10">
                          <rect x="0" y="0" width="10" height="10" fill={segColor} />
                          <line x1="5" y1="2" x2="5" y2="8" stroke="white" strokeWidth="2" />
                          <line x1="2" y1="5" x2="8" y2="5" stroke="white" strokeWidth="2" />
                        </pattern>
                      );
                    case '.':
                      return (
                        <pattern key={patternId} id={patternId} patternUnits="userSpaceOnUse" width="12" height="12">
                          <rect x="0" y="0" width="12" height="12" fill={segColor} />
                          <circle cx="6" cy="6" r="2.5" fill="white" />
                        </pattern>
                      );
                    case '|':
                      return (
                        <pattern key={patternId} id={patternId} patternUnits="userSpaceOnUse" width="8" height="8">
                          <rect x="0" y="0" width="8" height="8" fill={segColor} />
                          <line x1="4" y1="0" x2="4" y2="8" stroke="white" strokeWidth="2" />
                        </pattern>
                      );
                    case '-':
                      return (
                        <pattern key={patternId} id={patternId} patternUnits="userSpaceOnUse" width="8" height="8">
                          <rect x="0" y="0" width="8" height="8" fill={segColor} />
                          <line x1="0" y1="4" x2="8" y2="4" stroke="white" strokeWidth="2" />
                        </pattern>
                      );
                    case '\\':
                      return (
                        <pattern
                          key={patternId}
                          id={patternId}
                          patternUnits="userSpaceOnUse"
                          width="8"
                          height="8"
                          patternTransform="rotate(-45)"
                        >
                          <rect x="0" y="0" width="8" height="8" fill={segColor} />
                          <line x1="0" y1="0" x2="0" y2="8" stroke="white" strokeWidth="2" />
                        </pattern>
                      );
                    default:
                      return null;
                  }
                })
                .filter(Boolean)}
            </defs>
            {segments.map((seg, i) => {
              const hasChildren = !!(seg.node.children && seg.node.children.length > 0);
              const isRemainderMode = (props.branchValues || 'remainder') === 'remainder';
              const isZeroLeaf = isRemainderMode && !hasChildren && (seg.node.value || 0) === 0;

              // Filter out very small segments (remainder segments) that clutter the visualization
              const angleSpan = seg.endAngle - seg.startAngle;
              // Only filter out segments that are both very small AND appear to be remainder/clutter segments
              // Don't filter out legitimate categories like "Other" even if they're small
              const isVerySmallSegment = angleSpan < 0.01; // Only filter extremely small segments (< ~0.6 degrees)

              // Only skip zero-value leaf segments and extremely small remainder segments
              if (isZeroLeaf || isVerySmallSegment) {
                return null;
              }

              const depthInner = (innerRadius || 0) + getAccumulatedThickness(props, seg.depth);
              const depthOuter = (innerRadius || 0) + getAccumulatedThickness(props, seg.depth + 1);

              const color = resolveColor(seg, i, props, nodes, legendColorMap);

              // Get pattern from schema data - check multiple possible locations
              const nodeId = seg.node.id;
              const flatData = (props.data as any).flat;
              let patternShape: string | undefined;

              // Check for patterns in different possible locations
              const patterns = flatData?.patterns || flatData?.marker?.patterns || flatData?.marker?.pattern?.shape;

              if (patterns && flatData?.ids) {
                const nodeIndex = flatData.ids.indexOf(nodeId);
                if (nodeIndex >= 0 && patterns[nodeIndex]) {
                  patternShape = patterns[nodeIndex];
                }
              }

              // Use the specific pattern ID we generated with safe CSS ID, but also add fallback
              const safeNodeId = nodeId.replace(/[^a-zA-Z0-9-_]/g, '_'); // Replace invalid CSS ID characters
              let finalColor = color; // Default to solid color
              let patternId: string | undefined;

              if (patternShape) {
                patternId = `pattern_${safeNodeId}_${patternShape.replace(/[^a-zA-Z0-9-_]/g, '_')}`;
                // Use pattern URL - Arc component will handle fallback to solid color if pattern fails to render
                finalColor = `url(#${patternId})`;
                console.log(`[PATTERN DEBUG] Using pattern URL: ${finalColor} for segment ${nodeId}`);
              }

              console.log(
                `[ARC COLOR FINAL] Segment ${i} (${nodeId}): originalColor=${color}, patternShape=${patternShape}, safeNodeId=${safeNodeId}, patternId=${patternId}, finalColor=${finalColor}`,
              );

              const arcPoint: ChartDataPoint = {
                data: seg.value,
                legend: seg.node.id,
                color,
                xAxisCalloutData: seg.node.xAxisCalloutData || seg.node.label,
                yAxisCalloutData: seg.node.yAxisCalloutData,
                callOutAccessibilityData: seg.node.callOutAccessibilityData,
                onClick: seg.node.onClick,
              };

              const arcData: ArcData = {
                data: arcPoint,
                startAngle: seg.startAngle,
                endAngle: seg.endAngle,
                index: i,
                padAngle: props.padAngle || 0,
                value: seg.value,
              };

              return (
                <Arc
                  key={`arc-${i}`}
                  data={arcData}
                  innerRadius={Math.max(0, depthInner)}
                  outerRadius={Math.max(0, depthOuter)}
                  color={finalColor}
                  hoverOnCallback={_hoverCallback}
                  onFocusCallback={_focusCallback}
                  hoverLeaveCallback={_hoverLeave}
                  onBlurCallback={_onBlur}
                  activeArc={activeArc}
                  focusedArcId={focusedArcId}
                  uniqText={_uniqText}
                  hideLabels={props.hideLabels}
                  showLabelsInPercent={props.showLabelsInPercent}
                  roundCorners={props.roundCorners}
                />
              );
            })}
          </g>
        </svg>
      </div>
      {isPopoverOpen && (
        <ChartPopover
          xCalloutValue={xCalloutValue}
          yCalloutValue={yCalloutValue}
          culture={props.culture ?? 'en-us'}
          clickPosition={clickPosition}
          isPopoverOpen={isPopoverOpen}
          legend={legend!}
          YValue={value!}
          color={color}
          isCalloutForStack={false}
          customCallout={{
            customizedCallout: props.onRenderCalloutPerDataPoint
              ? props.onRenderCalloutPerDataPoint(dataPointCalloutProps!)
              : undefined,
            customCalloutProps: undefined,
          }}
          isCartesian={false}
          {...props.calloutProps}
        />
      )}
      <div className={classes.legendContainer}>
        <Legends
          legends={legendItems}
          centerLegends
          overflowText={props.legendProps?.overflowText}
          {...props.legendProps}
        />
      </div>
    </div>
  ) : (
    <div role={'alert'} style={{ opacity: '0' }} aria-label={'Graph has no data to display'} />
  );
});
SunburstChart.displayName = 'SunburstChart';

// Helper functions - adapted from the original implementation but simplified for v9

function buildTree(data: SunburstChartProps['data']): {
  root: SunburstNode;
  nodes: Array<SunburstNode & { depth: number; parentId?: string | null }>;
} {
  console.log('[BUILD TREE DEBUG] buildTree called with data:', data);

  if ((data as any).root) {
    console.log('[BUILD TREE DEBUG] Taking root path, root data:', (data as any).root);

    // Check if we also have flat data with colorscale information
    if ((data as any).flat?.marker?.colors) {
      console.log('[BUILD TREE DEBUG] Root path but flat data exists, processing colors from flat data');

      // Extract colorscale for root data using flat data colors
      let colorscale: Array<[number, string]> | undefined;

      // Check if colorscale is provided in the data structure
      if ((data as any).colorscale) {
        colorscale = (data as any).colorscale as Array<[number, string]>;
        console.log('[COLORSCALE DEBUG] Found colorscale in root data:', colorscale);
      } else {
        console.log('[COLORSCALE DEBUG] No colorscale provided in root data');
      }

      // Process marker colors from flat data
      const rawColors = (data as any).flat.marker.colors;
      console.log('[COLORSCALE DEBUG] Raw marker colors from flat data in root path:', rawColors.slice(0, 10));

      // Convert string numeric values to numbers and find min/max for normalization
      const numericValues = rawColors.map((c: any) => {
        if (c === null || c === undefined) return 0;
        const num = typeof c === 'string' ? parseFloat(c) : c;
        return isNaN(num) ? 0 : num;
      });

      const validValues = numericValues.filter((v: number) => !isNaN(v) && isFinite(v));
      const minValue = Math.min(...validValues);
      const maxValue = Math.max(...validValues);
      console.log('[COLORSCALE DEBUG] Root path value range: min =', minValue, 'max =', maxValue);

      // Convert raw values to colors using the colorscale
      const colorResults = numericValues.map((value: number) => {
        if (isNaN(value) || !isFinite(value) || !colorscale) {
          return undefined; // No color interpolation if no colorscale or invalid value
        }

        // Normalize value to [0,1] range based on data min/max
        const normalizedValue = maxValue > minValue ? (value - minValue) / (maxValue - minValue) : 0;
        return interpolateColor(normalizedValue, colorscale);
      });

      // Filter out undefined values
      const markerColors = colorResults.filter((color: string | undefined): color is string => color !== undefined);

      console.log('[COLORSCALE DEBUG] Generated colors from root path:', markerColors?.slice(0, 10));

      // Apply colors to the tree nodes by matching IDs
      const applyColorsToTree = (node: SunburstNode, flatData: any): SunburstNode => {
        const flatIndex = flatData.ids.indexOf(node.id);
        const color = flatIndex >= 0 && flatIndex < markerColors.length ? markerColors[flatIndex] : undefined;

        return {
          ...node,
          color: color || node.color,
          children: node.children?.map(child => applyColorsToTree(child, flatData)),
        };
      };

      const coloredRoot = applyColorsToTree((data as any).root, (data as any).flat);
      console.log('[COLORSCALE DEBUG] Applied colors to root tree');

      const nodes: Array<SunburstNode & { depth: number; parentId?: string | null }> = [];
      const dfs = (n: SunburstNode, depth: number, parentId?: string | null) => {
        nodes.push({
          id: n.id,
          label: n.label,
          value: n.value,
          children: n.children,
          color: n.color,
          depth,
          parentId,
        });
        (n.children || []).forEach(c => dfs(c, depth + 1, n.id));
      };
      dfs(coloredRoot, 0, null);
      return { root: coloredRoot, nodes };
    } else {
      console.log('[BUILD TREE DEBUG] Root path without flat color data');
      const nodes: Array<SunburstNode & { depth: number; parentId?: string | null }> = [];
      const dfs = (n: SunburstNode, depth: number, parentId?: string | null) => {
        nodes.push({
          id: n.id,
          label: n.label,
          value: n.value,
          children: n.children,
          color: n.color,
          depth,
          parentId,
        });
        (n.children || []).forEach(c => dfs(c, depth + 1, n.id));
      };
      dfs((data as any).root, 0, null);
      return { root: (data as any).root, nodes };
    }
  }
  if ((data as any).flat) {
    console.log('[BUILD TREE DEBUG] Processing flat data structure');

    // For flat data, extract colorscale from the schema if available
    let colorscale: Array<[number, string]> | undefined;

    // Check if colorscale is provided in the data structure
    if ((data as any).colorscale) {
      colorscale = (data as any).colorscale as Array<[number, string]>;
      console.log('[COLORSCALE DEBUG] Found colorscale in flat data:', colorscale);
    } else {
      console.log('[COLORSCALE DEBUG] No colorscale provided in flat data');
    }

    // Process marker colors if they exist as numeric values
    let markerColors: string[] | undefined;
    if ((data as any).flat.marker && Array.isArray((data as any).flat.marker.colors)) {
      const rawColors = (data as any).flat.marker.colors;
      console.log('[COLORSCALE DEBUG] Raw marker colors from flat data:', rawColors.slice(0, 10));

      // Convert string numeric values to numbers and find min/max for normalization
      const numericValues = rawColors.map((c: any) => {
        if (c === null || c === undefined) return 0;
        const num = typeof c === 'string' ? parseFloat(c) : c;
        return isNaN(num) ? 0 : num;
      });

      const validValues = numericValues.filter((v: number) => !isNaN(v) && isFinite(v));
      const minValue = Math.min(...validValues);
      const maxValue = Math.max(...validValues);
      console.log('[COLORSCALE DEBUG] Flat data value range: min =', minValue, 'max =', maxValue);

      // Convert raw values to colors using the colorscale
      const colorResults = numericValues.map((value: number) => {
        if (isNaN(value) || !isFinite(value) || !colorscale) {
          return undefined; // No color interpolation if no colorscale or invalid value
        }

        // Normalize value to [0,1] range based on data min/max
        const normalizedValue = maxValue > minValue ? (value - minValue) / (maxValue - minValue) : 0;
        console.log('[COLORSCALE DEBUG] Flat data value:', value, 'normalized:', normalizedValue);
        return interpolateColor(normalizedValue, colorscale);
      });

      // Filter out undefined values
      markerColors = colorResults.filter((color: string | undefined): color is string => color !== undefined);

      console.log('[COLORSCALE DEBUG] Generated colors from flat data:', markerColors?.slice(0, 10));
    }

    const root = flatToTree((data as any).flat, markerColors);
    return buildTree({ root });
  }

  // Handle Plotly.js format: check if data is an array with the first item containing marker.colors
  if (Array.isArray(data) && data.length > 0 && data[0].marker?.colors) {
    const plotlyData = data[0];

    // Extract colorscale from the full schema - check multiple possible locations
    let colorscale: Array<[number, string]> | undefined;

    console.log('[COLORSCALE DEBUG] Checking schema structure for colorscale...');
    console.log('[COLORSCALE DEBUG] Full data structure:', JSON.stringify(data, null, 2));

    // Check different possible paths for colorscale
    if ((data as any).layout?.coloraxis?.colorscale) {
      colorscale = (data as any).layout.coloraxis.colorscale as Array<[number, string]>;
      console.log('[COLORSCALE DEBUG] Found colorscale in layout.coloraxis.colorscale:', colorscale);
    } else if ((plotlyData.marker as any)?.colorscale) {
      colorscale = (plotlyData.marker as any).colorscale as Array<[number, string]>;
      console.log('[COLORSCALE DEBUG] Found colorscale in marker.colorscale:', colorscale);
    } else if ((data as any).colorscale) {
      colorscale = (data as any).colorscale as Array<[number, string]>;
      console.log('[COLORSCALE DEBUG] Found colorscale in root colorscale:', colorscale);
    } else if ((plotlyData as any).colorscale) {
      colorscale = (plotlyData as any).colorscale as Array<[number, string]>;
      console.log('[COLORSCALE DEBUG] Found colorscale in plotlyData.colorscale:', colorscale);
    } else {
      console.log('[COLORSCALE DEBUG] No colorscale found in any expected location');
    }

    // Extract colors from Plotly.js binary format or array
    let markerColors: string[] | undefined;
    if (plotlyData.marker?.colors) {
      if (typeof plotlyData.marker.colors === 'object' && plotlyData.marker.colors.bdata) {
        // Handle binary color data (base64 encoded float array)
        try {
          const binaryData = atob(plotlyData.marker.colors.bdata);
          const floatArray = new Float64Array(binaryData.length / 8);
          for (let i = 0; i < floatArray.length; i++) {
            const bytes = binaryData.slice(i * 8, (i + 1) * 8);
            const view = new DataView(new ArrayBuffer(8));
            for (let j = 0; j < 8; j++) {
              view.setUint8(j, bytes.charCodeAt(j));
            }
            floatArray[i] = view.getFloat64(0, true); // little endian
          }

          // Find min/max values for normalization
          const validValues = Array.from(floatArray).filter(v => !isNaN(v) && isFinite(v));
          const minValue = Math.min(...validValues);
          const maxValue = Math.max(...validValues);
          console.log('[COLOR VALUE DEBUG] Data range: min =', minValue, 'max =', maxValue);

          // Convert raw values to RGB colors using the extracted colorscale
          const colorResults = Array.from(floatArray).map(value => {
            if (isNaN(value) || !isFinite(value) || !colorscale) {
              console.log('[COLOR VALUE DEBUG] Invalid value or no colorscale:', value, 'using no color');
              return undefined; // No color interpolation if no colorscale or invalid value
            }

            // Normalize value to [0,1] range based on data min/max
            const normalizedValue = maxValue > minValue ? (value - minValue) / (maxValue - minValue) : 0;
            console.log(
              '[COLOR VALUE DEBUG] Processing value:',
              value,
              'normalized:',
              normalizedValue,
              'with colorscale:',
              colorscale,
            );
            return interpolateColor(normalizedValue, colorscale);
          });

          // Filter out undefined values and assign to markerColors
          markerColors = colorResults.filter((color: string | undefined): color is string => color !== undefined);

          console.log('[COLOR DEBUG] Extracted colors from binary data:', markerColors.slice(0, 10));
        } catch (e) {
          console.warn('Failed to parse binary color data:', e);
        }
      } else if (Array.isArray(plotlyData.marker.colors)) {
        markerColors = plotlyData.marker.colors;
      }
    }

    // Convert Plotly.js format to flat format
    const flatData: SunburstFlatData = {
      ids: plotlyData.ids || [],
      labels: plotlyData.labels || plotlyData.ids || [],
      parents: plotlyData.parents || [],
      values: plotlyData.values || [],
    };

    const root = flatToTree(flatData, markerColors);
    return buildTree({ root });
  }

  return { root: { id: 'root', label: 'Root', value: 0 }, nodes: [] };
}

// Color interpolation function using D3 similar to GroupedVerticalBarChart
function interpolateColor(value: number, colorscale?: Array<[number, string]>): string {
  console.log('[INTERPOLATE DEBUG] Called with value:', value, 'colorscale:', colorscale);

  // Clamp value to [0, 1] range
  const normalizedValue = Math.max(0, Math.min(1, value));

  // Extract start and end colors from plotly colorscale if provided
  if (colorscale && colorscale.length >= 1) {
    // Handle multi-color colorscale with proper interpolation across all color stops
    console.log('[INTERPOLATE DEBUG] Multi-color colorscale with', colorscale.length, 'color stops');

    // Sort colorscale by position to ensure proper interpolation
    const sortedColorscale = [...colorscale].sort((a, b) => a[0] - b[0]);

    // Find the appropriate color segment for the normalized value
    for (let i = 0; i < sortedColorscale.length - 1; i++) {
      const [pos1, color1] = sortedColorscale[i];
      const [pos2, color2] = sortedColorscale[i + 1];

      if (normalizedValue >= pos1 && normalizedValue <= pos2) {
        // Interpolate between these two colors
        const segmentProgress = pos2 > pos1 ? (normalizedValue - pos1) / (pos2 - pos1) : 0;
        const colorInterpolator = d3ScaleLinear<string>().domain([0, 1]).range([color1, color2]);
        const result = rgb(colorInterpolator(segmentProgress)).formatRgb();
        console.log(
          '[INTERPOLATE DEBUG] Interpolating between',
          color1,
          'and',
          color2,
          'progress:',
          segmentProgress,
          'result:',
          result,
        );
        return result;
      }
    }

    // If value is outside the range, use the closest color
    if (normalizedValue <= sortedColorscale[0][0]) {
      const result = sortedColorscale[0][1];
      console.log('[INTERPOLATE DEBUG] Using first color:', result);
      return result;
    } else {
      const result = sortedColorscale[sortedColorscale.length - 1][1];
      console.log('[INTERPOLATE DEBUG] Using last color:', result);
      return result;
    }
  }

  console.log('[INTERPOLATE DEBUG] No colorscale provided, returning undefined');
  // If no colorscale provided, return undefined to indicate no color should be applied
  return 'transparent';
}
function flatToTree(flat: SunburstFlatData, markerColors?: string[]): SunburstNode {
  const map: Record<string, SunburstNode & { parent?: string | null }> = {};

  flat.ids.forEach((id, i) => {
    const color = markerColors ? markerColors[i] : undefined;
    const rawValue = i < flat.values.length ? flat.values[i] : 0;
    const value = isNaN(rawValue) ? 0 : rawValue;
    const existing = map[id];
    if (existing) {
      existing.label = flat.labels[i];
      existing.value = value;
      if (!existing.color && color) {
        existing.color = color;
      }
    } else {
      map[id] = { id, label: flat.labels[i], value, children: [], color };
    }
  });

  flat.ids.forEach((id, i) => {
    const parent = flat.parents[i];
    if (!parent) {
      return;
    }
    if (!map[parent]) {
      map[parent] = { id: parent, label: String(parent), value: 0, children: [] };
    }
    map[parent].children = map[parent].children || [];
    map[parent].children!.push(map[id]);
  });

  const roots: SunburstNode[] = [];
  for (const key in map) {
    if (!Object.prototype.hasOwnProperty.call(map, key)) {
      continue;
    }
    const n = map[key];
    const idx = flat.ids.indexOf(n.id);
    const p = idx >= 0 ? flat.parents[idx] : undefined;
    if (!p) {
      roots.push(n);
    }
  }
  if (roots.length === 1) {
    return roots[0];
  }
  return { id: 'root', label: 'Root', value: 0, children: roots };
}

function rollup(node: SunburstNode, mode: SunburstChartProps['branchValues']): number {
  if (!node.children || node.children.length === 0) {
    const nodeValue = node.value || 0;
    return isNaN(nodeValue) ? 0 : nodeValue;
  }

  const childSum = node.children.reduce((s, c) => s + rollup(c, mode), 0);

  if (mode === 'total') {
    const nodeValue = node.value || 0;
    return isNaN(nodeValue) ? 0 : nodeValue;
  } else {
    const rawNodeValue = node.value || 0;
    const nodeValue = isNaN(rawNodeValue) ? 0 : rawNodeValue;
    const totalSize = nodeValue + childSum;

    (node as any).__computedTotal = totalSize;
    (node as any).__remainder = nodeValue;

    return totalSize;
  }
}

function computeLayout(root: SunburstNode, props: SunburstChartProps): Segment[] {
  const start = props.startAngle || 0;
  const end = props.endAngle || Math.PI * 2;
  rollup(root, props.branchValues);

  const segments: Segment[] = [];
  const sortFn = getSortFn(props);

  if (props.branchValues === 'remainder') {
    const fullSpan = end - start;
    const isVirtualRoot =
      root.id === '__virtual_root__' ||
      root.id === '__multi_root__' ||
      (root.id !== '__plotly_center__' &&
        root.id === 'root' &&
        Array.isArray(root.children) &&
        root.children.length > 1);
    const topLevel: SunburstNode[] = root.id === '__plotly_center__' || isVirtualRoot ? root.children || [] : [root];
    const getTotal = (n: SunburstNode) =>
      (n as any).__computedTotal !== undefined ? (n as any).__computedTotal : n.value || 0;
    const globalTotal = topLevel.reduce((s, n) => s + getTotal(n), 0) || 1;

    const traverseGlobal = (node: SunburstNode, depth: number, a0: number, a1: number, parentPath: string[]) => {
      if (depth > (props.maxDepth ?? Number.POSITIVE_INFINITY)) {
        return;
      }
      if (depth >= 0 && node.id !== '__plotly_center__') {
        if (isVirtualRoot && node === root) {
          // skip
        } else if (a1 > a0) {
          segments.push(makeSeg(node, depth, a0, a1, parentPath, props.branchValues));
        }
      }
      if (!node.children || node.children.length === 0) {
        return;
      }
      const children = [...node.children];
      if (sortFn) {
        children.sort((a, b) => sortFn(a, b, depth));
      }
      let acc = a0;
      const parentEnd = a1;
      for (let i = 0; i < children.length; i++) {
        const c = children[i];
        const t = getTotal(c);
        if (t <= 0) {
          continue;
        }
        let childAngle = fullSpan * (t / globalTotal);

        if (acc + childAngle > parentEnd) {
          childAngle = Math.max(0, parentEnd - acc);
        }
        if (childAngle <= 0) {
          continue;
        }
        const s = acc;
        const e = s + childAngle;
        traverseGlobal(c, depth + 1, s, e, parentPath.concat(node.id));
        acc = e;
        if (acc >= parentEnd - 1e-10) {
          break;
        }
      }
    };

    if (isVirtualRoot) {
      let running = start;
      for (let i = 0; i < topLevel.length; i++) {
        const p = topLevel[i];
        const pt = getTotal(p);
        if (pt <= 0) {
          continue;
        }
        let pAngle = fullSpan * (pt / globalTotal);
        if (running + pAngle > end) {
          pAngle = Math.max(0, end - running);
        }
        const pStart = running;
        const pEnd = pStart + pAngle;
        traverseGlobal(p, 0, pStart, pEnd, []);
        running = pEnd;
        if (running >= end - 1e-10) {
          break;
        }
      }
    } else {
      let running = start;
      for (let i = 0; i < topLevel.length; i++) {
        const p = topLevel[i];
        const pt = getTotal(p);
        if (pt <= 0) {
          continue;
        }
        let pAngle = fullSpan * (pt / globalTotal);
        if (running + pAngle > end) {
          pAngle = Math.max(0, end - running);
        }
        const pStart = running;
        const pEnd = pStart + pAngle;
        traverseGlobal(p, 0, pStart, pEnd, []);
        running = pEnd;
        if (running >= end - 1e-10) {
          break;
        }
      }
    }

    return segments;
  }

  // Non-remainder mode (existing logic)
  const traverse = (
    node: SunburstNode,
    depth: number,
    a0: number,
    a1: number,
    parentPath: string[],
    isMultiRootChild = false,
  ) => {
    if (depth > (props.maxDepth ?? Number.POSITIVE_INFINITY)) {
      return;
    }
    // Simplified depth handling - render nodes at depth >= -1 except virtual roots
    const isVirtualRoot =
      node.id === '__plotly_center__' || node.id === '__virtual_root__' || node.id === '__multi_root__';
    const shouldRender = depth >= -1 && !isVirtualRoot;

    if (shouldRender) {
      // For multi-root children, they should render at their exact depth (starting from 0)
      // For single-root nodes, map depth -1 to 0, depth 0 to 1, etc.
      const segmentDepth = isMultiRootChild ? depth : depth + 1;
      const segment = makeSeg(node, segmentDepth, a0, a1, parentPath, props.branchValues);
      segments.push(segment);
    }
    if (!node.children || node.children.length === 0) {
      return;
    }
    const children = [...node.children];
    if (sortFn) {
      children.sort((a, b) => sortFn(a, b, depth));
    }
    const getNodeValue = (n: SunburstNode) => n.value || 0;
    const total = children.reduce((s, c) => s + getNodeValue(c), 0) || 1;
    let acc = a0;
    const totalAngle = a1 - a0;
    for (let i = 0; i < children.length; i++) {
      const c = children[i];
      const v = getNodeValue(c);
      if (v <= 0) {
        continue;
      }
      const ang = totalAngle * (v / total);
      const s = acc;
      const e = s + ang;
      traverse(c, depth + 1, s, e, parentPath.concat(node.id), isMultiRootChild);
      acc = e;
    }
  };

  if (root.id === '__plotly_center__' || root.id === '__virtual_root__') {
    traverse(root, -1, start, end, [], false);
  } else if (root.id === '__multi_root__') {
    // For multi-root, render children directly at depth 0 (no central gap)
    if (root.children && root.children.length > 0) {
      const children = [...root.children];

      if (sortFn) {
        children.sort((a, b) => sortFn(a, b, 0));
      }
      const getNodeValue = (n: SunburstNode) => n.value || 0;
      const total = children.reduce((s, c) => s + getNodeValue(c), 0) || 1;

      let acc = start;
      const totalAngle = end - start;
      for (let i = 0; i < children.length; i++) {
        const c = children[i];
        const v = getNodeValue(c);
        const ang = totalAngle * (v / total);
        const s = acc;
        const e = s + ang;
        // For multi-root children, start at depth 0 and mark them as multi-root children
        traverse(c, 0, s, e, [], true);
        acc = e;
      }
    }
  } else {
    traverse({ ...root, children: root.children || [] }, -1, start, end, [], false);
  }

  // Debug: Log segment count by depth
  const segmentsByDepth: Record<number, number> = {};
  segments.forEach(seg => {
    segmentsByDepth[seg.depth] = (segmentsByDepth[seg.depth] || 0) + 1;
  });
  return segments;
}

function makeSeg(
  node: SunburstNode,
  depth: number,
  startAngle: number,
  endAngle: number,
  path: string[],
  branchValues: SunburstChartProps['branchValues'],
): Segment {
  let displayValue = node.value || 0;
  let layoutValue = node.value || 0;
  let remainderValue = undefined;

  if (branchValues === 'remainder' && (node as any).__computedTotal !== undefined) {
    layoutValue = (node as any).__computedTotal;
    remainderValue = (node as any).__remainder;
    displayValue = remainderValue !== undefined ? remainderValue : node.value || 0;
  }

  return {
    data: { legend: node.id, data: displayValue, color: node.color, remainder: remainderValue } as any,
    startAngle,
    endAngle,
    index: 0,
    padAngle: 0,
    value: layoutValue,
    node,
    depth,
    path,
  };
}

function getAccumulatedThickness(props: SunburstChartProps, level: number): number {
  const base = props.levelThickness || 40;
  if (typeof base === 'number') {
    return base * level;
  }
  let acc = 0;
  for (let i = 0; i < level; i++) {
    acc += base(i);
  }
  return acc;
}

function resolveColor(
  segment: Segment,
  i: number,
  props: SunburstChartProps,
  nodes: Array<SunburstNode & { depth: number }>,
  legendColorMap?: Record<string, string>,
): string {
  if (segment.node.color) {
    return segment.node.color;
  }

  const topAncestor = getTopAncestor(segment, nodes);
  const topId = topAncestor && (topAncestor as SunburstNode).id;

  if (topId && legendColorMap && legendColorMap[topId]) {
    return legendColorMap[topId];
  }

  if (topAncestor && (topAncestor as SunburstNode).color) {
    return (topAncestor as SunburstNode).color!;
  }

  const topValues: { id: string; value: number }[] = [];
  const levelCandidates = getLegendLevelNodes(nodes);
  for (let k = 0; k < levelCandidates.length; k++) {
    const id = levelCandidates[k].id;
    const n = nodes.find(nn => (nn as SunburstNode & { depth: number }).id === id) as SunburstNode & {
      depth: number;
      value?: number;
    };
    const remainderMode = props.branchValues === 'remainder';
    const val = remainderMode && (n as any)?.__computedTotal !== undefined ? (n as any).__computedTotal : n?.value || 0;
    topValues.push({ id, value: val });
  }

  // Only use colors from data, return transparent if no color is found
  return 'transparent';
}

function getTopAncestor(seg: Segment, nodes: Array<SunburstNode & { depth: number }>): SunburstNode | undefined {
  if (seg.depth === 0) {
    return seg.node;
  }

  const legendLevelNodes = getLegendLevelNodes(nodes);
  const legendIdSet = new Set(legendLevelNodes.map(n => n.id));

  const nodeById = new Map<string, SunburstNode & { depth: number; parentId?: string | null }>();
  for (let i = 0; i < nodes.length; i++) {
    const n = nodes[i] as SunburstNode & { depth: number; parentId?: string | null };
    nodeById.set(n.id, n);
  }

  let current = nodeById.get(seg.node.id);
  while (current) {
    if (legendIdSet.has(current.id)) {
      return current;
    }
    if (!current.parentId) {
      break;
    }
    current = nodeById.get(current.parentId);
  }
  return undefined;
}

function getLegendLevelNodes(nodes: Array<SunburstNode & { depth: number }>): Array<{ id: string; label: string }> {
  let depth0Count = 0;
  for (let i = 0; i < nodes.length; i++) {
    if ((nodes[i] as SunburstNode & { depth: number }).depth === 0) {
      depth0Count++;
      if (depth0Count > 1) {
        break;
      }
    }
  }
  const targetDepth = depth0Count === 1 ? 1 : 0;
  const result: Array<{ id: string; label: string }> = [];
  for (let i = 0; i < nodes.length; i++) {
    const n = nodes[i] as SunburstNode & { depth: number };
    if (n.depth === targetDepth) {
      result.push({ id: n.id, label: n.label });
    }
  }
  return result;
}

function getSortFn(props: SunburstChartProps) {
  if (!props.sort || props.sort === 'none') {
    return undefined;
  }
  const remainderMode = props.branchValues === 'remainder';
  const val = (n: SunburstNode) =>
    remainderMode && (n as any).__computedTotal !== undefined ? (n as any).__computedTotal : n.value || 0;

  if (props.sort === 'asc') {
    return (a: SunburstNode, b: SunburstNode) => val(a) - val(b);
  }
  if (props.sort === 'desc') {
    return (a: SunburstNode, b: SunburstNode) => val(b) - val(a);
  }
  if (typeof props.sort === 'function') {
    const userSort = props.sort;
    return (a: SunburstNode, b: SunburstNode, depth: number) =>
      userSort({ ...a, value: val(a) }, { ...b, value: val(b) }, depth);
  }
  return props.sort;
}
