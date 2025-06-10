import * as React from 'react';
import { Arc } from './Arc/Arc';
import { IChartDataPoint } from '../index';
import { useTheme } from '@fluentui/react';
import { arc as d3Arc } from 'd3-shape';

const sunburstData = {
  branchvalues: 'total',
  domain: {
    x: [0.0, 1.0],
    y: [0.0, 1.0],
  },
  ids: ['A/A1', 'A/A2', 'B/B1', 'B/B2', 'C/C1', 'C/C2', 'C/C3', 'A', 'B', 'C'],
  labels: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'C3', 'A', 'B', 'C'],
  parents: ['A', 'A', 'B', 'B', 'C', 'C', 'C', '', '', ''],
  values: [10, 20, 15, 25, 5, 10, 15, 30, 40, 30],
};

// Utility: Convert flat {ids, parents, labels, values} to hierarchy tree
function buildHierarchy({ ids, parents, labels, values }) {
  const nodes = {};
  ids.forEach((id, i) => {
    nodes[id] = {
      id,
      label: labels[i],
      value: values[i],
      children: [],
      parent: parents[i] || null,
      depth: null,
    };
  });

  // Find all root nodes (nodes without parents)
  const roots = [];
  ids.forEach(id => {
    const node = nodes[id];
    if (!node.parent || node.parent === '' || node.parent === null) {
      roots.push(node);
      node.depth = 0;
    } else if (nodes[node.parent]) {
      nodes[node.parent].children.push(node);
    }
  });

  // Create a virtual root that contains all root nodes
  const virtualRoot = {
    id: 'root',
    label: 'Root',
    value: 0,
    children: roots,
    parent: null,
    depth: -1,
  };

  function dfs(node, depth = 0) {
    node.depth = depth;
    node.children.forEach(child => dfs(child, depth + 1));
  }

  dfs(virtualRoot, -1);
  return virtualRoot;
}

// For each depth, return an array of {startAngle, endAngle, value, node, label, ...}
function computeRings(root) {
  const rings = [];

  function rollup(node) {
    if (!node.children.length) return node.value;
    node.value = node.children.reduce((sum, child) => sum + rollup(child), 0);
    return node.value;
  }
  rollup(root);

  function fillAngles(node, startAngle, endAngle) {
    // Skip the virtual root node in the visualization
    if (node.depth >= 0) {
      if (!rings[node.depth]) rings[node.depth] = [];
      rings[node.depth].push({
        startAngle,
        endAngle,
        value: node.value,
        node,
        label: node.label,
        id: node.id,
      });
    }

    const angleSpan = endAngle - startAngle;
    let acc = 0;
    node.children.forEach(child => {
      const childAngle = angleSpan * (child.value / node.value);
      fillAngles(child, startAngle + acc, startAngle + acc + childAngle);
      acc += childAngle;
    });
  }

  fillAngles(root, 0, 2 * Math.PI);
  return rings;
}

// Provide a color palette for the sunburst segments
const COLORS = [
  '#4F6BED',
  '#C19C00',
  '#038387',
  '#881798',
  '#8764B8',
  '#CA5010',
  '#13A10E',
  '#D13438',
  '#00BCF2',
  '#FFB900',
  '#005B70',
  '#E3008C',
  '#B4009E',
  '#008272',
  '#E74856',
  '#0099BC',
  '#7A7574',
  '#69797E',
  '#00B7C3',
  '#B146C2',
];

const RING_WIDTH = 50;
const MAX_RINGS = 3;
const MAX_RADIUS = MAX_RINGS * RING_WIDTH + 20;
const CHART_SIZE = MAX_RADIUS * 2 + 40;

