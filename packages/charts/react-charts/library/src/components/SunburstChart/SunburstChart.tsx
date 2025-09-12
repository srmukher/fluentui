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

  console.log('=== SEGMENTS DEPTH DEBUG ===');
  console.log('total segments:', segments.length);
  const depthCounts: Record<number, number> = {};
  segments.forEach(seg => {
    depthCounts[seg.depth] = (depthCounts[seg.depth] || 0) + 1;
  });
  console.log('segments by depth:', depthCounts);
  console.log('props.maxDepth:', props.maxDepth);

  // Extract pattern colors from marker.colors for pattern rendering
  const patternColors = _extractPatternColors(props.data);

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

  function _extractPatternColors(data: typeof props.data): string[] {
    if (data.flat?.marker?.colors && Array.isArray(data.flat.marker.colors)) {
      const markerColors = data.flat.marker.colors;
      const patternShapes = data.flat.marker?.pattern?.shape;

      if (patternShapes && Array.isArray(patternShapes)) {
        const uniquePatternColors = new Set<string>();
        for (let i = 0; i < patternShapes.length && i < markerColors.length; i++) {
          const shape = patternShapes[i];
          if (shape && shape !== '' && shape !== 'none') {
            uniquePatternColors.add(markerColors[i]);
          }
        }
        return Array.from(uniquePatternColors);
      } else {
        return [];
      }
    }
    return [];
  }

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
            <rect x={0} y={0} width={6} height={6} fill="#ffffff" />
            <line x1={0} y1={0} x2={0} y2={6} stroke={color} strokeWidth={2} />
          </pattern>
        );

      case 'x':
        return (
          <pattern key={key} id={patternId} patternUnits="userSpaceOnUse" width={8} height={8}>
            <rect x={0} y={0} width={8} height={8} fill="#ffffff" />
            <line x1={0} y1={0} x2={8} y2={8} stroke={color} strokeWidth={1.5} />
            <line x1={0} y1={8} x2={8} y2={0} stroke={color} strokeWidth={1.5} />
          </pattern>
        );

      case '.':
        return (
          <pattern key={key} id={patternId} patternUnits="userSpaceOnUse" width={8} height={8}>
            <rect x={0} y={0} width={8} height={8} fill="#ffffff" />
            <circle cx={4} cy={4} r={1.5} fill={color} />
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
            <rect x={0} y={0} width={6} height={6} fill="#ffffff" />
            <line x1={0} y1={0} x2={0} y2={6} stroke={color} strokeWidth={2} />
          </pattern>
        );

      case '|':
        return (
          <pattern key={key} id={patternId} patternUnits="userSpaceOnUse" width={6} height={6}>
            <rect x={0} y={0} width={6} height={6} fill="#ffffff" />
            <line x1={3} y1={0} x2={3} y2={6} stroke={color} strokeWidth={2} />
          </pattern>
        );

      case '-':
        return (
          <pattern key={key} id={patternId} patternUnits="userSpaceOnUse" width={6} height={6}>
            <rect x={0} y={0} width={6} height={6} fill="#ffffff" />
            <line x1={0} y1={3} x2={6} y2={3} stroke={color} strokeWidth={2} />
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
            <rect x={0} y={0} width={6} height={6} fill="#ffffff" />
            <line x1={0} y1={0} x2={0} y2={6} stroke={color} strokeWidth={2} />
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
            {/* Pattern defs: one per unique color+shape combination that needs patterns */}
            {patternColors &&
              patternColors.length > 0 &&
              (() => {
                const neededPatterns = new Set<string>();
                segments.forEach((seg, i) => {
                  const originalDataIndex = _getOriginalDataIndex(seg, props.data);
                  if (_shouldHavePattern(originalDataIndex, props.data)) {
                    const color = resolveColor(seg, i, props, nodes, legendColorMap);
                    const shape = _getPatternShape(originalDataIndex, props.data);
                    const patternKey = `${color}-${shape}`;
                    neededPatterns.add(patternKey);
                  }
                });

                return (
                  <defs>
                    {Array.from(neededPatterns).map((patternKey: string) => {
                      const [color, shape] = patternKey.split('-');
                      const patternId = `sbPattern-${color.replace('#', '')}-${shape}`;
                      return _generatePatternDef(patternId, color, shape);
                    })}
                  </defs>
                );
              })()}
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

              let patternId: string | undefined;
              if (patternColors && patternColors.length > 0) {
                const originalDataIndex = _getOriginalDataIndex(seg, props.data);
                const shouldHave = _shouldHavePattern(originalDataIndex, props.data);

                if (shouldHave) {
                  const originalMarkerColor = props.data.flat?.marker?.colors?.[originalDataIndex];
                  const patternColor = originalMarkerColor || color;
                  const shape = _getPatternShape(originalDataIndex, props.data);
                  patternId = `sbPattern-${patternColor.replace('#', '')}-${shape}`;
                }
              }

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
                  color={patternId ? `url(#${patternId})` : color}
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
  if (data.root) {
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
    dfs(data.root, 0, null);
    return { root: data.root, nodes };
  }
  if (data.flat) {
    const markerColors =
      data.flat.marker && Array.isArray(data.flat.marker.colors) ? data.flat.marker.colors : undefined;
    const root = flatToTree(data.flat, markerColors);
    return buildTree({ root });
  }
  return { root: { id: 'root', label: 'Root', value: 0 }, nodes: [] };
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
      root.id !== '__plotly_center__' && root.id === 'root' && Array.isArray(root.children) && root.children.length > 1;
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
  const traverse = (node: SunburstNode, depth: number, a0: number, a1: number, parentPath: string[]) => {
    if (depth > (props.maxDepth ?? Number.POSITIVE_INFINITY)) {
      return;
    }
    if (depth >= 0 && node.id !== '__plotly_center__') {
      const segment = makeSeg(node, depth, a0, a1, parentPath, props.branchValues);
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
      traverse(c, depth + 1, s, e, parentPath.concat(node.id));
      acc = e;
    }
  };

  if (root.id === '__plotly_center__') {
    traverse(root, -1, start, end, []);
  } else {
    traverse({ ...root, children: root.children || [] }, -1, start, end, []);
  }

  // Debug: Log segment count by depth
  const segmentsByDepth: Record<number, number> = {};
  segments.forEach(seg => {
    segmentsByDepth[seg.depth] = (segmentsByDepth[seg.depth] || 0) + 1;
  });
  console.log('Segments by depth:', segmentsByDepth);
  console.log('Total segments:', segments.length);

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
