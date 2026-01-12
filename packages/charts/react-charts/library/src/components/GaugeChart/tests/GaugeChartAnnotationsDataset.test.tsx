import * as React from 'react';
import { render } from '@testing-library/react';
import { GaugeChart } from '../GaugeChart';
import { GaugeChartAnnotation } from '../GaugeChart.types';
import { DataVizPalette, getColorFromToken } from '../../../index';

/**
 * Comprehensive Dataset Testing for Gauge Chart Annotations
 *
 * This test suite covers extensive real-world scenarios generated through
 * analysis of gauge annotation requirements. It tests:
 * - Multiple gauge sizes (small: 150x75, medium: 300x150, large: 500x250)
 * - Different value ranges (0-100, -100 to 200, custom ranges)
 * - All annotation positions (6 types)
 * - All annotation types (4 types)
 * - Complex scenarios with overlapping labels
 * - Edge cases and boundary conditions
 */

describe('GaugeChart Annotations - Comprehensive Dataset Testing', () => {
  const defaultSegments = [
    { legend: 'Low', size: 33, color: DataVizPalette.error },
    { legend: 'Medium', size: 33, color: DataVizPalette.warning },
    { legend: 'High', size: 34, color: DataVizPalette.success },
  ];

  describe('Dataset 1: Small Gauge - Minimal Annotations', () => {
    /**
     * Scenario: Small gauge dashboard widget with minimal annotations
     * Use case: Embedded in tight layouts, real-time monitoring dashboards
     * Size: 150x75 pixels
     * Value range: 0-100
     * Annotations: Single threshold at midpoint
     */

    it('should render small gauge with minimal annotations', () => {
      const annotations: GaugeChartAnnotation[] = [
        {
          id: 'threshold-50',
          type: 'threshold',
          text: '50%',
          position: 'outer-arc',
          value: 50,
          fontSize: 9,
          color: getColorFromToken(DataVizPalette.warning),
        },
      ];

      const { container } = render(
        <GaugeChart
          width={150}
          height={75}
          chartValue={35}
          maxValue={100}
          minValue={0}
          segments={defaultSegments}
          annotations={annotations}
        />
      );

      expect(container.querySelector('text#gauge-annotation-threshold-50')).toBeTruthy();
    });

    it('should handle value at minimum in small gauge', () => {
      const annotations: GaugeChartAnnotation[] = [
        {
          id: 'min-marker',
          type: 'threshold',
          text: 'Min',
          position: 'outer-arc',
          value: 0,
          fontSize: 9,
        },
      ];

      const { container } = render(
        <GaugeChart
          width={150}
          height={75}
          chartValue={0}
          maxValue={100}
          minValue={0}
          segments={defaultSegments}
          annotations={annotations}
        />
      );

      expect(container.querySelector('text#gauge-annotation-min-marker')).toBeTruthy();
    });

    it('should handle value at maximum in small gauge', () => {
      const annotations: GaugeChartAnnotation[] = [
        {
          id: 'max-marker',
          type: 'threshold',
          text: 'Max',
          position: 'outer-arc',
          value: 100,
          fontSize: 9,
        },
      ];

      const { container } = render(
        <GaugeChart
          width={150}
          height={75}
          chartValue={100}
          maxValue={100}
          minValue={0}
          segments={defaultSegments}
          annotations={annotations}
        />
      );

      expect(container.querySelector('text#gauge-annotation-max-marker')).toBeTruthy();
    });
  });

  describe('Dataset 2: Medium Gauge - Threshold Annotations', () => {
    /**
     * Scenario: Standard performance/status monitoring gauge
     * Use case: System dashboards, KPI monitoring
     * Size: 300x150 pixels
     * Value range: 0-100
     * Annotations: Multiple thresholds at 25, 50, 75, 100
     */

    it('should render medium gauge with multiple threshold annotations', () => {
      const annotations: GaugeChartAnnotation[] = [
        {
          id: 'threshold-25',
          type: 'threshold',
          text: '25%',
          position: 'outer-arc',
          value: 25,
          fontSize: 11,
          color: getColorFromToken(DataVizPalette.error),
        },
        {
          id: 'threshold-50',
          type: 'threshold',
          text: '50%',
          position: 'outer-arc',
          value: 50,
          fontSize: 11,
          color: getColorFromToken(DataVizPalette.warning),
        },
        {
          id: 'threshold-75',
          type: 'threshold',
          text: '75%',
          position: 'outer-arc',
          value: 75,
          fontSize: 11,
          color: getColorFromToken(DataVizPalette.success),
        },
        {
          id: 'current-value',
          type: 'value-marker',
          text: '62%',
          position: 'above-needle',
          fontSize: 14,
        },
      ];

      const { container } = render(
        <GaugeChart
          width={300}
          height={150}
          chartValue={62}
          maxValue={100}
          minValue={0}
          segments={defaultSegments}
          annotations={annotations}
        />
      );

      expect(container.querySelector('text#gauge-annotation-threshold-25')).toBeTruthy();
      expect(container.querySelector('text#gauge-annotation-threshold-50')).toBeTruthy();
      expect(container.querySelector('text#gauge-annotation-threshold-75')).toBeTruthy();
      expect(container.querySelector('text#gauge-annotation-current-value')).toBeTruthy();
    });

    it('should render low, medium, and high performance ranges', () => {
      const createGaugeWithValue = (value: number) => {
        const annotations: GaugeChartAnnotation[] = [
          {
            id: `value-${value}`,
            type: 'value-marker',
            text: `${value}%`,
            position: 'above-needle',
            fontSize: 14,
          },
        ];

        const { container } = render(
          <GaugeChart
            width={300}
            height={150}
            chartValue={value}
            maxValue={100}
            minValue={0}
            segments={defaultSegments}
            annotations={annotations}
          />
        );

        return container;
      };

      // Test low range (20%)
      let container = createGaugeWithValue(20);
      expect(container.querySelector('text#gauge-annotation-value-20')).toBeTruthy();

      // Test medium range (50%)
      container = createGaugeWithValue(50);
      expect(container.querySelector('text#gauge-annotation-value-50')).toBeTruthy();

      // Test high range (85%)
      container = createGaugeWithValue(85);
      expect(container.querySelector('text#gauge-annotation-value-85')).toBeTruthy();
    });
  });

  describe('Dataset 3: Large Gauge - Comprehensive Annotations', () => {
    /**
     * Scenario: Large standalone gauge with all annotation types and positions
     * Use case: Primary KPI displays, wall-mounted dashboards
     * Size: 500x250 pixels
     * Value range: 0-100
     * Annotations: Mixed types at all 6 positions with styling
     */

    it('should render large gauge with all annotation positions', () => {
      const annotations: GaugeChartAnnotation[] = [
        // Top position
        {
          id: 'title-top',
          type: 'text-label',
          text: 'System Performance',
          position: 'top',
          fontSize: 16,
          color: getColorFromToken(DataVizPalette.success),
        },
        // Bottom position
        {
          id: 'unit-bottom',
          type: 'text-label',
          text: 'Score: 0-100',
          position: 'bottom',
          fontSize: 12,
        },
        // Above needle
        {
          id: 'current-above',
          type: 'value-marker',
          text: '75%',
          position: 'above-needle',
          fontSize: 15,
        },
        // Below needle
        {
          id: 'range-below',
          type: 'text-label',
          text: 'Good',
          position: 'below-needle',
          fontSize: 12,
        },
        // Outer arc at 25%
        {
          id: 'marker-25',
          type: 'threshold',
          text: '25%',
          position: 'outer-arc',
          value: 25,
          fontSize: 11,
          offset: [0, 5],
        },
        // Outer arc at 75%
        {
          id: 'marker-75',
          type: 'threshold',
          text: '75%',
          position: 'outer-arc',
          value: 75,
          fontSize: 11,
          offset: [0, 5],
        },
        // Inner arc at 50%
        {
          id: 'zone-center',
          type: 'zone-label',
          text: 'Target',
          position: 'inner-arc',
          value: 50,
          fontSize: 11,
        },
      ];

      const { container } = render(
        <GaugeChart
          width={500}
          height={250}
          chartValue={75}
          maxValue={100}
          minValue={0}
          chartTitle="Performance"
          segments={defaultSegments}
          annotations={annotations}
        />
      );

      // Verify all annotations are present
      expect(container.querySelector('text#gauge-annotation-title-top')).toBeTruthy();
      expect(container.querySelector('text#gauge-annotation-unit-bottom')).toBeTruthy();
      expect(container.querySelector('text#gauge-annotation-current-above')).toBeTruthy();
      expect(container.querySelector('text#gauge-annotation-range-below')).toBeTruthy();
      expect(container.querySelector('text#gauge-annotation-marker-25')).toBeTruthy();
      expect(container.querySelector('text#gauge-annotation-marker-75')).toBeTruthy();
      expect(container.querySelector('text#gauge-annotation-zone-center')).toBeTruthy();
    });

    it('should render temperature gauge with zone labels and styling', () => {
      const annotations: GaugeChartAnnotation[] = [
        {
          id: 'title',
          type: 'text-label',
          text: 'Temperature Control',
          position: 'top',
          fontSize: 14,
        },
        {
          id: 'zone-safe',
          type: 'zone-label',
          text: 'Safe Zone',
          position: 'inner-arc',
          value: 25,
          fontSize: 12,
          color: getColorFromToken(DataVizPalette.success),
        },
        {
          id: 'zone-caution',
          type: 'zone-label',
          text: 'Caution',
          position: 'inner-arc',
          value: 50,
          fontSize: 12,
          color: getColorFromToken(DataVizPalette.warning),
        },
        {
          id: 'zone-danger',
          type: 'zone-label',
          text: 'Danger',
          position: 'inner-arc',
          value: 75,
          fontSize: 12,
          color: getColorFromToken(DataVizPalette.error),
        },
        {
          id: 'current-temp',
          type: 'value-marker',
          text: '75°C',
          position: 'below-needle',
          fontSize: 13,
        },
      ];

      const segmentsTemp = [
        { legend: 'Safe', size: 33, color: DataVizPalette.success },
        { legend: 'Caution', size: 34, color: DataVizPalette.warning },
        { legend: 'Danger', size: 33, color: DataVizPalette.error },
      ];

      const { container } = render(
        <GaugeChart
          width={500}
          height={250}
          chartValue={75}
          maxValue={100}
          minValue={0}
          chartTitle="Temperature"
          segments={segmentsTemp}
          annotations={annotations}
        />
      );

      expect(container.querySelector('text#gauge-annotation-zone-safe')).toBeTruthy();
      expect(container.querySelector('text#gauge-annotation-zone-caution')).toBeTruthy();
      expect(container.querySelector('text#gauge-annotation-zone-danger')).toBeTruthy();
      expect(container.querySelector('text#gauge-annotation-current-temp')).toBeTruthy();
    });
  });

  describe('Dataset 4: Custom Value Range (-100 to 200)', () => {
    /**
     * Scenario: Gauge with non-standard value range
     * Use case: Temperature scales, financial metrics with positive/negative values
     * Size: 300x150 pixels
     * Value range: -100 to 200
     * Annotations: Zero point, positive/negative zones
     */

    it('should handle custom minValue and maxValue with annotations', () => {
      const annotations: GaugeChartAnnotation[] = [
        {
          id: 'zero-point',
          type: 'threshold',
          text: 'Zero',
          position: 'outer-arc',
          value: 0,
          fontSize: 12,
          color: getColorFromToken(DataVizPalette.warning),
        },
        {
          id: 'negative-100',
          type: 'threshold',
          text: '-100',
          position: 'outer-arc',
          value: -100,
          fontSize: 10,
        },
        {
          id: 'positive-100',
          type: 'threshold',
          text: '+100',
          position: 'outer-arc',
          value: 100,
          fontSize: 10,
        },
        {
          id: 'positive-200',
          type: 'threshold',
          text: '+200',
          position: 'outer-arc',
          value: 200,
          fontSize: 10,
        },
        {
          id: 'current',
          type: 'value-marker',
          text: '+50',
          position: 'above-needle',
          fontSize: 14,
        },
      ];

      const segments = [
        { legend: 'Negative', size: 100, color: DataVizPalette.error },
        { legend: 'Positive', size: 200, color: DataVizPalette.success },
      ];

      const { container } = render(
        <GaugeChart
          width={300}
          height={150}
          chartValue={50}
          maxValue={200}
          minValue={-100}
          segments={segments}
          annotations={annotations}
        />
      );

      expect(container.querySelector('text#gauge-annotation-zero-point')).toBeTruthy();
      expect(container.querySelector('text#gauge-annotation-negative-100')).toBeTruthy();
      expect(container.querySelector('text#gauge-annotation-positive-100')).toBeTruthy();
      expect(container.querySelector('text#gauge-annotation-positive-200')).toBeTruthy();
      expect(container.querySelector('text#gauge-annotation-current')).toBeTruthy();
    });

    it('should test all boundary values with custom range', () => {
      const testValues = [-100, -50, 0, 50, 100, 150, 200];

      testValues.forEach((value) => {
        const annotations: GaugeChartAnnotation[] = [
          {
            id: `boundary-${value}`,
            type: 'value-marker',
            text: String(value),
            position: 'above-needle',
            fontSize: 12,
          },
        ];

        const segments = [
          { legend: 'Negative', size: 100, color: DataVizPalette.error },
          { legend: 'Positive', size: 200, color: DataVizPalette.success },
        ];

        const { container } = render(
          <GaugeChart
            width={300}
            height={150}
            chartValue={value}
            maxValue={200}
            minValue={-100}
            segments={segments}
            annotations={annotations}
          />
        );

        expect(container.querySelector(`text#gauge-annotation-boundary-${value}`)).toBeTruthy();
      });
    });
  });

  describe('Dataset 5: Rotated and Offset Annotations', () => {
    /**
     * Scenario: Advanced styling with rotations and offsets
     * Use case: Crowded layouts requiring fine-tuned label positioning
     * Size: 300x150 pixels
     * Value range: 0-100
     * Annotations: Multiple annotations with rotation and offset adjustments
     */

    it('should render annotations with rotation', () => {
      const annotations: GaugeChartAnnotation[] = [
        {
          id: 'rotated-45',
          type: 'text-label',
          text: 'ROTATED',
          position: 'outer-arc',
          value: 25,
          fontSize: 12,
          rotation: 45,
        },
        {
          id: 'rotated-neg45',
          type: 'text-label',
          text: 'ANGLED',
          position: 'outer-arc',
          value: 75,
          fontSize: 12,
          rotation: -45,
        },
      ];

      const { container } = render(
        <GaugeChart
          width={300}
          height={150}
          chartValue={50}
          maxValue={100}
          minValue={0}
          segments={defaultSegments}
          annotations={annotations}
        />
      );

      expect(container.querySelector('text#gauge-annotation-rotated-45')).toBeTruthy();
      expect(container.querySelector('text#gauge-annotation-rotated-neg45')).toBeTruthy();
    });

    it('should render annotations with offsets for spacing', () => {
      const annotations: GaugeChartAnnotation[] = [
        {
          id: 'offset-right',
          type: 'threshold',
          text: 'Right',
          position: 'outer-arc',
          value: 25,
          fontSize: 11,
          offset: [15, 0],
        },
        {
          id: 'offset-down',
          type: 'threshold',
          text: 'Down',
          position: 'outer-arc',
          value: 50,
          fontSize: 11,
          offset: [0, 10],
        },
        {
          id: 'offset-diagonal',
          type: 'threshold',
          text: 'Diagonal',
          position: 'outer-arc',
          value: 75,
          fontSize: 11,
          offset: [10, 10],
        },
      ];

      const { container } = render(
        <GaugeChart
          width={300}
          height={150}
          chartValue={50}
          maxValue={100}
          minValue={0}
          segments={defaultSegments}
          annotations={annotations}
        />
      );

      expect(container.querySelector('text#gauge-annotation-offset-right')).toBeTruthy();
      expect(container.querySelector('text#gauge-annotation-offset-down')).toBeTruthy();
      expect(container.querySelector('text#gauge-annotation-offset-diagonal')).toBeTruthy();
    });

    it('should combine rotation and offset adjustments', () => {
      const annotations: GaugeChartAnnotation[] = [
        {
          id: 'complex-adjust',
          type: 'text-label',
          text: 'Complex',
          position: 'outer-arc',
          value: 50,
          fontSize: 12,
          rotation: 30,
          offset: [10, 5],
        },
      ];

      const { container } = render(
        <GaugeChart
          width={300}
          height={150}
          chartValue={50}
          maxValue={100}
          minValue={0}
          segments={defaultSegments}
          annotations={annotations}
        />
      );

      expect(container.querySelector('text#gauge-annotation-complex-adjust')).toBeTruthy();
    });
  });

  describe('Dataset 6: Crowded Annotations - Overlap Stress Testing', () => {
    /**
     * Scenario: Many annotations in close proximity
     * Use case: Detailed monitoring with multiple thresholds and markers
     * Size: 350x175 pixels
     * Value range: 0-100
     * Annotations: 10+ annotations testing label management
     */

    it('should handle many annotations without crashing', () => {
      const annotations: GaugeChartAnnotation[] = [];

      // Add threshold at every 10% mark
      for (let i = 1; i <= 10; i++) {
        annotations.push({
          id: `threshold-${i * 10}`,
          type: 'threshold',
          text: `${i * 10}%`,
          position: 'outer-arc',
          value: i * 10,
          fontSize: 9,
          offset: [0, i % 2 === 0 ? 5 : -5],
        });
      }

      // Add current value marker
      annotations.push({
        id: 'current-marker',
        type: 'value-marker',
        text: '65%',
        position: 'above-needle',
        fontSize: 12,
      });

      const { container } = render(
        <GaugeChart
          width={350}
          height={175}
          chartValue={65}
          maxValue={100}
          minValue={0}
          segments={defaultSegments}
          annotations={annotations}
        />
      );

      // Verify all annotations are rendered
      for (let i = 1; i <= 10; i++) {
        expect(container.querySelector(`text#gauge-annotation-threshold-${i * 10}`)).toBeTruthy();
      }
      expect(container.querySelector('text#gauge-annotation-current-marker')).toBeTruthy();
    });

    it('should handle annotations clustered around high-frequency zones', () => {
      const annotations: GaugeChartAnnotation[] = [
        {
          id: 'anno-48',
          type: 'threshold',
          text: '48%',
          position: 'outer-arc',
          value: 48,
          fontSize: 10,
          offset: [0, -5],
        },
        {
          id: 'anno-50',
          type: 'threshold',
          text: '50%',
          position: 'outer-arc',
          value: 50,
          fontSize: 10,
          offset: [0, 5],
        },
        {
          id: 'anno-52',
          type: 'threshold',
          text: '52%',
          position: 'outer-arc',
          value: 52,
          fontSize: 10,
          offset: [0, -5],
        },
        {
          id: 'inner-50',
          type: 'zone-label',
          text: 'Mid',
          position: 'inner-arc',
          value: 50,
          fontSize: 10,
        },
        {
          id: 'current',
          type: 'value-marker',
          text: '50%',
          position: 'above-needle',
          fontSize: 12,
        },
      ];

      const { container } = render(
        <GaugeChart
          width={350}
          height={175}
          chartValue={50}
          maxValue={100}
          minValue={0}
          segments={defaultSegments}
          annotations={annotations}
        />
      );

      expect(container.querySelector('text#gauge-annotation-anno-48')).toBeTruthy();
      expect(container.querySelector('text#gauge-annotation-anno-50')).toBeTruthy();
      expect(container.querySelector('text#gauge-annotation-anno-52')).toBeTruthy();
      expect(container.querySelector('text#gauge-annotation-inner-50')).toBeTruthy();
      expect(container.querySelector('text#gauge-annotation-current')).toBeTruthy();
    });
  });

  describe('Dataset 7: Real-World Gauge Scenarios', () => {
    /**
     * Scenario: Practical business use cases
     * Use case: Actual gauge chart implementations in production
     */

    it('should render SLA compliance gauge', () => {
      const annotations: GaugeChartAnnotation[] = [
        {
          id: 'sla-target',
          type: 'threshold',
          text: 'Target: 99.5%',
          position: 'outer-arc',
          value: 99.5,
          fontSize: 11,
          color: getColorFromToken(DataVizPalette.success),
        },
        {
          id: 'sla-warning',
          type: 'threshold',
          text: 'Warning: 95%',
          position: 'outer-arc',
          value: 95,
          fontSize: 11,
          color: getColorFromToken(DataVizPalette.warning),
        },
        {
          id: 'sla-current',
          type: 'value-marker',
          text: '98.2%',
          position: 'above-needle',
          fontSize: 13,
        },
      ];

      const segments = [
        { legend: 'Critical', size: 5, color: DataVizPalette.error },
        { legend: 'Warning', size: 5, color: DataVizPalette.warning },
        { legend: 'Healthy', size: 90, color: DataVizPalette.success },
      ];

      const { container } = render(
        <GaugeChart
          width={300}
          height={150}
          chartValue={98.2}
          maxValue={100}
          minValue={90}
          chartTitle="SLA Compliance"
          segments={segments}
          annotations={annotations}
        />
      );

      expect(container.querySelector('text#gauge-annotation-sla-target')).toBeTruthy();
      expect(container.querySelector('text#gauge-annotation-sla-warning')).toBeTruthy();
      expect(container.querySelector('text#gauge-annotation-sla-current')).toBeTruthy();
    });

    it('should render CPU usage gauge with zone labels', () => {
      const annotations: GaugeChartAnnotation[] = [
        {
          id: 'title',
          type: 'text-label',
          text: 'CPU Usage',
          position: 'top',
          fontSize: 13,
        },
        {
          id: 'zone-idle',
          type: 'zone-label',
          text: 'Idle',
          position: 'inner-arc',
          value: 12.5,
          fontSize: 11,
          color: getColorFromToken(DataVizPalette.success),
        },
        {
          id: 'zone-normal',
          type: 'zone-label',
          text: 'Normal',
          position: 'inner-arc',
          value: 37.5,
          fontSize: 11,
          color: getColorFromToken(DataVizPalette.success),
        },
        {
          id: 'zone-busy',
          type: 'zone-label',
          text: 'Busy',
          position: 'inner-arc',
          value: 62.5,
          fontSize: 11,
          color: getColorFromToken(DataVizPalette.warning),
        },
        {
          id: 'zone-critical',
          type: 'zone-label',
          text: 'Critical',
          position: 'inner-arc',
          value: 87.5,
          fontSize: 11,
          color: getColorFromToken(DataVizPalette.error),
        },
        {
          id: 'current-usage',
          type: 'value-marker',
          text: '68%',
          position: 'above-needle',
          fontSize: 14,
        },
        {
          id: 'unit',
          type: 'text-label',
          text: 'Percent',
          position: 'bottom',
          fontSize: 11,
        },
      ];

      const segments = [
        { legend: 'Idle', size: 25, color: DataVizPalette.success },
        { legend: 'Normal', size: 25, color: DataVizPalette.success },
        { legend: 'Busy', size: 25, color: DataVizPalette.warning },
        { legend: 'Critical', size: 25, color: DataVizPalette.error },
      ];

      const { container } = render(
        <GaugeChart
          width={400}
          height={200}
          chartValue={68}
          maxValue={100}
          minValue={0}
          chartTitle="System CPU"
          segments={segments}
          annotations={annotations}
        />
      );

      expect(container.querySelector('text#gauge-annotation-zone-idle')).toBeTruthy();
      expect(container.querySelector('text#gauge-annotation-zone-normal')).toBeTruthy();
      expect(container.querySelector('text#gauge-annotation-zone-busy')).toBeTruthy();
      expect(container.querySelector('text#gauge-annotation-zone-critical')).toBeTruthy();
      expect(container.querySelector('text#gauge-annotation-current-usage')).toBeTruthy();
    });

    it('should render network latency gauge', () => {
      const annotations: GaugeChartAnnotation[] = [
        {
          id: 'title',
          type: 'text-label',
          text: 'Network Latency',
          position: 'top',
          fontSize: 14,
        },
        {
          id: 'excellent-50',
          type: 'threshold',
          text: '50ms',
          position: 'outer-arc',
          value: 50,
          fontSize: 10,
          color: getColorFromToken(DataVizPalette.success),
        },
        {
          id: 'good-100',
          type: 'threshold',
          text: '100ms',
          position: 'outer-arc',
          value: 100,
          fontSize: 10,
          color: getColorFromToken(DataVizPalette.success),
        },
        {
          id: 'acceptable-200',
          type: 'threshold',
          text: '200ms',
          position: 'outer-arc',
          value: 200,
          fontSize: 10,
          color: getColorFromToken(DataVizPalette.warning),
        },
        {
          id: 'poor-500',
          type: 'threshold',
          text: '500ms',
          position: 'outer-arc',
          value: 500,
          fontSize: 10,
          color: getColorFromToken(DataVizPalette.error),
        },
        {
          id: 'current',
          type: 'value-marker',
          text: '125ms',
          position: 'above-needle',
          fontSize: 13,
        },
        {
          id: 'unit',
          type: 'text-label',
          text: 'Milliseconds',
          position: 'bottom',
          fontSize: 10,
        },
      ];

      const segments = [
        { legend: 'Excellent', size: 50, color: DataVizPalette.success },
        { legend: 'Good', size: 50, color: DataVizPalette.success },
        { legend: 'Acceptable', size: 100, color: DataVizPalette.warning },
        { legend: 'Poor', size: 300, color: DataVizPalette.error },
      ];

      const { container } = render(
        <GaugeChart
          width={400}
          height={200}
          chartValue={125}
          maxValue={500}
          minValue={0}
          chartTitle="Latency"
          segments={segments}
          annotations={annotations}
        />
      );

      expect(container.querySelector('text#gauge-annotation-excellent-50')).toBeTruthy();
      expect(container.querySelector('text#gauge-annotation-good-100')).toBeTruthy();
      expect(container.querySelector('text#gauge-annotation-acceptable-200')).toBeTruthy();
      expect(container.querySelector('text#gauge-annotation-poor-500')).toBeTruthy();
      expect(container.querySelector('text#gauge-annotation-current')).toBeTruthy();
    });
  });

  describe('Dataset 8: Accessibility and Styling', () => {
    /**
     * Scenario: Annotations with accessibility support and custom styling
     */

    it('should render annotations with className for custom styling', () => {
      const annotations: GaugeChartAnnotation[] = [
        {
          id: 'styled-anno',
          type: 'text-label',
          text: 'Custom Style',
          position: 'outer-arc',
          value: 50,
          fontSize: 12,
          className: 'custom-gauge-annotation',
        },
      ];

      const { container } = render(
        <GaugeChart
          width={300}
          height={150}
          chartValue={50}
          maxValue={100}
          minValue={0}
          segments={defaultSegments}
          annotations={annotations}
        />
      );

      expect(container.querySelector('text.custom-gauge-annotation')).toBeTruthy();
    });

    it('should support different text colors for contrast', () => {
      const annotations: GaugeChartAnnotation[] = [
        {
          id: 'red-text',
          type: 'threshold',
          text: 'Alert',
          position: 'outer-arc',
          value: 25,
          fontSize: 11,
          color: '#FF0000',
        },
        {
          id: 'green-text',
          type: 'threshold',
          text: 'Good',
          position: 'outer-arc',
          value: 75,
          fontSize: 11,
          color: '#00AA00',
        },
        {
          id: 'blue-text',
          type: 'threshold',
          text: 'Info',
          position: 'outer-arc',
          value: 50,
          fontSize: 11,
          color: '#0000FF',
        },
      ];

      const { container } = render(
        <GaugeChart
          width={300}
          height={150}
          chartValue={50}
          maxValue={100}
          minValue={0}
          segments={defaultSegments}
          annotations={annotations}
        />
      );

      const redText = container.querySelector('text#gauge-annotation-red-text') as SVGTextElement;
      const greenText = container.querySelector('text#gauge-annotation-green-text') as SVGTextElement;
      const blueText = container.querySelector('text#gauge-annotation-blue-text') as SVGTextElement;

      expect(redText?.getAttribute('fill')).toBe('#FF0000');
      expect(greenText?.getAttribute('fill')).toBe('#00AA00');
      expect(blueText?.getAttribute('fill')).toBe('#0000FF');
    });
  });
});