export default function SunburstChart() {
  const theme = useTheme();

  // Step 1: Make tree
  const root = buildHierarchy(sunburstData);
  // Step 2: Compute ring data (each is an array of segments at one depth)
  const rings = computeRings(root);

  // Calculate total value for percentage calculations
  const totalValue = rings.reduce(
    (sum, ring) => sum + ring.reduce((ringSum, segment) => ringSum + segment.value, 0),
    0,
  );

  // Assign colors: Each top-level node gets a color, children get shades
  const colorMap = {};
  let colorIdx = 0;

  function assignColors(node, parentColor) {
    if (node.depth === 0) {
      // Root level nodes get distinct colors
      colorMap[node.id] = COLORS[colorIdx % COLORS.length];
      parentColor = colorMap[node.id];
      colorIdx++;
    } else if (node.depth === 1) {
      // First level children get the same color as parent
      colorMap[node.id] = parentColor;
    } else if (parentColor) {
      // Deeper children get slightly different shades
      colorMap[node.id] = parentColor;
    }
    node.children.forEach(child => assignColors(child, colorMap[node.id]));
  }

  // Start coloring from the virtual root's children
  root.children.forEach(child => assignColors(child, null));

  const center = CHART_SIZE / 2;

  // Helper function to calculate label position
  const calculateLabelPosition = (startAngle: number, endAngle: number, innerRadius: number, outerRadius: number) => {
    const midAngle = (startAngle + endAngle) / 2;
    const midRadius = (innerRadius + outerRadius) / 2;
    return {
      x: Math.cos(midAngle - Math.PI / 2) * midRadius,
      y: Math.sin(midAngle - Math.PI / 2) * midRadius,
      angle: midAngle,
    };
  };

  // Convert all rings into individual Arc components
  const allArcs = [];
  const allLabels = [];

  rings.forEach((arcs, ringIndex) => {
    const innerRadius = ringIndex * RING_WIDTH + 20;
    const outerRadius = (ringIndex + 1) * RING_WIDTH + 20;

    arcs.forEach((seg, segIndex) => {
      const segmentColor = colorMap[seg.id] || COLORS[segIndex % COLORS.length];

      const arcData: IChartDataPoint = {
        data: seg.value,
        legend: seg.label,
        color: segmentColor,
        startAngle: seg.startAngle,
        endAngle: seg.endAngle,
        index: segIndex,
        value: seg.value,
        padAngle: 0,
      };

      // Add the arc
      allArcs.push(
        <Arc
          key={`arc-${ringIndex}-${segIndex}`}
          data={arcData}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          theme={theme}
          uniqText={`sunburst-${ringIndex}-${segIndex}`}
          color={segmentColor}
          hideLabels={true}
          showLabelsInPercent={false}
          totalValue={totalValue}
          onFocusCallback={() => {}}
          hoverOnCallback={() => {}}
          hoverLeaveCallback={() => {}}
          onBlurCallback={() => {}}
        />,
      );

      // Add custom label if arc is large enough
      const angleSpan = seg.endAngle - seg.startAngle;
      if (angleSpan > 0.2) {
        // Only show labels for arcs larger than ~11 degrees
        const labelPos = calculateLabelPosition(seg.startAngle, seg.endAngle, innerRadius, outerRadius);

        // Determine text color based on segment color brightness
        const textColor = getContrastColor(segmentColor);

        allLabels.push(
          <text
            key={`label-${ringIndex}-${segIndex}`}
            x={labelPos.x}
            y={labelPos.y}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={12}
            fontWeight="bold"
            fill={textColor}
            style={{ pointerEvents: 'none' }}
          >
            {seg.label}
          </text>,
        );

        // Add value label below the name for larger segments
        if (angleSpan > 0.4) {
          allLabels.push(
            <text
              key={`value-${ringIndex}-${segIndex}`}
              x={labelPos.x}
              y={labelPos.y + 14}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={10}
              fill={textColor}
              style={{ pointerEvents: 'none' }}
            >
              {seg.value}
            </text>,
          );
        }
      }
    });
  });

  // Helper function to determine text color based on background color
  function getContrastColor(hexColor: string): string {
    // Remove # if present
    const color = hexColor.replace('#', '');

    // Convert to RGB
    const r = parseInt(color.substr(0, 2), 16);
    const g = parseInt(color.substr(2, 2), 16);
    const b = parseInt(color.substr(4, 2), 16);

    // Calculate brightness
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;

    // Return white for dark colors, dark for light colors
    return brightness > 128 ? '#000000' : '#FFFFFF';
  }

  // Debug logging
  console.log('Color map:', colorMap);
  console.log('Rings:', rings);

  return (
    <div style={{ width: CHART_SIZE, height: CHART_SIZE }}>
      <svg
        width={CHART_SIZE}
        height={CHART_SIZE}
        viewBox={`0 0 ${CHART_SIZE} ${CHART_SIZE}`}
        aria-label="Sunburst chart"
      >
        <g transform={`translate(${center},${center})`}>
          {allArcs}
          {allLabels}
        </g>
      </svg>
    </div>
  );
}

SunburstChart.displayName = 'SunburstChart';
