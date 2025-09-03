import * as React from 'react';
import { IDonutChartProps } from '@fluentui/react-charting';
import { Toggle } from '@fluentui/react/lib/Toggle';
import { SunburstChart as Sunburst } from '@fluentui/react-charting';

interface IDonutChartState {
  enableGradient: boolean;
  roundCorners: boolean;
  legendMultiSelect: boolean;
}

export class DonutChartBasicExample extends React.Component<IDonutChartProps, IDonutChartState> {
  constructor(props: IDonutChartProps) {
    super(props);
    this.state = {
      enableGradient: false,
      roundCorners: false,
      legendMultiSelect: true,
    };
  }

  public render(): JSX.Element {
    // Complete sunburst (Eve root -> Seth, Cain, Awan, Abel, Azura; Seth->Enos/Noam, Awan->Enoch)
    const sunburstFlatComplete = {
      type: 'sunburst',
      ids: ['Fruits', 'Vegetables', 'Fruits/Apple', 'Fruits/Banana', 'Vegetables/Carrot', 'Vegetables/Leafy'],
      labels: ['Fruits', 'Vegetables', 'Apple', 'Banana', 'Carrot', 'Leafy'],
      parents: ['', '', 'Fruits', 'Fruits', 'Vegetables', 'Vegetables'],
      values: [60, 40, 35, 25, 15, 25], // parents are totals; children sum to parent
      branchvalues: 'total',
      textinfo: 'label+value',
    };

    // Sunburst with empty (zero-value) segments (e.g., Noam and Abel are zero)
    const sunburstFlatWithEmpty = {
      ids: ['Seth/Enos', 'Seth/Noam', 'Awan/Enoch', 'Seth', 'Cain', 'Awan', 'Abel', 'Azura', 'Eve'],
      labels: ['Enos', 'Noam', 'Enoch', 'Seth', 'Cain', 'Awan', 'Abel', 'Azura', 'Eve'],
      parents: ['Seth', 'Seth', 'Awan', 'Eve', 'Eve', 'Eve', 'Eve', 'Eve', ''],
      values: [28, 0, 12, 28, 20, 12, 0, 6, 0],
    };

    return (
      <>
        <div style={{ display: 'flex' }}>
          <Toggle
            label="Enable Gradient"
            onText="ON"
            offText="OFF"
            onChange={this._onToggleGradient}
            checked={this.state.enableGradient}
          />
          &nbsp;&nbsp;
          <Toggle
            label="Rounded Corners"
            onText="ON"
            offText="OFF"
            onChange={this._onToggleRoundCorners}
            checked={this.state.roundCorners}
          />
          &nbsp;&nbsp;
          <Toggle
            label="Select Multiple Legends"
            onText="ON"
            offText="OFF"
            onChange={this._onToggleLegendMultiSelect}
            checked={this.state.legendMultiSelect}
          />
        </div>

        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginTop: 8 }}>
          <div style={{ width: 420, height: 420 }}>
            <Sunburst
              data={{ flat: sunburstFlatComplete, chartTitle: 'Eve family (complete)' }}
              branchValues="total"
              enableGradient={this.state.enableGradient}
              roundCorners={this.state.roundCorners}
              legendProps={{ canSelectMultipleLegends: this.state.legendMultiSelect }}
              width={400}
              height={400}
            />
          </div>
          <div style={{ width: 420, height: 420 }}>
            <Sunburst
              data={{ flat: sunburstFlatWithEmpty, chartTitle: 'Eve family (with empties)' }}
              branchValues="total"
              enableGradient={this.state.enableGradient}
              roundCorners={this.state.roundCorners}
              legendProps={{ canSelectMultipleLegends: this.state.legendMultiSelect }}
              width={400}
              height={400}
            />
          </div>
        </div>
      </>
    );
  }

  private _onToggleGradient = (ev: React.MouseEvent<HTMLElement>, checked: boolean) => {
    this.setState({ enableGradient: checked });
  };

  private _onToggleRoundCorners = (ev: React.MouseEvent<HTMLElement>, checked: boolean) => {
    this.setState({ roundCorners: checked });
  };

  private _onToggleLegendMultiSelect = (ev: React.MouseEvent<HTMLElement>, checked: boolean) => {
    this.setState({ legendMultiSelect: checked });
  };
}
