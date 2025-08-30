import * as React from 'react';
import { classNamesFunction, getId, getRTL, initializeComponentRef } from '@fluentui/react/lib/Utilities';
import { IProcessedStyleSet } from '@fluentui/react/lib/Styling';
import { Callout, DirectionalHint } from '@fluentui/react/lib/Callout';
import { FocusZone, FocusZoneDirection, FocusZoneTabbableElements } from '@fluentui/react-focus';
import { ChartHoverCard, ILegend, Legends } from '../../index';
import { Arc } from '../DonutChart/Arc/Arc';
import { IArcData } from '../DonutChart/Arc/Arc.types';
import { IChart, IChartDataPoint } from '../../types/index';
// no direct formatting here; use ChartHoverCard for formatting
import { getNextColor, getColorFromToken, getNextGradient } from '../../utilities/index';
import { toImage } from '../../utilities/image-export-utils';
import { ILegendContainer } from '../Legends/index';
import { ISunburstChartProps, ISunburstChartStyleProps, ISunburstChartStyles, ISunburstNode, ISunburstFlatData } from './SunburstChart.types';
import { getStyles } from './SunburstChart.styles';

const getClassNames = classNamesFunction<ISunburstChartStyleProps, ISunburstChartStyles>();
const LEGEND_CONTAINER_HEIGHT = 40;

type Segment = IArcData & { node: ISunburstNode; depth: number; path: string[] };

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
  public static defaultProps: Partial<ISunburstChartProps> = {
    innerRadius: 0,
    levelThickness: 40,
    startAngle: 0,
    endAngle: Math.PI * 2,
    branchValues: 'total',
    hideLabels: true,
  };

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
    const segments = computeLayout(root, this.props);

    // Legends from level-0 children
    const topLevel: Array<{ id: string; label: string }> = [];
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i] as ISunburstNode & { depth: number };
      if (n.depth === 0) {topLevel.push({ id: n.id, label: n.label });}
    }
    const legendItems: ILegend[] = topLevel.map((tl, index) => {
      const color = getLegendColor(tl.id, index, this.props.theme?.isInverted);
      const title = tl.label || tl.id;
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

    const totalValue = segments.reduce((sum, s) => sum + (s.value || 0), 0);

    return nodes.length > 0 ? (
      <div className={this._classNames.root} ref={(el: HTMLElement | null) => (this._rootElem = el)}>
        <FocusZone direction={FocusZoneDirection.horizontal} handleTabKey={FocusZoneTabbableElements.all}>
          <div>
            <svg
              className={this._classNames.chart}
              aria-label={data.chartTitle}
              ref={(n: SVGElement | null) => this._setViewBox(n)}
            >
              <g transform={`translate(${centerX},${centerY})`}>
                {segments.map((seg, i) => {
                  const depthInner = innerRadius + getAccumulatedThickness(this.props, seg.depth);
                  const depthOuter = innerRadius + getAccumulatedThickness(this.props, seg.depth + 1);
                  const color = resolveColor(seg, i, this.props, nodes);
                  const arcPoint: IChartDataPoint = {
                    data: seg.value,
                    legend: seg.node.label,
                    color,
                    xAxisCalloutData: seg.node.xAxisCalloutData,
                    yAxisCalloutData: seg.node.yAxisCalloutData,
                    callOutAccessibilityData: seg.node.callOutAccessibilityData,
                    onClick: seg.node.onClick,
                  };
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
                      totalValue={totalValue}
                      onFocusCallback={this._focusCallback}
                      hoverOnCallback={this._hoverCallback}
                      hoverLeaveCallback={this._hoverLeave}
                      onBlurCallback={this._onBlur}
                      activeArc={this._getHighlightedLegend()}
                      focusedArcId={this.state.focusedArcId || ''}
                      calloutId={this._calloutId}
                      enableGradient={this.props.enableGradient}
                      roundCorners={this.props.roundCorners}
                    />
                  );
                })}
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
    if (!node) {return;}
    const widthVal = node.parentElement ? node.parentElement.clientWidth : this.state._width;
    const heightVal = node.parentElement && node.parentElement?.offsetHeight > this.state._height!
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
    /** no-op */
  }
  private _closeCallout = () => {
    this.setState({ showHover: false });
  };
  private _noLegendsHighlighted = (): boolean => (this._getHighlightedLegend().length === 0);
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
      if (list[i] === legend) {return true;}
    }
    return false;
  };
}

// Helpers
function buildTree(
  data: ISunburstChartProps['data'],
): {
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
    const root = flatToTree(data.flat);
    return buildTree({ root });
  }
  return { root: { id: 'root', label: 'Root', value: 0 }, nodes: [] };
}

