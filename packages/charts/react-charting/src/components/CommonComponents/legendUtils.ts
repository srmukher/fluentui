// Utility for legend highlighting and selection

/**
 * Returns true if the legend is highlighted (selected or hovered).
 */
export function isLegendHighlighted(legend: string, selectedLegends: string[], activeLegend: string): boolean {
  if (selectedLegends && selectedLegends.length > 0) {
    return selectedLegends.includes(legend);
  }
  return !!activeLegend && activeLegend === legend;
}

/**
 * Returns true if no legend is highlighted (neither selected nor hovered).
 */
export function noLegendHighlighted(selectedLegends: string[], activeLegend: string): boolean {
  return (!selectedLegends || selectedLegends.length === 0) && !activeLegend;
}
