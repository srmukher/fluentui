import * as React from 'react';
import { XAxisTypes } from '../../utilities/index';
import { LineDataInVerticalStackedBarChart, VerticalStackedChartProps } from '../../index';

type LinePoint = LineDataInVerticalStackedBarChart & { index: number; xItem: VerticalStackedChartProps };
type LineObject = { [key: string]: LinePoint[] };

declare type NumericScale = (value: number) => number;

declare interface LineOverlayProps {
  data: VerticalStackedChartProps[];
  xScale: any;
  yScale: NumericScale;
  containerHeight: number;
  containerWidth: number;
  yScaleSecondary?: NumericScale;
  xAxisType: XAxisTypes;
  isLegendHighlighted: (legendTitle: string) => boolean;
  noLegendHighlighted: () => boolean;
}

function getFormattedLineData(data: VerticalStackedChartProps[]): LineObject {
  const linesData: LinePoint[] = [];
  const formattedLineData: LineObject = {};
  data.forEach((item: VerticalStackedChartProps, index: number) => {
    if (item.lineData) {
      item.lineData.forEach((line: any) => {
        linesData.push({
          ...line,
          index,
          xItem: item,
        });
      });
    }
  });
  linesData.forEach(item => {
    if (formattedLineData[item.legend]) {
      formattedLineData[item.legend].push(item);
    } else {
      formattedLineData[item.legend] = [item];
    }
  });
  return formattedLineData;
}

const VerticalStackedBarChartLineOverlay: React.FC<LineOverlayProps> = ({
  data,
  xScale,
  yScale,
  containerHeight,
  containerWidth,
  yScaleSecondary,
  xAxisType,
  isLegendHighlighted,
  noLegendHighlighted,
}) => {
  const lineObject = getFormattedLineData(data);
  const lines: React.ReactNode[] = [];
  const borderForLines: React.ReactNode[] = [];
  const dots: React.ReactNode[] = [];
  const lineBorderWidth = 0; // You can add prop support if needed
  const xScaleBandwidthTranslate = xAxisType !== XAxisTypes.StringAxis ? 0 : xScale.bandwidth() / 2;
  Object.keys(lineObject).forEach((item: string, index: number) => {
    const shouldHighlight = isLegendHighlighted(item) || noLegendHighlighted();
    for (let i = 1; i < lineObject[item].length; i++) {
      const x1 = xScale(lineObject[item][i - 1].xItem.xAxisPoint);
      const useSecondaryYScale =
        lineObject[item][i - 1].useSecondaryYScale && lineObject[item][i].useSecondaryYScale && yScaleSecondary;
      const y1 = useSecondaryYScale ? yScaleSecondary!(lineObject[item][i - 1].y) : yScale(lineObject[item][i - 1].y);
      const x2 = xScale(lineObject[item][i].xItem.xAxisPoint);
      const y2 = useSecondaryYScale ? yScaleSecondary!(lineObject[item][i].y) : yScale(lineObject[item][i].y);
      if (lineBorderWidth > 0) {
        borderForLines.push(
          <line
            key={`${index}-${i}-BorderLine`}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            opacity={shouldHighlight ? 1 : 0.1}
            strokeWidth={3 + lineBorderWidth * 2}
            fill="transparent"
            strokeLinecap="round"
            stroke="#fff"
            transform={`translate(${xScaleBandwidthTranslate}, 0)`}
          />,
        );
      }
      lines.push(
        <line
          key={`${index}-${i}-line`}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          opacity={shouldHighlight ? 1 : 0.1}
          strokeWidth={lineObject[item][0].lineOptions?.strokeWidth ?? 3}
          strokeLinecap={lineObject[item][0].lineOptions?.strokeLinecap ?? 'round'}
          strokeDasharray={lineObject[item][0].lineOptions?.strokeDasharray}
          stroke={lineObject[item][i].color}
          transform={`translate(${xScaleBandwidthTranslate}, 0)`}
        />,
      );
    }
  });
  Object.keys(lineObject).forEach((item: string, index: number) => {
    lineObject[item].forEach((circlePoint: LinePoint, subIndex: number) => {
      dots.push(
        <circle
          key={`${index}-${subIndex}-dot`}
          cx={xScale(circlePoint.xItem.xAxisPoint)}
          cy={
            circlePoint.useSecondaryYScale && yScaleSecondary ? yScaleSecondary(circlePoint.y) : yScale(circlePoint.y)
          }
          r={3}
          stroke={circlePoint.color}
          fill="#fff"
          strokeWidth={3}
          opacity={1}
          transform={`translate(${xScaleBandwidthTranslate}, 0)`}
        />,
      );
    });
  });
  return (
    <>
      {borderForLines}
      {lines}
      {dots}
    </>
  );
};

export default VerticalStackedBarChartLineOverlay;
