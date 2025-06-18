const fs = require('fs');
const path = require('path');

const chartDirs = [
  'AreaChart',
  'DonutChart',
  'LineChart',
  'VerticalStackedBarChart',
  'GroupedVerticalBarChart',
  'ScatterChart',
  'GaugeChart',
  'PieChart',
  'SankeyChart',
  'HeatMapChart',
];

const chartTypeMap = {
  AreaChart: 'area',
  DonutChart: 'donut',
  LineChart: 'line',
  VerticalStackedBarChart: 'verticalStackedBar',
  GroupedVerticalBarChart: 'groupedVerticalBar',
  ScatterChart: 'scatter',
  GaugeChart: 'gauge',
  PieChart: 'pie',
  SankeyChart: 'sankey',
  HeatMapChart: 'heatmap',
};

const baseDir = 'packages/charts/react-charting/src/components';

function ensureImport(content, importLine) {
  if (!content.includes(importLine)) {
    return importLine + '\n' + content;
  }
  return content;
}

function refactorFile(filePath, chartType) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Remove old legend highlight methods
  content = content.replace(
    /private _legendHighlighted\s*=\s*\(.*?\)\s*=>\s*\{[\s\S]*?\};?/g,
    `private _legendHighlighted = (legend: string) => isLegendHighlighted(legend, this.state.selectedLegends, this.state.activeLegend || '');`,
  );
  content = content.replace(
    /private _noLegends?Highlighted\s*=\s*\(.*?\)\s*=>\s*\{[\s\S]*?\};?/g,
    `private _noLegendsHighlighted = () => noLegendHighlighted(this.state.selectedLegends, this.state.activeLegend || '');`,
  );
  // Remove _getHighlightedLegend if present
  content = content.replace(/private _getHighlightedLegend\s*\(\)\s*\{[\s\S]*?\}/g, '');

  // Replace _isChartEmpty
  content = content.replace(
    /private _isChartEmpty\s*\(\): boolean \{[\s\S]*?\}/g,
    `private _isChartEmpty(): boolean { return isChartEmpty(this.props.data, '${chartType}'); }`,
  );

  // Replace toImage
  content = content.replace(
    /public toImage\s*=\s*\(opts\?: IImageExportOptions\): Promise<string> => \{[\s\S]*?\};/g,
    `public toImage = (opts?: IImageExportOptions): Promise<string> => useImageExport(this._cartesianChartRef, this._legendsRef, getRTL())(opts);`,
  );

  // Add imports if missing
  content = ensureImport(
    content,
    `import { isLegendHighlighted, noLegendHighlighted } from '../CommonComponents/legendUtils';`,
  );
  content = ensureImport(content, `import { isChartEmpty } from '../CommonComponents/chartUtils';`);
  content = ensureImport(content, `import { useImageExport } from '../CommonComponents/imageExportUtils';`);

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Refactored: ${filePath}`);
}

for (const dir of chartDirs) {
  const baseFile = path.join(__dirname, '../../..', baseDir, dir, `${dir}.base.tsx`);
  console.log(baseFile);
  if (fs.existsSync(baseFile)) {
    console.log('refactoring', baseFile);
    refactorFile(baseFile, chartTypeMap[dir]);
  }
}