function flatToTree(flat: ISunburstFlatData): ISunburstNode {
  const map: Record<string, ISunburstNode & { parent?: string | null }> = {};
  flat.ids.forEach((id, i) => {
    map[id] = map[id] || { id, label: flat.labels[i], value: flat.values[i], children: [] };
  });
  flat.ids.forEach((id, i) => {
    const parent = flat.parents[i];
    if (!parent) {return;} // root
    if (!map[parent]) {
      map[parent] = { id: parent, label: String(parent), value: 0, children: [] };
    }
    map[parent].children = map[parent].children || [];
    map[parent].children!.push(map[id]);
  });
  // Multiple roots support: create virtual root
  const roots: ISunburstNode[] = [];
  for (const key in map) {
    if (!Object.prototype.hasOwnProperty.call(map, key)) {continue;}
    const n = map[key];
    const idx = flat.ids.indexOf(n.id);
    const p = idx >= 0 ? flat.parents[idx] : undefined;
    if (!p) {roots.push(n);}
  }
  if (roots.length === 1) {return roots[0];}
  return { id: 'root', label: 'Root', value: 0, children: roots };
}

function rollup(node: ISunburstNode, mode: ISunburstChartProps['branchValues']): number {
  if (!node.children || node.children.length === 0) {return node.value || 0;}
  const childSum = node.children.reduce((s, c) => s + rollup(c, mode), 0);
  if (mode === 'total') {
    node.value = (node.value && node.value > 0 ? node.value : childSum);
  } else {
    node.value = (node.value || 0) + childSum;
  }
  return node.value || 0;
}

function computeLayout(root: ISunburstNode, props: ISunburstChartProps): Segment[] {
  const start = props.startAngle || 0;
  const end = props.endAngle || Math.PI * 2;
  rollup(root, props.branchValues);

  const segments: Segment[] = [];
  const path: string[] = [];

  const sortFn = getSortFn(props);

  const traverse = (node: ISunburstNode, depth: number, a0: number, a1: number) => {
    if (depth >= (props.maxDepth ?? Number.POSITIVE_INFINITY)) {return;}
    if (!node.children || node.children.length === 0) {
      segments.push(makeSeg(node, depth, a0, a1, path));
      return;
    }
    const children = [...node.children];
    if (sortFn) {children.sort((a, b) => sortFn(a, b, depth));}
    let acc = a0;
    children.forEach(c => {
      const angle = (a1 - a0) * ((c.value || 0) / (node.value || 1));
      const s = acc;
      const e = acc + angle;
      segments.push(makeSeg(c, depth, s, e, path.concat(node.id)));
      acc += angle;
      if (c.children && c.children.length > 0) {
        traverse(c, depth + 1, s, e);
      }
    });
  };
  // depth -1 is virtual root if root has parentless children; to keep consistent, start from root's children
  traverse({ ...root, children: root.children || [] }, 0, start, end);
  return segments;
}

function makeSeg(
  node: ISunburstNode,
  depth: number,
  startAngle: number,
  endAngle: number,
  path: string[],
): Segment {
  const d: IArcData = {
    data: { legend: node.label, data: node.value || 0, color: node.color },
    startAngle,
    endAngle,
    index: 0,
    padAngle: 0,
    value: node.value || 0,
  };
  return { ...(d as IArcData), node, depth, path } as Segment;
}

function getAccumulatedThickness(props: ISunburstChartProps, level: number): number {
  const base = props.levelThickness || 40;
  if (typeof base === 'number') {return base * level;}
  let acc = 0;
  for (let i = 0; i < level; i++) {acc += base(i);}
  return acc;
}

function resolveColor(
  segment: Segment,
  i: number,
  props: ISunburstChartProps,
  nodes: Array<ISunburstNode & { depth: number }>,
): string {
  if (segment.node.color) {return getColorFromToken(segment.node.color, props.theme?.isInverted);}
  // assign by top-level ancestor
  const topAncestor = getTopAncestor(segment, nodes);
  const level0: Array<ISunburstNode & { depth: number }> = [];
  for (let j = 0; j < nodes.length; j++) {
    const n = nodes[j] as ISunburstNode & { depth: number };
    if (n.depth === 0) {level0.push(n);}
  }
  let idx = 0;
  for (let k = 0; k < level0.length; k++) {
    const topId = topAncestor && (topAncestor as ISunburstNode).id;
    if (level0[k].id === topId) {
      idx = k;
      break;
    }
  }
  return getNextColor(idx, 0, props.theme?.isInverted);
}

function getTopAncestor(seg: Segment, nodes: Array<ISunburstNode & { depth: number }>): ISunburstNode | undefined {
  // first element with depth 0 in its path is parent id; match nodes list
  if (seg.path.length === 0) {return seg.node;} // already top-level
  const ancestorId = seg.path[seg.path.length - 1];
  for (let i = 0; i < nodes.length; i++) {
    const x = nodes[i] as ISunburstNode & { depth: number };
    if (x.id === ancestorId && x.depth === 0) {return x;}
  }
  return undefined;
}

function getLegendColor(id: string, index: number, isInverted?: boolean): string {
  return getNextColor(index, 0, isInverted);
}

function getSortFn(props: ISunburstChartProps) {
  if (!props.sort || props.sort === 'none') {return undefined;}
  if (props.sort === 'asc') {return (a: ISunburstNode, b: ISunburstNode) => (a.value || 0) - (b.value || 0);}
  if (props.sort === 'desc') {return (a: ISunburstNode, b: ISunburstNode) => (b.value || 0) - (a.value || 0);}
  return props.sort;
}
