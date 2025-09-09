import * as React from 'react';
import { getId, getRTL, initializeComponentRef } from '@fluentui/react/lib/Utilities';
import { IProcessedStyleSet } from '@fluentui/react/lib/Styling';
import { Callout, DirectionalHint } from '@fluentui/react/lib/Callout';
import { FocusZone, FocusZoneDirection, FocusZoneTabbableElements } from '@fluentui/react-focus';
import { ChartHoverCard, ILegend, Legends } from '../../index';
import { Arc } from '../DonutChart/Arc/Arc';
import { IArcData } from '../DonutChart/Arc/Arc.types';
import { IChart, IChartDataPoint } from '../../types/index';
import { getNextGradient } from '../../utilities/index';
import { toImage } from '../../utilities/image-export-utils';
import { ILegendContainer } from '../Legends/index';
import {
  ISunburstChartProps,
  ISunburstChartStyleProps,
  ISunburstChartStyles,
  ISunburstNode,
  ISunburstFlatData,
} from './SunburstChart.types';
import { getStyles } from './SunburstChart.styles';
import { classNamesFunction } from '../../Utilities';

const getClassNames = classNamesFunction<ISunburstChartStyleProps, ISunburstChartStyles>();
const LEGEND_CONTAINER_HEIGHT = 40;

// Plotly default color sequence to match Plotly.js sunburst charts
const PLOTLY_COLORS = [
  '#636EFA', // blue
  '#EF553B', // red
  '#00CC96', // green
  '#AB63FA', // purple
  '#FFA15A', // orange
  '#19D3F3', // cyan
  '#FF6692', // pink
  '#B6E880', // light green
  '#FF97FF', // light purple
  '#FECB52', // yellow
];

// Function to get Plotly-style color by index
const getPlotlyColor = (index: number): string => {
  return PLOTLY_COLORS[index % PLOTLY_COLORS.length];
};

type Segment = IArcData & { node: ISunburstNode; depth: number; path: string[]; isZeroRemainder?: boolean };

interface ISunburstChartState {
  showHover?: boolean;
  value?: string | undefined;
  legend?: string | undefined;
  _width?: number | undefined;
  _height?: number | undefined;
  activeLegend?: string;
  color?: string | undefined;
  xCalloutValue?: string;
  yCalloutValue?: string;
  focusedArcId?: string;
  dataPointCalloutProps?: IChartDataPoint;
  selectedLegends: string[];
}

export class SunburstChartBase extends React.Component<ISunburstChartProps, ISunburstChartState> implements IChart {
  private _classNames: IProcessedStyleSet<ISunburstChartStyles>;
  private _rootElem: HTMLElement | null;
  private _uniqText: string;
  private _currentHoverElement: SVGElement | React.MouseEvent<SVGPathElement> | null;
  private _calloutId: string;
  private _calloutAnchorPoint: IChartDataPoint | null;
  private _emptyChartId: string | null;
  private _legendsRef: React.RefObject<ILegendContainer>;

  constructor(props: ISunburstChartProps) {
    super(props);
    initializeComponentRef(this);
    this.state = {
      showHover: false,
      value: '',
      legend: '',
      _width: props.width || 300,
      _height: props.height ? props.height - LEGEND_CONTAINER_HEIGHT : 300,
      activeLegend: undefined,
      color: '',
      xCalloutValue: '',
      yCalloutValue: '',
      focusedArcId: '',
      selectedLegends: props.legendProps?.selectedLegends || [],
    };
    this._hoverCallback = this._hoverCallback.bind(this);
    this._focusCallback = this._focusCallback.bind(this);
    this._hoverLeave = this._hoverLeave.bind(this);
    this._calloutId = getId('callout');
    this._uniqText = getId('_Sunburst_');
    this._emptyChartId = getId('_Sunburst_empty');
    this._legendsRef = React.createRef();
  }

  public componentDidMount(): void {
    if (this._rootElem) {
      this.setState({
        _width: this._rootElem.offsetWidth,
        _height: this._rootElem.offsetHeight - LEGEND_CONTAINER_HEIGHT,
      });
    }
  }

  public componentDidUpdate(prevProps: ISunburstChartProps): void {
    if (prevProps.legendProps?.selectedLegends !== this.props.legendProps?.selectedLegends) {
      this.setState({ selectedLegends: this.props.legendProps?.selectedLegends || [] });
    }
  }

  public get chartContainer(): HTMLElement | null {
    return this._rootElem;
  }

  public toImage = (): Promise<string> => {
    return toImage(this._rootElem, this._legendsRef.current?.toSVG, getRTL());
  };

