import * as React from 'react';
import { ScatterChart, IScatterChartProps, DataVizPalette } from '@fluentui/react-charting';
import { IChartProps, IScatterChartDataPoint, LegendShape } from '@fluentui/react-charting';

interface IScatterChartShapesState {
  width: number;
  height: number;
}

export class ScatterChartShapesExample extends React.Component<{}, IScatterChartShapesState> {
  constructor(props: {}) {
    super(props);
    this.state = {
      width: 700,
      height: 400,
    };
  }

  public render(): JSX.Element {
    return <div>{this._renderShapesChart()}</div>;
  }

  private _renderShapesChart(): JSX.Element {
    const data: IChartProps = {
      chartTitle: 'Scatter Chart with Different Shapes',
      scatterChartData: [
        {
          legend: 'Circle Points',
          legendShape: 'circle',
          data: [
            {
              x: 10,
              y: 50,
              markerSize: 12,
              shape: 'circle',
            },
            {
              x: 20,
              y: 75,
              markerSize: 15,
              shape: 'circle',
            },
            {
              x: 30,
              y: 90,
              markerSize: 18,
              shape: 'circle',
            },
          ],
          color: DataVizPalette.color1,
        },
        {
          legend: 'Square Points',
          legendShape: 'square',
          data: [
            {
              x: 40,
              y: 120,
              markerSize: 12,
              shape: 'square',
            },
            {
              x: 50,
              y: 150,
              markerSize: 15,
              shape: 'square',
            },
            {
              x: 60,
              y: 180,
              markerSize: 18,
              shape: 'square',
            },
          ],
          color: DataVizPalette.color2,
        },
        {
          legend: 'Triangle Points',
          legendShape: 'triangle',
          data: [
            {
              x: 70,
              y: 200,
              markerSize: 12,
              shape: 'triangle',
            },
            {
              x: 80,
              y: 220,
              markerSize: 15,
              shape: 'triangle',
            },
            {
              x: 90,
              y: 250,
              markerSize: 18,
              shape: 'triangle',
            },
          ],
          color: DataVizPalette.color3,
        },
        {
          legend: 'Diamond Points',
          legendShape: 'diamond',
          data: [
            {
              x: 100,
              y: 280,
              markerSize: 12,
              shape: 'diamond',
            },
            {
              x: 110,
              y: 300,
              markerSize: 15,
              shape: 'diamond',
            },
            {
              x: 120,
              y: 320,
              markerSize: 18,
              shape: 'diamond',
            },
          ],
          color: DataVizPalette.color4,
        },
        {
          legend: 'Cross Points',
          legendShape: 'cross',
          data: [
            {
              x: 130,
              y: 350,
              markerSize: 12,
              shape: 'cross',
            },
            {
              x: 140,
              y: 370,
              markerSize: 15,
              shape: 'cross',
            },
            {
              x: 150,
              y: 390,
              markerSize: 18,
              shape: 'cross',
            },
          ],
          color: DataVizPalette.color5,
        },
        {
          legend: 'X Points',
          legendShape: 'x',
          data: [
            {
              x: 160,
              y: 420,
              markerSize: 12,
              shape: 'x',
            },
            {
              x: 170,
              y: 440,
              markerSize: 15,
              shape: 'x',
            },
            {
              x: 180,
              y: 460,
              markerSize: 18,
              shape: 'x',
            },
          ],
          color: DataVizPalette.color6,
        },
        {
          legend: 'Rectangle Points',
          legendShape: 'rectangle',
          data: [
            {
              x: 190,
              y: 490,
              markerSize: 12,
              shape: 'rectangle',
            },
            {
              x: 200,
              y: 510,
              markerSize: 15,
              shape: 'rectangle',
            },
            {
              x: 210,
              y: 530,
              markerSize: 18,
              shape: 'rectangle',
            },
          ],
          color: DataVizPalette.color7,
        },
        {
          legend: 'Hexagon Points',
          legendShape: 'hexagon',
          data: [
            {
              x: 220,
              y: 560,
              markerSize: 12,
              shape: 'hexagon',
            },
            {
              x: 230,
              y: 580,
              markerSize: 15,
              shape: 'hexagon',
            },
            {
              x: 240,
              y: 600,
              markerSize: 18,
              shape: 'hexagon',
            },
          ],
          color: DataVizPalette.color8,
        },
      ],
    };

    const rootStyle = { width: `${this.state.width}px`, height: `${this.state.height}px` };

    return (
      <>
        <div style={rootStyle}>
          <ScatterChart
            data={data}
            height={this.state.height}
            width={this.state.width}
            margin={{ top: 20, right: 20, bottom: 30, left: 40 }}
            legendProps={{
              allowFocusOnLegends: true,
            }}
          />
        </div>
      </>
    );
  }
}
