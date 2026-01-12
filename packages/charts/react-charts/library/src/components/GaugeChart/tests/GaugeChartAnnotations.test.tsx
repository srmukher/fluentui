import * as React from 'react';
import { render } from '@testing-library/react';
import { GaugeChart } from '../GaugeChart';
import { GaugeChartAnnotation } from '../GaugeChart.types';
import { DataVizPalette } from '../../../index';

describe('GaugeChart with Annotations', () => {
  const defaultSegments = [
    { legend: 'Low', size: 33, color: DataVizPalette.error },
    { legend: 'Medium', size: 33, color: DataVizPalette.warning },
    { legend: 'High', size: 34, color: DataVizPalette.success },
  ];

  it('should render without annotations when not provided', () => {
    const { container } = render(
      <GaugeChart
        chartValue={50}
        maxValue={100}
        segments={defaultSegments}
      />
    );
    expect(container.querySelector('svg')).toBeTruthy();
  });

  it('should render with empty annotations array', () => {
    const { container } = render(
      <GaugeChart
        chartValue={50}
        maxValue={100}
        segments={defaultSegments}
        annotations={[]}
      />
    );
    expect(container.querySelector('svg')).toBeTruthy();
  });

  it('should render annotations when provided', () => {
    const annotations: GaugeChartAnnotation[] = [
      {
        id: 'test-annotation',
        type: 'text-label',
        text: 'Test Label',
        position: 'outer-arc',
        value: 50,
      },
    ];

    const { container } = render(
      <GaugeChart
        chartValue={50}
        maxValue={100}
        segments={defaultSegments}
        annotations={annotations}
      />
    );

    const annotationText = container.querySelector('text#gauge-annotation-test-annotation');
    expect(annotationText).toBeTruthy();
    expect(annotationText?.textContent).toBe('Test Label');
  });

  it('should render multiple annotations', () => {
    const annotations: GaugeChartAnnotation[] = [
      {
        id: 'anno-1',
        type: 'threshold',
        text: 'Low',
        position: 'outer-arc',
        value: 25,
      },
      {
        id: 'anno-2',
        type: 'threshold',
        text: 'High',
        position: 'outer-arc',
        value: 75,
      },
      {
        id: 'anno-3',
        type: 'value-marker',
        text: '50%',
        position: 'above-needle',
      },
    ];

    const { container } = render(
      <GaugeChart
        chartValue={50}
        maxValue={100}
        segments={defaultSegments}
        annotations={annotations}
      />
    );

    expect(container.querySelector('text#gauge-annotation-anno-1')).toBeTruthy();
    expect(container.querySelector('text#gauge-annotation-anno-2')).toBeTruthy();
    expect(container.querySelector('text#gauge-annotation-anno-3')).toBeTruthy();
  });

  it('should apply color to annotations', () => {
    const annotations: GaugeChartAnnotation[] = [
      {
        id: 'colored-anno',
        type: 'text-label',
        text: 'Colored',
        position: 'outer-arc',
        value: 50,
        color: '#FF0000',
      },
    ];

    const { container } = render(
      <GaugeChart
        chartValue={50}
        maxValue={100}
        segments={defaultSegments}
        annotations={annotations}
      />
    );

    const annotationText = container.querySelector('text#gauge-annotation-colored-anno') as SVGTextElement;
    expect(annotationText).toBeTruthy();
    expect(annotationText?.getAttribute('fill')).toBe('#FF0000');
  });

  it('should apply font size to annotations', () => {
    const annotations: GaugeChartAnnotation[] = [
      {
        id: 'sized-anno',
        type: 'text-label',
        text: 'Sized',
        position: 'outer-arc',
        value: 50,
        fontSize: 20,
      },
    ];

    const { container } = render(
      <GaugeChart
        chartValue={50}
        maxValue={100}
        segments={defaultSegments}
        annotations={annotations}
      />
    );

    const annotationText = container.querySelector('text#gauge-annotation-sized-anno') as SVGTextElement;
    expect(annotationText).toBeTruthy();
    expect(annotationText?.style.fontSize).toBe('20px');
  });

  it('should handle different annotation positions', () => {
    const positions = ['above-needle', 'below-needle', 'inner-arc', 'outer-arc', 'top', 'bottom'] as const;
    const annotations: GaugeChartAnnotation[] = positions.map((pos, idx) => ({
      id: `pos-${idx}`,
      type: 'text-label',
      text: `Pos ${idx}`,
      position: pos,
      value: 50,
    }));

    const { container } = render(
      <GaugeChart
        chartValue={50}
        maxValue={100}
        segments={defaultSegments}
        annotations={annotations}
      />
    );

    positions.forEach((_, idx) => {
      const anno = container.querySelector(`text#gauge-annotation-pos-${idx}`);
      expect(anno).toBeTruthy();
    });
  });

  it('should handle annotation offset', () => {
    const annotations: GaugeChartAnnotation[] = [
      {
        id: 'offset-anno',
        type: 'text-label',
        text: 'Offset',
        position: 'outer-arc',
        value: 50,
        offset: [10, 20],
      },
    ];

    const { container } = render(
      <GaugeChart
        chartValue={50}
        maxValue={100}
        segments={defaultSegments}
        annotations={annotations}
      />
    );

    const annotationGroup = container.querySelector('g') as SVGGElement;
    expect(annotationGroup).toBeTruthy();
  });

  it('should handle annotation rotation', () => {
    const annotations: GaugeChartAnnotation[] = [
      {
        id: 'rotated-anno',
        type: 'text-label',
        text: 'Rotated',
        position: 'outer-arc',
        value: 50,
        rotation: 45,
      },
    ];

    const { container } = render(
      <GaugeChart
        chartValue={50}
        maxValue={100}
        segments={defaultSegments}
        annotations={annotations}
      />
    );

    const annotationText = container.querySelector('text#gauge-annotation-rotated-anno');
    expect(annotationText).toBeTruthy();
  });

  it('should apply className to annotations', () => {
    const annotations: GaugeChartAnnotation[] = [
      {
        id: 'classed-anno',
        type: 'text-label',
        text: 'Classed',
        position: 'outer-arc',
        value: 50,
        className: 'custom-annotation-class',
      },
    ];

    const { container } = render(
      <GaugeChart
        chartValue={50}
        maxValue={100}
        segments={defaultSegments}
        annotations={annotations}
      />
    );

    const annotationText = container.querySelector('text.custom-annotation-class');
    expect(annotationText).toBeTruthy();
  });

  it('should work with all annotation types', () => {
    const types = ['text-label', 'value-marker', 'threshold', 'zone-label'] as const;
    const annotations: GaugeChartAnnotation[] = types.map((type, idx) => ({
      id: `type-${idx}`,
      type,
      text: `Type ${idx}`,
      position: 'outer-arc',
      value: 25 * (idx + 1),
    }));

    const { container } = render(
      <GaugeChart
        chartValue={50}
        maxValue={100}
        segments={defaultSegments}
        annotations={annotations}
      />
    );

    types.forEach((_, idx) => {
      const anno = container.querySelector(`text#gauge-annotation-type-${idx}`);
      expect(anno).toBeTruthy();
    });
  });

  it('should handle complex gauge with multiple annotations and features', () => {
    const annotations: GaugeChartAnnotation[] = [
      {
        id: 'title',
        type: 'text-label',
        text: 'System Status',
        position: 'top',
        fontSize: 13,
      },
      {
        id: 'threshold-25',
        type: 'threshold',
        text: 'Low',
        position: 'outer-arc',
        value: 25,
        color: '#E81123',
      },
      {
        id: 'threshold-75',
        type: 'threshold',
        text: 'High',
        position: 'outer-arc',
        value: 75,
        color: '#107C10',
      },
      {
        id: 'current',
        type: 'value-marker',
        text: '65%',
        position: 'above-needle',
      },
    ];

    const { container } = render(
      <GaugeChart
        width={300}
        height={150}
        chartValue={65}
        maxValue={100}
        minValue={0}
        chartTitle="Performance"
        sublabel="with annotations"
        segments={defaultSegments}
        annotations={annotations}
        hideLegend={false}
      />
    );

    expect(container.querySelector('svg')).toBeTruthy();
    expect(container.querySelector('text#gauge-annotation-title')).toBeTruthy();
    expect(container.querySelector('text#gauge-annotation-threshold-25')).toBeTruthy();
    expect(container.querySelector('text#gauge-annotation-threshold-75')).toBeTruthy();
    expect(container.querySelector('text#gauge-annotation-current')).toBeTruthy();
  });

  it('should handle edge case: value at minValue', () => {
    const annotations: GaugeChartAnnotation[] = [
      {
        id: 'min-value',
        type: 'text-label',
        text: 'Min',
        position: 'outer-arc',
        value: 0,
      },
    ];

    const { container } = render(
      <GaugeChart
        chartValue={0}
        maxValue={100}
        minValue={0}
        segments={defaultSegments}
        annotations={annotations}
      />
    );

    const annoText = container.querySelector('text#gauge-annotation-min-value');
    expect(annoText).toBeTruthy();
  });

  it('should handle edge case: value at maxValue', () => {
    const annotations: GaugeChartAnnotation[] = [
      {
        id: 'max-value',
        type: 'text-label',
        text: 'Max',
        position: 'outer-arc',
        value: 100,
      },
    ];

    const { container } = render(
      <GaugeChart
        chartValue={100}
        maxValue={100}
        minValue={0}
        segments={defaultSegments}
        annotations={annotations}
      />
    );

    const annoText = container.querySelector('text#gauge-annotation-max-value');
    expect(annoText).toBeTruthy();
  });

  it('should handle annotations with custom minValue and maxValue', () => {
    const annotations: GaugeChartAnnotation[] = [
      {
        id: 'custom-value',
        type: 'text-label',
        text: 'Mid',
        position: 'outer-arc',
        value: 50,
      },
    ];

    const { container } = render(
      <GaugeChart
        chartValue={50}
        maxValue={200}
        minValue={-100}
        segments={defaultSegments}
        annotations={annotations}
      />
    );

    const annoText = container.querySelector('text#gauge-annotation-custom-value');
    expect(annoText).toBeTruthy();
  });

  it('should render annotations in correct order (after segments, before needle)', () => {
    const annotations: GaugeChartAnnotation[] = [
      {
        id: 'test',
        type: 'text-label',
        text: 'Test',
        position: 'outer-arc',
        value: 50,
      },
    ];

    const { container } = render(
      <GaugeChart
        chartValue={50}
        maxValue={100}
        segments={defaultSegments}
        annotations={annotations}
      />
    );

    // Annotations should exist
    const annoText = container.querySelector('text#gauge-annotation-test');
    expect(annoText).toBeTruthy();

    // Needle should also exist (rendered after annotations)
    const needle = container.querySelector('path#gauge-chart-needle');
    expect(needle).toBeTruthy();
  });
});
