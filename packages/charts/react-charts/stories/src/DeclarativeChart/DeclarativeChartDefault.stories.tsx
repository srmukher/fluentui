import * as React from 'react';
import type { JSXElement } from '@fluentui/react-components';
import { DeclarativeChart, IDeclarativeChart, Schema } from '@fluentui/react-charts';
import {
  Dropdown,
  Field,
  Input,
  InputOnChangeData,
  Option,
  OptionOnSelectData,
  SelectionEvents,
  Spinner,
  Switch,
  useFluent,
} from '@fluentui/react-components';

import fluentSunburst from './fluent_sunburst.json';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: string;
}

type FluentDataVizColorPaletteTypes = 'default' | 'builtin' | 'others';

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public static getDerivedStateFromError(error: Error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error: `${error.message} ${error.stack}` };
  }

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: '' };
  }

  public render() {
    if (this.state.hasError) {
      return <h1>${this.state.error}</h1>;
    }

    return this.props.children;
  }
}

const DEFAULT_OPTIONS = [
  { key: 'areachart', text: 'Area Chart' },
  { key: 'donutchart', text: 'Donut Chart' },
  { key: 'gaugechart', text: 'Gauge Chart' },
  { key: 'heatmapchart', text: 'Heatmap Chart' },
  { key: 'horizontalbarchart', text: 'HorizontalBar Chart' },
  { key: 'linechart', text: 'Line Chart' },
  { key: 'piechart', text: 'Pie Chart' },
  { key: 'sankeychart', text: 'Sankey Chart' },
  { key: 'verticalbarchart', text: 'VerticalBar Chart' },
  { key: 'verticalbar_histogramchart', text: 'VerticalBar Histogram Chart' },
  { key: 'chart_table', text: 'Chart Table' },
  { key: 'scatterchart', text: 'Scatter Chart' },
  { key: 'ganttchart', text: 'Gantt Chart' },
  { key: 'funnelchart', text: 'Funnel Chart' },
  { key: 'sunburstchart', text: 'Sunburst Chart' },
];

const DEFAULT_COLOR_OPTIONS = [
  { key: 'default', text: 'Default' },
  { key: 'builtin', text: 'Builtin' },
  { key: 'override', text: 'Override' },
];

const DEFAULT_SCHEMAS = [
  // ... previous chart schemas ...
  {
    key: 'sunburstchart',
    schema: fluentSunburst,
  },
];

const dropdownStyles = { width: 200 };
const inputStyles = { maxWidth: 300 };

const cachedFetch = (url: string) => {
  const cachedData = localStorage.getItem(url);
  if (cachedData) {
    return Promise.resolve(JSON.parse(cachedData));
  }
  return fetch(url)
    .then(response => response.json())
    .then(data => {
      localStorage.setItem(url, JSON.stringify(data));
      return data;
    });
};

