// Utility for checking if a chart is empty

// Generic function for common chart data shapes
export function isChartEmpty(
  data: any,
  type:
    | 'line'
    | 'area'
    | 'pie'
    | 'donut'
    | 'sankey'
    | 'verticalStackedBar'
    | 'groupedVerticalBar'
    | 'scatter'
    | 'heatmap',
): boolean {
  if (!data) return true;
  switch (type) {
    case 'line':
    case 'area':
      return !(
        data.lineChartData &&
        data.lineChartData.length > 0 &&
        data.lineChartData.filter((item: any) => item.data.length > 0).length > 0
      );
    case 'pie':
      return !(data && data.length > 0 && data.filter((item: any) => item.y > 0).length > 0);
    case 'donut':
      return !(data && data.chartData && data.chartData.filter((d: any) => d.data > 0).length > 0);
    case 'sankey':
      return !(data && data.nodes && data.nodes.length > 0 && data.links && data.links.length > 0);
    case 'verticalStackedBar':
      return !(
        data &&
        data.length > 0 &&
        data.some((item: any) => item.chartData.length > 0 || (item.lineData && item.lineData.length > 0))
      );
    case 'groupedVerticalBar':
      return !(data && data.length > 0 && data.some((item: any) => item.series && item.series.length > 0));
    case 'scatter':
      return !(
        data &&
        data.scatterChartData &&
        data.scatterChartData.length > 0 &&
        data.scatterChartData.filter((item: any) => item.data.length > 0).length > 0
      );
    default:
      return true;
  }
}
