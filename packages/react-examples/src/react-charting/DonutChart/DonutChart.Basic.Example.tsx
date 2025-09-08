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

    // Sunburst with remainder mode - creates empty segments where parent > sum(children)
    // Three-level hierarchy to test deep remainder behavior
    const sunburstFlatWithRemainders = {
      ids: [
        // Level 3 (leaves)
        'Seth/Enos/Cainan',
        'Seth/Enos/Mahalaleel',
        'Seth/Noam/Child1',
        'Awan/Enoch/Irad',
        'Awan/Enoch/Mehujael',
        // Level 2
        'Seth/Enos',
        'Seth/Noam',
        'Awan/Enoch',
        'Cain/Descendant',
        // Level 1
        'Seth',
        'Cain',
        'Awan',
        'Abel',
        'Azura',
        // Level 0 (root)
        'Eve',
      ],
      labels: [
        // Level 3 labels
        'Cainan',
        'Mahalaleel',
        'Child1',
        'Irad',
        'Mehujael',
        // Level 2 labels
        'Enos',
        'Noam',
        'Enoch',
        'Descendant',
        // Level 1 labels
        'Seth',
        'Cain',
        'Awan',
        'Abel',
        'Azura',
        // Level 0 label
        'Eve',
      ],
      parents: [
        // Level 3 parents
        'Seth/Enos',
        'Seth/Enos',
        'Seth/Noam',
        'Awan/Enoch',
        'Awan/Enoch',
        // Level 2 parents
        'Seth',
        'Seth',
        'Awan',
        'Cain',
        // Level 1 parents
        'Eve',
        'Eve',
        'Eve',
        'Eve',
        'Eve',
        // Level 0 parent
        '',
      ],
      // Values designed to create remainder gaps at each level
      values: [
        // Level 3: leaf values (some small, some zero to create variety)
        8,
        6,
        0,
        4,
        3,
        // Level 2: parent remainder values (will have gaps since children don't sum to total space)
        4,
        2,
        5,
        8, // Enos remainder=4 (children=14, total=18), Noam remainder=2 (children=0, total=2), etc.
        // Level 1: parent remainder values
        12,
        15,
        2,
        0,
        8, // Seth remainder=12 (children=20, total=32), Cain remainder=15 (children=8, total=23), etc.
        // Level 0: root remainder
        0, // Eve remainder=0 (children will sum to total space)
      ],
    };

    // Schema-style data that mimics the attached Plotly schema (with NaN/zero values creating empty segments)
    const sunburstSchemaStyle = {
      ids: [
        'Bachelors/Computer Science/Intro to CS',
        'Bachelors/Computer Science/Algorithms',
        'Bachelors/Mathematics/Calculus',
        'Bachelors/Mathematics/Statistics',
        'Bachelors/History/World History',
        'Masters/Data Science/Machine Learning',
        'Masters/Education/Curriculum Design',
        'Bachelors/Computer Science',
        'Bachelors/Mathematics',
        'Bachelors/History',
        'Masters/Data Science',
        'Masters/Education',
        'Bachelors',
        'Masters',
      ],
      labels: [
        'Intro to CS',
        'Algorithms',
        'Calculus',
        'Statistics',
        'World History',
        'Machine Learning',
        'Curriculum Design',
        'Computer Science',
        'Mathematics',
        'History',
        'Data Science',
        'Education',
        'Bachelors',
        'Masters',
      ],
      parents: [
        'Bachelors/Computer Science',
        'Bachelors/Computer Science',
        'Bachelors/Mathematics',
        'Bachelors/Mathematics',
        'Bachelors/History',
        'Masters/Data Science',
        'Masters/Education',
        'Bachelors',
        'Bachelors',
        'Bachelors',
        'Masters',
        'Masters',
        '',
        '',
      ],
      // Remainder values that create empty segments (including NaN values like the schema)
      values: [
        0.69,
        0.98,
        0.8,
        0.58,
        NaN, // History course has NaN (creates empty segment)
        0.53,
        0.93,
        0.2,
        0.15,
        NaN,
        0.1,
        0.2, // History department has NaN remainder (empty segment)
        0.1,
        0.15, // Program remainders
      ],
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

        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginTop: 8 }}>
          <div style={{ width: 380, height: 420 }}>
            <h4 style={{ margin: '0 0 8px 0' }}>Total Mode (No Empty Segments)</h4>
            <Sunburst
              data={{ flat: sunburstFlatComplete, chartTitle: 'Simple fruits/vegetables' }}
              branchValues="total"
              enableGradient={this.state.enableGradient}
              roundCorners={this.state.roundCorners}
              legendProps={{ canSelectMultipleLegends: this.state.legendMultiSelect }}
              width={360}
              height={380}
            />
          </div>
          <div style={{ width: 380, height: 420 }}>
            <h4 style={{ margin: '0 0 8px 0' }}>Remainder Mode (Shows Empty Segments)</h4>
            <Sunburst
              data={{ flat: sunburstFlatWithRemainders, chartTitle: 'Eve family tree with remainders' }}
              branchValues="remainder"
              enableGradient={this.state.enableGradient}
              roundCorners={this.state.roundCorners}
              legendProps={{ canSelectMultipleLegends: this.state.legendMultiSelect }}
              width={360}
              height={380}
            />
          </div>
          <div style={{ width: 380, height: 420 }}>
            <h4 style={{ margin: '0 0 8px 0' }}>Schema-style Data (Remainder Mode)</h4>
            <Sunburst
              data={{ flat: sunburstSchemaStyle, chartTitle: 'University courses completion' }}
              branchValues="remainder"
              enableGradient={this.state.enableGradient}
              roundCorners={this.state.roundCorners}
              legendProps={{ canSelectMultipleLegends: this.state.legendMultiSelect }}
              width={360}
              height={380}
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