export const DeclarativeChartBasicExample = (): JSXElement => {
  const declarativeChartRef = React.useRef<IDeclarativeChart>(null);
  const lastKnownValidLegends = React.useRef<string[]>(undefined);
  const { targetDocument: doc } = useFluent();
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  const loadedSchemas = React.useRef<{ key: string; schema: any }[]>([]);

  const [options, setOptions] = React.useState<{ key: string; text: string }[]>([]);
  const [selectedOptions, setSelectedOptions] = React.useState<string[]>([]);
  const [dropdownValue, setDropdownValue] = React.useState('');
  const [selectedLegends, setSelectedLegends] = React.useState('');
  const [fluentDataVizColorPalette, setFluentDataVizColorPalette] =
    React.useState<FluentDataVizColorPaletteTypes>('default');
  const [showMore, setShowMore] = React.useState(false);
  const [isLoading, setLoading] = React.useState(false);

  React.useEffect(() => {
    doc?.addEventListener('contextmenu', e => {
      e.preventDefault();
    });
  }, [doc]);

  React.useEffect(() => {
    const loadSchemas = async () => {
      setLoading(true);
      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
      const _schemas: { key: string; schema: any }[] = [];
      for (let i = 1; i <= 80; i++) {
        try {
          const filename = `data_${('00' + i).slice(-3)}`;
          const schema = await cachedFetch(
            `https://raw.githubusercontent.com/microsoft/fluentui-charting-contrib/refs/heads/main/apps/plotly_examples/src/data/${filename}.json`,
          );
          _schemas.push({ key: filename, schema });
        } catch (error) {
          // Nothing to do here
        }
      }
      loadedSchemas.current = _schemas;
      setLoading(false);
    };

    loadSchemas();
  }, []);

  const getSchemaByKey = React.useCallback(
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    (key: string): any => {
      const schema = (showMore ? loadedSchemas.current : DEFAULT_SCHEMAS).find(x => x.key === key);
      return schema ? schema.schema : null;
    },
    [showMore],
  );

  React.useEffect(() => {
    if (showMore && (isLoading || loadedSchemas.current.length === 0)) {
      setOptions([]);
      setSelectedOptions([]);
      setDropdownValue('');
      setSelectedLegends('');
    } else {
      const _options = showMore
        ? loadedSchemas.current.map(schema => ({ key: schema.key, text: schema.key }))
        : DEFAULT_OPTIONS.filter(option => DEFAULT_SCHEMAS.find(schema => schema.key === option.key));
      setOptions(_options);
      setSelectedOptions([_options[0].key]);
      setDropdownValue(_options[0].text);
      const selectedPlotlySchema = getSchemaByKey(_options[0].key);
      const _selectedLegends = selectedPlotlySchema?.selectedLegends;
      setSelectedLegends(_selectedLegends ? JSON.stringify(_selectedLegends) : '');
    }
  }, [showMore, isLoading, getSchemaByKey]);

  const onSwitchDataChange = React.useCallback((ev: React.ChangeEvent<HTMLInputElement>) => {
    setShowMore(ev.currentTarget.checked);
  }, []);

  const onOptionSelect = React.useCallback(
    (ev: SelectionEvents, data: OptionOnSelectData) => {
      setSelectedOptions(data.selectedOptions);
      setDropdownValue(data.optionText ?? '');
      const selectedPlotlySchema = getSchemaByKey(data.selectedOptions[0]);
      const _selectedLegends = selectedPlotlySchema?.selectedLegends;
      setSelectedLegends(_selectedLegends ? JSON.stringify(_selectedLegends) : '');
    },
    [getSchemaByKey],
  );

  const onSelectedLegendsChange = React.useCallback(
    (ev: React.ChangeEvent<HTMLInputElement>, data: InputOnChangeData) => {
      setSelectedLegends(data.value);
    },
    [],
  );

  const handleChartSchemaChange = React.useCallback((eventData: Schema) => {
    const { selectedLegends: _selectedLegends } = eventData.plotlySchema;
    setSelectedLegends(_selectedLegends ? JSON.stringify(_selectedLegends) : '');
  }, []);

  const onColorPaletteChange = React.useCallback((_event: SelectionEvents, data: OptionOnSelectData) => {
    setFluentDataVizColorPalette(data.optionValue as FluentDataVizColorPaletteTypes);
  }, []);

  const fileSaver = React.useCallback(
    (url: string) => {
      if (!doc) {
        return;
      }

      const saveLink = doc.createElement('a');
      saveLink.href = url;
      saveLink.download = 'converted-image.png';
      doc.body.appendChild(saveLink);
      saveLink.click();
      doc.body.removeChild(saveLink);
    },
    [doc],
  );

  const renderDeclarativeChart = React.useCallback(() => {
    if (showMore) {
      if (isLoading) {
        return <Spinner label="Loading..." />;
      } else if (loadedSchemas.current.length === 0) {
        return <div>More examples could not be loaded.</div>;
      }
    }

    const uniqueKey = `${selectedOptions[0]}_${fluentDataVizColorPalette}`;
    const plotlySchema = getSchemaByKey(selectedOptions[0]);
    if (selectedLegends === '') {
      lastKnownValidLegends.current = undefined;
    } else {
      try {
        lastKnownValidLegends.current = JSON.parse(selectedLegends);
      } catch (error) {
        // Nothing to do here
      }
    }
    const inputSchema: Schema = { plotlySchema: { ...plotlySchema, selectedLegends: lastKnownValidLegends.current } };

    return (
      <ErrorBoundary key={uniqueKey}>
        <DeclarativeChart
          chartSchema={inputSchema}
          onSchemaChange={handleChartSchemaChange}
          componentRef={declarativeChartRef}
          colorwayType={fluentDataVizColorPalette}
        />
      </ErrorBoundary>
    );
  }, [
    showMore,
    isLoading,
    selectedOptions,
    selectedLegends,
    getSchemaByKey,
    handleChartSchemaChange,
    fluentDataVizColorPalette,
  ]);

  return (
    <div>
      <Switch checked={showMore} onChange={onSwitchDataChange} label={showMore ? 'Show more' : 'Show few'} />
      <div style={{ display: 'flex', flexDirection: 'row', gap: '10px' }}>
        <Field label="Select a schema">
          <Dropdown
            value={dropdownValue}
            selectedOptions={selectedOptions}
            onOptionSelect={onOptionSelect}
            style={dropdownStyles}
          >
            {options.map(option => (
              <Option key={option.key} value={option.key}>
                {option.text}
              </Option>
            ))}
          </Dropdown>
        </Field>
        <Field label="Select a color palette">
          <Dropdown
            value={fluentDataVizColorPalette}
            selectedOptions={[fluentDataVizColorPalette]}
            onOptionSelect={onColorPaletteChange}
            style={dropdownStyles}
          >
            {DEFAULT_COLOR_OPTIONS.map(option => (
              <Option key={option.key} value={option.key}>
                {option.text}
              </Option>
            ))}
          </Dropdown>
        </Field>
      </div>
      <br />
      <button
        onClick={() => {
          declarativeChartRef.current?.exportAsImage().then((imgData: string) => {
            fileSaver(imgData);
          });
        }}
      >
        Download
      </button>
      <br />
      {renderDeclarativeChart()}
      <br />
      <Field label="Current Legend selection">
        <Input value={selectedLegends} onChange={onSelectedLegendsChange} style={inputStyles} />
      </Field>
    </div>
  );
};