  public render(): JSX.Element {
    const { data, theme, className, legendProps } = this.props;
    const { _width = 300, _height = 300 } = this.state;

    // styles are wired by styled HOC; still compute classnames for width/height updates
    this._classNames = getClassNames(getStyles, {
      theme: theme!,
      width: _width,
      height: _height,
      className: className!,
    });

    const { root, nodes } = buildTree(data);
    console.log('DEBUG: Tree built - root:', root, 'nodes count:', nodes.length);

    console.log('DEBUG: Props before computeLayout:', {
      branchValues: this.props.branchValues,
      propsKeys: Object.keys(this.props),
    });

    const segments = computeLayout(root, { ...this.props, branchValues: this.props.branchValues || 'remainder' });
    console.log('DEBUG: Segments computed:', segments.length, 'segments:', segments);

    // Extract pattern colors from marker.colors for pattern rendering
    const patternColors = this._extractPatternColors(data);
    console.log('DEBUG: Pattern colors extracted:', patternColors);

    // Legends should come from the first visible ring (children of the root if a single root exists)
    // Build an index to access node color/value by id
    const legendColorMap: Record<string, string> = {};
    const nodeById = new Map<string, ISunburstNode & { depth: number }>();
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i] as ISunburstNode & { depth: number };
      nodeById.set(n.id, n);
    }
    // Sort the first visible ring by descending rolled-up value of the corresponding top-level segments.
    // Use computed layout (segments) to get authoritative values at depth 0.
    const topLevelValue = new Map<string, number>();
    for (let s = 0; s < segments.length; s++) {
      const seg = segments[s];
      if (seg.depth === 0) {
        // In branchvalues='remainder' mode, the parent segment's displayed value is only the remainder.
        // For legend ordering and color assignment we need the TOTAL (remainder + children) so that
        // proportions match Plotly's visual sizing. rollup() stored that as __computedTotal.
        const totalForLegend =
          this.props.branchValues === 'remainder'
            ? (seg.node as any).__computedTotal || seg.value || 0
            : seg.value || 0;
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

    const legendItems: ILegend[] = levelNodes.map((ln, index) => {
      // Always use the node's explicit color if present
      const node = nodeById.get(ln.id);
      const color = node && node.color ? node.color : getPlotlyColor(index);
      legendColorMap[ln.id] = color;
      const title = ln.title;
      return {
        title,
        color,
        hoverAction: () => this.setState({ activeLegend: title }),
        onMouseOutAction: () => this.setState({ activeLegend: undefined }),
      };
    });

    const donutMarginHorizontal = this.props.hideLabels ? 0 : 80;
    const donutMarginVertical = this.props.hideLabels ? 0 : 40;
    const outerRadius = Math.min(_width - donutMarginHorizontal, _height - donutMarginVertical) / 2;
    const innerRadius = this.props.innerRadius || 0;
    const centerX = _width / 2;
    const centerY = _height / 2;

    // Angle calculation for zero-value segments is handled in computeLayout/traverse, not here.
    // No need to duplicate angle logic in render. Use segments as computed.

    const activeArc = this._expandHighlightedLegends(this._getHighlightedLegend(), nodes);

    return nodes.length > 0 ? (
      <div
        className={this._classNames.root}
        ref={(el: HTMLElement | null) => (this._rootElem = el)}
        onMouseLeave={this._handleChartMouseLeave}
      >
        <FocusZone direction={FocusZoneDirection.horizontal} handleTabKey={FocusZoneTabbableElements.all}>
          <div>
            <svg
              className={this._classNames.chart}
              aria-label={data.chartTitle}
              ref={(n: SVGElement | null) => this._setViewBox(n)}
            >
              <g transform={`translate(${centerX},${centerY})`}>
                {/* Pattern defs: one per unique color+shape combination that needs patterns */}
                {patternColors &&
                  patternColors.length > 0 &&
                  (() => {
                    // Collect unique color+shape combinations for segments that need patterns
                    const neededPatterns = new Set<string>();
                    segments.forEach((seg, i) => {
                      const originalDataIndex = this._getOriginalDataIndex(seg, this.props.data);
                      if (this._shouldHavePattern(originalDataIndex, this.props.data)) {
                        const color = resolveColor(seg, i, this.props, nodes, legendColorMap);
                        const shape = this._getPatternShape(originalDataIndex, this.props.data);
                        const patternKey = `${color}-${shape}`;
                        neededPatterns.add(patternKey);
                      }
                    });

                    return (
                      <defs>
                        {Array.from(neededPatterns).map((patternKey: string) => {
                          const [color, shape] = patternKey.split('-');
                          const patternId = `sbPattern-${color.replace('#', '')}-${shape}`;
                          return this._generatePatternDef(patternId, color, shape);
                        })}
                      </defs>
                    );
                  })()}
                {segments.map((seg, i) => {
                  console.log(`DEBUG: Processing segment ${i}:`, {
                    id: seg.node.id,
                    value: seg.node.value,
                    startAngle: seg.startAngle,
                    endAngle: seg.endAngle,
                    depth: seg.depth,
                    hasChildren: !!(seg.node.children && seg.node.children.length > 0),
                  });

                  // Plotly parity rules (branchvalues='remainder'):
                  // 1. Parent sectors are always rendered; their angular span equals sum(children)+remainder.
                  // 2. If a child has value 0 it is NOT rendered and consumes 0 angle (siblings close up).
                  // 3. "Remainder" of 0 on a parent still allows the parent ring to render (just no inner fill concept here).
                  const hasChildren = !!(seg.node.children && seg.node.children.length > 0);
                  const isRemainderMode = (this.props.branchValues || 'remainder') === 'remainder';
                  // In remainder mode, only filter out leaf nodes (no children) with zero values
                  // Parent nodes with value 0 should still be rendered as they represent containers
                  const isZeroLeaf = isRemainderMode && !hasChildren && (seg.node.value || 0) === 0;

                  console.log(`DEBUG: Filtering check for segment ${i}:`, {
                    id: seg.node.id,
                    hasChildren,
                    isRemainderMode,
                    nodeValue: seg.node.value,
                    isZeroLeaf,
                    willRender: !isZeroLeaf,
                  });

                  if (isZeroLeaf) {
                    console.log(`DEBUG: Skipping zero leaf segment ${i}:`, seg.node.id);
                    return null; // hide zero-value leaves like Plotly
                  }

                  const depthInner = innerRadius + getAccumulatedThickness(this.props, seg.depth);
                  const depthOuter = innerRadius + getAccumulatedThickness(this.props, seg.depth + 1);
                  const color = resolveColor(seg, i, this.props, nodes, legendColorMap);

                  // Check if this segment should have a pattern using the original data index
                  let patternId: string | undefined;
                  if (patternColors && patternColors.length > 0) {
                    // Get the original data index for this segment
                    const originalDataIndex = this._getOriginalDataIndex(seg, this.props.data);
                    const shouldHave = this._shouldHavePattern(originalDataIndex, this.props.data);

                    // Get the original marker color for this segment
                    const originalMarkerColor = this.props.data.flat?.marker?.colors?.[originalDataIndex];

                    console.log(
                      `DEBUG: Segment ${i} (${seg.node.id}) original index ${originalDataIndex} should have pattern: ${shouldHave}`,
                    );
                    console.log(
                      `DEBUG: Segment ${i} colors - resolved: ${color}, original marker: ${originalMarkerColor}`,
                    );

                    if (shouldHave) {
                      // Use the original marker color instead of resolved color for pattern ID
                      const patternColor = originalMarkerColor || color;
                      const shape = this._getPatternShape(originalDataIndex, this.props.data);
                      patternId = `sbPattern-${patternColor.replace('#', '')}-${shape}`;
                      console.log(
                        `DEBUG: Segment ${i} (${seg.node.id}) gets pattern ${patternId} with pattern color ${patternColor} and shape ${shape} (original data index ${originalDataIndex})`,
                      );
                    } else {
                      console.log(
                        `DEBUG: Segment ${i} (${seg.node.id}) gets no pattern (original data index ${originalDataIndex})`,
                      );
                    }
                  } else {
                    console.log(`DEBUG: Segment ${i} (${seg.node.id}) gets no pattern (no pattern colors available)`);
                  }
                  const arcPoint: IChartDataPoint = {
                    data: seg.value,
                    legend: seg.node.id,
                    color,
                    xAxisCalloutData: seg.node.xAxisCalloutData || seg.node.label,
                    yAxisCalloutData: seg.node.yAxisCalloutData,
                    callOutAccessibilityData: seg.node.callOutAccessibilityData,
                    onClick: seg.node.onClick,
                  };

                  console.log(`DEBUG: Rendering Arc ${i}:`, {
                    innerRadius: Math.max(0, Math.min(depthInner, outerRadius)),
                    outerRadius: Math.max(0, Math.min(depthOuter, outerRadius)),
                    startAngle: seg.startAngle,
                    endAngle: seg.endAngle,
                    color: color,
                    patternId,
                  });

                  return (
                    <Arc
                      key={`arc-${i}`}
                      data={{
                        data: arcPoint,
                        startAngle: seg.startAngle,
                        endAngle: seg.endAngle,
                        index: i,
                        padAngle: this.props.padAngle || 0,
                        value: seg.value,
                      }}
                      innerRadius={Math.max(0, Math.min(depthInner, outerRadius))}
                      outerRadius={Math.max(0, Math.min(depthOuter, outerRadius))}
                      theme={this.props.theme!}
                      uniqText={this._uniqText}
                      color={color}
                      nextColor={color}
                      hideLabels={this.props.hideLabels}
                      showLabelsInPercent={this.props.showLabelsInPercent}
                      onFocusCallback={this._focusCallback}
                      hoverOnCallback={this._hoverCallback}
                      hoverLeaveCallback={this._hoverLeave}
                      onBlurCallback={this._onBlur}
                      activeArc={activeArc}
                      focusedArcId={this.state.focusedArcId || ''}
                      calloutId={this._calloutId}
                      enableGradient={this.props.enableGradient}
                      roundCorners={this.props.roundCorners}
                      patternId={patternId}
                    />
                  );
                })}
                {console.log(
                  `DEBUG: Total Arc components rendered: ${
                    segments.filter((seg, i) => {
                      const hasChildren = !!(seg.node.children && seg.node.children.length > 0);
                      const isRemainderMode = (this.props.branchValues || 'remainder') === 'remainder';
                      const isZeroLeaf = isRemainderMode && !hasChildren && (seg.node.value || 0) === 0;
                      return !isZeroLeaf;
                    }).length
                  }`,
                )}
              </g>
            </svg>
          </div>
        </FocusZone>
        <Callout
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          target={this._currentHoverElement as any}
          alignTargetEdge={true}
          isBeakVisible={false}
          directionalHint={DirectionalHint.topAutoEdge}
          gapSpace={15}
          hidden={!(!this.props.calloutProps?.hidden && this.state.showHover)}
          id={this._calloutId}
          onDismiss={this._closeCallout}
          // eslint-disable-next-line @typescript-eslint/no-deprecated
          preventDismissOnLostFocus={true}
          shouldUpdateWhenHidden={true}
          {...this.props.calloutProps!}
        >
          {this.props.onRenderCalloutPerDataPoint ? (
            this.props.onRenderCalloutPerDataPoint(this.state.dataPointCalloutProps!)
          ) : (
            <ChartHoverCard
              Legend={this.state.xCalloutValue ? this.state.xCalloutValue : this.state.legend}
              YValue={this.state.yCalloutValue ? this.state.yCalloutValue : this.state.value}
              color={this.state.color}
              culture={this.props.culture}
            />
          )}
        </Callout>
        <div className={this._classNames.legendContainer}>
          <Legends
            legends={legendItems}
            centerLegends
            overflowProps={legendProps?.overflowProps}
            focusZonePropsInHoverCard={legendProps?.focusZonePropsInHoverCard}
            overflowText={legendProps?.overflowText}
            {...legendProps}
            onChange={this._onLegendSelectionChange}
            ref={this._legendsRef}
          />
        </div>
      </div>
    ) : (
      <div
        id={this._emptyChartId!}
        role={'alert'}
        style={{ opacity: '0' }}
        aria-label={'Graph has no data to display'}
      />
    );
  }

  private _setViewBox(node: SVGElement | null): void {
    if (!node) {
      return;
    }
    const widthVal = node.parentElement ? node.parentElement.clientWidth : this.state._width;
    const heightVal =
      node.parentElement && node.parentElement?.offsetHeight > this.state._height!
        ? node.parentElement?.offsetHeight
        : this.state._height;
    const viewbox = `0 0 ${widthVal!} ${heightVal!}`;
    node.setAttribute('viewBox', viewbox);
  }

  private _onLegendSelectionChange = (
    selectedLegends: string[],
    event: React.MouseEvent<HTMLButtonElement>,
    _currentLegend?: ILegend,
  ): void => {
    if (this.props.legendProps && this.props.legendProps?.canSelectMultipleLegends) {
      this.setState({ selectedLegends });
    } else {
      this.setState({ selectedLegends: selectedLegends.slice(-1) });
    }
    if (this.props.legendProps?.onChange) {
      this.props.legendProps.onChange(selectedLegends, event, _currentLegend);
    }
  };

  private _focusCallback = (data: IChartDataPoint, id: string, element: SVGPathElement): void => {
    this._currentHoverElement = element;
    this.setState({
      showHover: this._noLegendsHighlighted() || this._isLegendHighlighted(data.legend),
      value: data.data!.toString(),
      legend: data.legend,
      color: data.color!,
      xCalloutValue: data.xAxisCalloutData!,
      yCalloutValue: data.yAxisCalloutData!,
      focusedArcId: id,
      dataPointCalloutProps: data,
    });
  };

  private _hoverCallback = (data: IChartDataPoint, e: React.MouseEvent<SVGPathElement>): void => {
    if (this._calloutAnchorPoint !== data) {
      this._calloutAnchorPoint = data;
      this._currentHoverElement = e;
      let color: string = data.color!;

      if (this.props.enableGradient) {
        const pointIndex = 0; // sunburst doesn't carry original index; gradient still needs a base color
        color = data.gradient?.[0] || getNextGradient(pointIndex, 0, this.props.theme?.isInverted)[0];
      }

      this.setState({
        showHover: this._noLegendsHighlighted() || this._isLegendHighlighted(data.legend),
        value: data.data!.toString(),
        legend: data.legend,
        color,
        xCalloutValue: data.xAxisCalloutData!,
        yCalloutValue: data.yAxisCalloutData!,
        dataPointCalloutProps: data,
      });
    }
  };

  private _onBlur = (): void => {
    this.setState({ focusedArcId: '' });
  };
  private _hoverLeave(): void {
    // Hide callout when pointer leaves a segment
    this._calloutAnchorPoint = null;
    this.setState({ showHover: false });
  }
  private _handleChartMouseLeave = () => {
    // Fallback: hide callout when leaving the chart container entirely
    this._calloutAnchorPoint = null;
    this.setState({ showHover: false });
  };
  private _closeCallout = () => {
    this.setState({ showHover: false });
  };
  private _noLegendsHighlighted = (): boolean => this._getHighlightedLegend().length === 0;
  private _getHighlightedLegend() {
    return this.state.selectedLegends.length > 0
      ? this.state.selectedLegends
      : this.state.activeLegend
      ? [this.state.activeLegend]
      : [];
  }
  private _isLegendHighlighted = (legend: string | undefined): boolean => {
    const list = this._getHighlightedLegend();
    for (let i = 0; i < list.length; i++) {
      if (list[i] === legend) {
        return true;
      }
    }
    return false;
  };

  // Expand selected legend(s) to include the ids of all descendants under the same top-level segment
  // so that clicking a legend highlights its color group (parent + children).
  private _expandHighlightedLegends(
    selected: string[],
    nodes: Array<ISunburstNode & { depth: number; parentId?: string | null }>,
  ): string[] {
    if (!selected || selected.length === 0) {
      return [];
    }

    // Determine which depth constitutes the legend level (same logic as getLegendLevelNodes)
    let depth0Count = 0;
    for (let i = 0; i < nodes.length; i++) {
      if ((nodes[i] as ISunburstNode & { depth: number }).depth === 0) {
        depth0Count++;
        if (depth0Count > 1) {
          break;
        }
      }
    }
    const targetDepth = depth0Count === 1 ? 1 : 0;

    // Find the node(s) that correspond to the selected legend entries (by label or id title)
    const rootsToExpand: ISunburstNode[] = [];
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i] as ISunburstNode & { depth: number };
      if (n.depth !== targetDepth) {
        continue;
      }
      const title = n.label || n.id;
      if (selected.includes(title) || selected.includes(n.id)) {
        rootsToExpand.push(n);
      }
    }

    // Collect ids for each selected node and all its descendants
    const ids = new Set<string>();
    const pushNode = (node: ISunburstNode | undefined) => {
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

  // Extract pattern colors from data.marker.colors for automatic pattern rendering
  private _extractPatternColors(data: ISunburstChartProps['data']): string[] {
    // Check for marker.colors in flat data structure (Plotly schema style)
    if (data.flat?.marker?.colors && Array.isArray(data.flat.marker.colors)) {
      const markerColors = data.flat.marker.colors;
      const patternShapes = data.flat.marker?.pattern?.shape;

      console.log('DEBUG: _extractPatternColors - markerColors found:', markerColors.length);
      console.log('DEBUG: _extractPatternColors - patternShapes found:', patternShapes?.length);

      // Only extract colors for segments that have pattern shapes defined
      if (patternShapes && Array.isArray(patternShapes)) {
        // Extract unique colors for segments that actually have patterns
        const uniquePatternColors = new Set<string>();
        for (let i = 0; i < patternShapes.length && i < markerColors.length; i++) {
          const shape = patternShapes[i];
          if (shape && shape !== '' && shape !== 'none') {
            uniquePatternColors.add(markerColors[i]);
            console.log(`DEBUG: _extractPatternColors - Index ${i}: shape="${shape}", color="${markerColors[i]}"`);
          }
        }
        return Array.from(uniquePatternColors);
      } else {
        // If no pattern shapes defined, don't return any pattern colors
        return [];
      }
    }
    // No patterns if no flat data with marker colors
    return [];
  }

  // Check if a segment should have a pattern based on the pattern shapes array
  private _shouldHavePattern(index: number, data: ISunburstChartProps['data']): boolean {
    // Check for pattern shapes in flat data structure
    const patternShapes = data.flat?.marker?.pattern?.shape;

    console.log('DEBUG: Full flat data structure:', data.flat);
    console.log('DEBUG: Pattern shapes:', patternShapes);

    if (Array.isArray(patternShapes)) {
      console.log('DEBUG: Pattern shapes available:', patternShapes.length, 'checking index:', index);
      if (index < patternShapes.length) {
        const shape = patternShapes[index];
        const hasPattern = !!(shape && shape !== '' && shape !== 'none');
        console.log('DEBUG: Index', index, 'shape:', shape, 'hasPattern:', hasPattern);
        return hasPattern;
      }
    }

    console.log('DEBUG: No pattern shapes array or index out of bounds for index', index);
    return false;
  }

  // Get the pattern shape for a given data index
  private _getPatternShape(index: number, data: ISunburstChartProps['data']): string {
    const patternShapes = data.flat?.marker?.pattern?.shape;
    if (Array.isArray(patternShapes) && index < patternShapes.length) {
      const shape = patternShapes[index];
      return shape && shape !== '' && shape !== 'none' ? shape : '';
    }
    return '';
  }

  // Generate SVG pattern definition based on shape type
  private _generatePatternDef(patternId: string, color: string, shape: string): JSX.Element {
    const key = patternId;

    switch (shape) {
      case '/':
        // Diagonal lines (default/existing pattern)
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
        // Crosshatch pattern
        return (
          <pattern key={key} id={patternId} patternUnits="userSpaceOnUse" width={8} height={8}>
            <rect x={0} y={0} width={8} height={8} fill="#ffffff" />
            <line x1={0} y1={0} x2={8} y2={8} stroke={color} strokeWidth={1.5} />
            <line x1={0} y1={8} x2={8} y2={0} stroke={color} strokeWidth={1.5} />
          </pattern>
        );

      case '.':
        // Dots pattern
        return (
          <pattern key={key} id={patternId} patternUnits="userSpaceOnUse" width={8} height={8}>
            <rect x={0} y={0} width={8} height={8} fill="#ffffff" />
            <circle cx={4} cy={4} r={1.5} fill={color} />
          </pattern>
        );

      case '\\':
        // Reverse diagonal lines
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
        // Vertical lines
        return (
          <pattern key={key} id={patternId} patternUnits="userSpaceOnUse" width={6} height={6}>
            <rect x={0} y={0} width={6} height={6} fill="#ffffff" />
            <line x1={3} y1={0} x2={3} y2={6} stroke={color} strokeWidth={2} />
          </pattern>
        );

      case '-':
        // Horizontal lines
        return (
          <pattern key={key} id={patternId} patternUnits="userSpaceOnUse" width={6} height={6}>
            <rect x={0} y={0} width={6} height={6} fill="#ffffff" />
            <line x1={0} y1={3} x2={6} y2={3} stroke={color} strokeWidth={2} />
          </pattern>
        );

      default:
        // Fallback to diagonal lines
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

  // Get the original data index for a segment based on its node ID
  private _getOriginalDataIndex(segment: Segment, data: ISunburstChartProps['data']): number {
    if (!data.flat) {
      console.log('DEBUG: No flat data available');
      return -1;
    }

    const flatData = data.flat as any;
    const nodeId = segment.node.id;

    console.log('DEBUG: Looking for node ID:', nodeId);
    console.log('DEBUG: Available flat data:', flatData);
    console.log('DEBUG: Available IDs in flat data:', flatData.ids);

    if (flatData.ids && Array.isArray(flatData.ids)) {
      const index = flatData.ids.indexOf(nodeId);
      console.log('DEBUG: Node', nodeId, 'found at original data index:', index);
      return index;
    }

    console.log('DEBUG: No IDs array in flat data');
    return -1;
  }
}

// Helpers
function buildTree(data: ISunburstChartProps['data']): {
  root: ISunburstNode;
  nodes: Array<ISunburstNode & { depth: number; parentId?: string | null }>;
} {
  if (data.root) {
    const nodes: Array<ISunburstNode & { depth: number; parentId?: string | null }> = [];
    const dfs = (n: ISunburstNode, depth: number, parentId?: string | null) => {
      nodes.push({ id: n.id, label: n.label, value: n.value, children: n.children, color: n.color, depth, parentId });
      (n.children || []).forEach(c => dfs(c, depth + 1, n.id));
    };
    dfs(data.root, 0, null);
    return { root: data.root, nodes };
  }
  if (data.flat) {
    // Pass marker.colors if available
    const markerColors =
      (data as any).marker && Array.isArray((data as any).marker.colors) ? (data as any).marker.colors : undefined;
    const root = flatToTree(data.flat, markerColors);
    return buildTree({ root });
  }
  return { root: { id: 'root', label: 'Root', value: 0 }, nodes: [] };
}

function flatToTree(flat: ISunburstFlatData, markerColors?: string[]): ISunburstNode {
  const map: Record<string, ISunburstNode & { parent?: string | null }> = {};
  // Attach color from marker.colors to each id before any sorting or transformation
  // IMPORTANT: In Plotly sunburst (branchvalues='remainder') the leaf rows often
  // appear BEFORE their ancestor ids in the arrays. While processing children we
  // create placeholder parent nodes (value=0). Later, when we finally encounter
  // the ancestor id in flat.ids, we MUST OVERWRITE that placeholder's value with
  // the real remainder value. Previous logic used `map[id] = map[id] || {...}`
  // which preserved the 0 and produced empty inner wedges. We now always update
  // label/value (and color if still unset) when the definitive row shows up.
  flat.ids.forEach((id, i) => {
    const color = markerColors ? markerColors[i] : undefined;
    const rawValue = i < flat.values.length ? flat.values[i] : 0;
    // Handle NaN values (like in Plotly schema) by treating them as 0 for remainder mode
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
    } // root
    if (!map[parent]) {
      map[parent] = { id: parent, label: String(parent), value: 0, children: [] };
    }
    map[parent].children = map[parent].children || [];
    map[parent].children!.push(map[id]);
  });
  // Multiple roots support: create virtual root
  const roots: ISunburstNode[] = [];
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

function rollup(node: ISunburstNode, mode: ISunburstChartProps['branchValues']): number {
  if (!node.children || node.children.length === 0) {
    const nodeValue = node.value || 0;
    return isNaN(nodeValue) ? 0 : nodeValue;
  }

  // Recursively process children first
  const childSum = node.children.reduce((s, c) => s + rollup(c, mode), 0);

  if (mode === 'total') {
    // In 'total' mode, preserve the original node value - DO NOT overwrite it
    // The node value represents the size of the parent segment
    // Children are allocated proportionally within the parent's space
    const nodeValue = node.value || 0;
    return isNaN(nodeValue) ? 0 : nodeValue;
  } else {
    // In 'remainder' mode, the node value IS the remainder.
    // The total space for angle allocation is remainder + children
    const rawNodeValue = node.value || 0;
    const nodeValue = isNaN(rawNodeValue) ? 0 : rawNodeValue; // Treat NaN as 0 remainder
    const totalSize = nodeValue + childSum;

    // Debug: Log remainder mode calculations
    if (nodeValue === 0) {
      console.log(
        `Rollup: ${node.id} has ZERO remainder (${nodeValue}) + children (${childSum}) = total (${totalSize})`,
      );
    }

    // Store computed total for layout calculations but preserve original value for display
    (node as any).__computedTotal = totalSize;
    (node as any).__remainder = nodeValue;

    return totalSize;
  }
}

function computeLayout(root: ISunburstNode, props: ISunburstChartProps): Segment[] {
  console.log('=== computeLayout ENTRY ===', {
    rootId: root.id,
    branchValues: props.branchValues,
    branchValuesAsAny: props.branchValues as any,
    isRemainder: (props.branchValues as any) === 'remainder',
    propsKeys: Object.keys(props),
  });

  // Debug: Print hierarchy structure and values before layout
  function printHierarchy(node: ISunburstNode, depth: number = 0): void {
    const indent = '  '.repeat(depth);
    console.log(`${indent}${node.id || '(root)'}: value=${node.value}`);
    if (node.children && node.children.length > 0) {
      node.children.forEach((child: ISunburstNode) => printHierarchy(child, depth + 1));
    }
  }
  // Use loose comparison; type definition may only declare 'total' but we support 'remainder' internally
  if ((props.branchValues as any) === 'remainder') {
    console.log('=== SUNBURST HIERARCHY DUMP ===');
    printHierarchy(root);
    console.log('=== END HIERARCHY DUMP ===');
  }
  const start = props.startAngle || 0;
  const end = props.endAngle || Math.PI * 2;
  rollup(root, props.branchValues);

  const segments: Segment[] = [];

  // Debug: Track function calls with comprehensive data info
  if ((props.branchValues as any) === 'remainder') {
    const timestamp = Date.now();
    console.log(`=== computeLayout CALLED at ${timestamp} ===`);
    console.log('Props branchValues:', props.branchValues);
    console.log('Root node:', root);
    console.log('Data structure check:');

    // Check the flat data if available
    if ((props.data as any).flat) {
      const flat = (props.data as any).flat;
      console.log('Flat data values:', flat.values?.slice(0, 10));
      console.log('Flat data IDs:', flat.ids?.slice(0, 10));

      // Find zero values specifically
      const zeroNodes = [];
      for (let i = 0; i < (flat.values?.length || 0); i++) {
        if (flat.values[i] === 0) {
          zeroNodes.push(flat.ids[i]);
        }
      }
      console.log('Zero-value nodes from flat data:', zeroNodes);
    }
  }

  const sortFn = getSortFn(props);

  // New logic for remainder mode: absolute (global) angle scaling so children angles
  // are based on the global total of top-level parents. Parent remainder is left blank.
  console.log('DEBUG: Testing remainder condition:', {
    branchValues: props.branchValues,
    typeOf: typeof props.branchValues,
    stringified: JSON.stringify(props.branchValues),
    equalToRemainder: props.branchValues === 'remainder',
    equalToRemainderLoose: props.branchValues == 'remainder',
  });

  if (props.branchValues === 'remainder') {
    const fullSpan = end - start;
    // Determine top-level parents. When buildTree synthesized a virtual root (id==='root', value 0, >1 child),
    // we should treat its children as the real top-level and NOT render the virtual root segment (it otherwise
    // covers the entire circle and hides all real data segments).
    const isVirtualRoot =
      root.id !== '__plotly_center__' && root.id === 'root' && Array.isArray(root.children) && root.children.length > 1;
    const topLevel: ISunburstNode[] = root.id === '__plotly_center__' || isVirtualRoot ? root.children || [] : [root];
    const getTotal = (n: ISunburstNode) =>
      (n as any).__computedTotal !== undefined ? (n as any).__computedTotal : n.value || 0;
    const globalTotal = topLevel.reduce((s, n) => s + getTotal(n), 0) || 1; // avoid div by 0

    console.log(`DEBUG: Global remainder traversal setup:`, {
      rootId: root.id,
      isVirtualRoot,
      topLevelCount: topLevel.length,
      globalTotal,
      topLevelNodes: topLevel.map(n => ({ id: n.id, total: getTotal(n) })),
    });

    const traverseGlobal = (node: ISunburstNode, depth: number, a0: number, a1: number, parentPath: string[]) => {
      if (depth >= (props.maxDepth ?? Number.POSITIVE_INFINITY)) {
        return;
      }
      // Create a segment for every non-pseudo node with non-zero angular span
      if (depth >= 0 && node.id !== '__plotly_center__') {
        // Skip drawing the synthesized virtual root segment
        if (isVirtualRoot && node === root) {
          // continue traversal into its children without pushing
        } else if (a1 > a0) {
          segments.push(makeSeg(node, depth, a0, a1, parentPath, props.branchValues));
        }
      }
      if (!node.children || node.children.length === 0) {
        return; // leaf
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
          console.log(`DEBUG: Skipping child ${c.id} with total ${t}`);
          continue; // zero total => contributes to blank remainder
        }
        let childAngle = fullSpan * (t / globalTotal);

        console.log(
          `DEBUG: Child ${c.id} - total: ${t}, globalTotal: ${globalTotal}, calculated angle: ${childAngle}, current acc: ${acc}`,
        );

        // Clamp to parent bounds to avoid floating overflow
        if (acc + childAngle > parentEnd) {
          childAngle = Math.max(0, parentEnd - acc);
          console.log(`DEBUG: Clamped angle to ${childAngle} due to parent bounds`);
        }
        if (childAngle <= 0) {
          console.log(`DEBUG: Skipping child ${c.id} with non-positive angle ${childAngle}`);
          continue;
        }
        const s = acc;
        const e = s + childAngle;
        console.log(`DEBUG: Child ${c.id} traversal - start: ${s}, end: ${e}`);
        traverseGlobal(c, depth + 1, s, e, parentPath.concat(node.id));
        acc = e;
        if (acc >= parentEnd - 1e-10) {
          break; // no more space within parent wedge
        }
      }
      // leftover (parentEnd - acc) is parent's remainder; intentionally unrendered
    };

    if (isVirtualRoot) {
      // Virtual root spans full circle but we distribute among its children directly
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
      // Root itself is a real top-level segment (single root case)
      let running = start;
      for (let i = 0; i < topLevel.length; i++) {
        const p = topLevel[i];
        const pt = getTotal(p);
        if (pt <= 0) {
          continue; // skip zero-size top-level
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

    if ((props.branchValues as any) === 'remainder') {
      console.log(`=== computeLayout FINISHED (global remainder mode): ${segments.length} segments created ===`);
    }
    // Fallback: if for any reason no segments were generated, fall back to legacy per-parent allocation
    if (segments.length === 0) {
      console.warn('[Sunburst] Remainder mode produced 0 segments; falling back to legacy allocation logic.');
      const legacyTraverse = (node: ISunburstNode, depth: number, a0: number, a1: number, parentPath: string[]) => {
        if (depth >= (props.maxDepth ?? Number.POSITIVE_INFINITY)) {
          return;
        }
        if (depth >= 0 && node.id !== '__plotly_center__') {
          segments.push(makeSeg(node, depth, a0, a1, parentPath, props.branchValues));
        }
        if (!node.children || node.children.length === 0) {
          return;
        }
        const children = [...node.children];
        if (sortFn) {
          children.sort((a, b) => sortFn(a, b, depth));
        }
        const getNodeValue = (n: ISunburstNode) => n.value || 0;
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
          legacyTraverse(c, depth + 1, s, e, parentPath.concat(node.id));
          acc = e;
        }
      };
      legacyTraverse(
        root.id === '__plotly_center__' ? root : { ...root, children: root.children || [] },
        -1,
        start,
        end,
        [],
      );
    }
    return segments;
  }

  console.log('DEBUG: TAKING NON-REMAINDER BRANCH - this should not happen for Plotly data');

  // Existing logic for 'total' branch values (unchanged) or any other mode
  const traverse = (node: ISunburstNode, depth: number, a0: number, a1: number, parentPath: string[]) => {
    if (depth >= (props.maxDepth ?? Number.POSITIVE_INFINITY)) {
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
    const getNodeValue = (n: ISunburstNode) => n.value || 0;
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

  // Debug: Final segment count with details
  if ((props.branchValues as any) === 'remainder') {
    console.log(`=== computeLayout FINISHED: ${segments.length} segments created ===`);
    console.log('Created segments:');
    segments.forEach((seg, i) => {
      console.log(`  ${i}: ${seg.node.id} (value=${seg.node.value}, depth=${seg.depth})`);
    });
  }

  return segments;
}

// Helper to create a Segment object for a node
function makeSeg(
  node: ISunburstNode,
  depth: number,
  startAngle: number,
  endAngle: number,
  path: string[],
  branchValues: ISunburstChartProps['branchValues'],
): Segment {
  // In remainder mode, use the original node value for display and computed total for layout
  // In total mode, use the node value for both
  let displayValue = node.value || 0;
  let layoutValue = node.value || 0;
  let remainderValue = undefined;

  if (branchValues === 'remainder' && (node as any).__computedTotal !== undefined) {
    layoutValue = (node as any).__computedTotal;
    remainderValue = (node as any).__remainder;
    // For display purposes in remainder mode, show the remainder value
    displayValue = remainderValue !== undefined ? remainderValue : node.value || 0;
  }

  return {
    data: { legend: node.id, data: displayValue, color: node.color, remainder: remainderValue } as any,
    startAngle,
    endAngle,
    index: 0,
    padAngle: 0,
    value: layoutValue, // Use layout value for angular calculations
    node,
    depth,
    path,
  };
}

function getAccumulatedThickness(props: ISunburstChartProps, level: number): number {
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
  props: ISunburstChartProps,
  nodes: Array<ISunburstNode & { depth: number }>,
  legendColorMap?: Record<string, string>,
): string {
  // Always use the node's explicit color if present
  if (segment.node.color) {
    return segment.node.color;
  }

  // Determine the top-level ancestor (first visible ring)
  const topAncestor = getTopAncestor(segment, nodes);
  const topId = topAncestor && (topAncestor as ISunburstNode).id;

  // Second priority: legend color mapping for the top-level ancestor so
  // every descendant reliably inherits the same color.
  if (topId && legendColorMap && legendColorMap[topId]) {
    return legendColorMap[topId];
  }

  // Third priority: an explicit color on the top-level ancestor (if provided)
  if (topAncestor && (topAncestor as ISunburstNode).color) {
    return (topAncestor as ISunburstNode).color!;
  }
  // Fallback: compute the same deterministic order used when building legendColorMap (desc by rolled-up value).
  // Use nodes at depth 0 segments to get authoritative values if available on this render.
  const topValues: { id: string; value: number }[] = [];
  // Build a quick lookup of top-level values by inspecting input nodes (depth info) since segments may not be available here.
  const levelCandidates = getLegendLevelNodes(nodes);
  for (let k = 0; k < levelCandidates.length; k++) {
    const id = levelCandidates[k].id;
    const n = nodes.find(nn => (nn as ISunburstNode & { depth: number }).id === id) as ISunburstNode & {
      depth: number;
      value?: number;
    };
    const remainderMode = props.branchValues === 'remainder';
    // Use computed total when in remainder mode for consistent ordering/coloring
    const val = remainderMode && (n as any)?.__computedTotal !== undefined ? (n as any).__computedTotal : n?.value || 0;
    topValues.push({ id, value: val });
  }
  const level0 = topValues.sort((a, b) => (b.value || 0) - (a.value || 0));
  let idx = 0;
  for (let k = 0; k < level0.length; k++) {
    if (level0[k].id === topId) {
      idx = k;
      break;
    }
  }
  return getPlotlyColor(idx);
}

function getTopAncestor(seg: Segment, nodes: Array<ISunburstNode & { depth: number }>): ISunburstNode | undefined {
  // Segments at depth 0 are already the first visible ring
  if (seg.depth === 0) {
    return seg.node;
  }

  // Build legend-level id set (first visible ring based on nodes)
  const legendLevelNodes = getLegendLevelNodes(nodes);
  const legendIdSet = new Set(legendLevelNodes.map(n => n.id));

  // Build a lookup map id -> node with parentId for quick traversal
  const nodeById = new Map<string, ISunburstNode & { depth: number; parentId?: string | null }>();
  for (let i = 0; i < nodes.length; i++) {
    const n = nodes[i] as ISunburstNode & { depth: number; parentId?: string | null };
    nodeById.set(n.id, n);
  }

  // Walk up via parentId until we reach a legend-level ancestor
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

// Determine which nodes constitute the first visible ring for legends/colors.
function getLegendLevelNodes(nodes: Array<ISunburstNode & { depth: number }>): Array<{ id: string; label: string }> {
  // If there's exactly one node at depth 0, consider its children (depth 1) as the first visible ring.
  // Otherwise (multiple roots), depth 0 nodes are the first visible ring.
  let depth0Count = 0;
  for (let i = 0; i < nodes.length; i++) {
    if ((nodes[i] as ISunburstNode & { depth: number }).depth === 0) {
      depth0Count++;
      if (depth0Count > 1) {
        break;
      }
    }
  }
  const targetDepth = depth0Count === 1 ? 1 : 0;
  const result: Array<{ id: string; label: string }> = [];
  for (let i = 0; i < nodes.length; i++) {
    const n = nodes[i] as ISunburstNode & { depth: number };
    if (n.depth === targetDepth) {
      result.push({ id: n.id, label: n.label });
    }
  }
  return result;
}

// getLegendColor removed; legend colors are now resolved via a precomputed legendColorMap

function getSortFn(props: ISunburstChartProps) {
  if (!props.sort || props.sort === 'none') {
    return undefined;
  }
  const remainderMode = props.branchValues === 'remainder';
  const val = (n: ISunburstNode) =>
    remainderMode && (n as any).__computedTotal !== undefined ? (n as any).__computedTotal : n.value || 0;

  if (props.sort === 'asc') {
    return (a: ISunburstNode, b: ISunburstNode) => val(a) - val(b);
  }
  if (props.sort === 'desc') {
    return (a: ISunburstNode, b: ISunburstNode) => val(b) - val(a);
  }
  if (typeof props.sort === 'function') {
    const userSort = props.sort;
    return (a: ISunburstNode, b: ISunburstNode, depth: number) =>
      userSort({ ...a, value: val(a) }, { ...b, value: val(b) }, depth);
  }
  return props.sort;
}
