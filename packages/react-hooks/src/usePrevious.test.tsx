import * as React from 'react';
import { render } from '@testing-library/react';
import { usePrevious } from './usePrevious';

describe('usePrevious', () => {
  it('returns previous value', () => {
    let value = 0;
    let prevValue;
    const TestComponent: React.FunctionComponent = () => {
      value++;
      prevValue = usePrevious(value);
      return null;
    };

    const wrapper = render(<TestComponent />);
    expect(value).toBe(1);
    expect(prevValue).toBeUndefined();

    wrapper.rerender(<TestComponent />);

    expect(value).toBe(2);
    expect(prevValue).toBe(1);
  });
});
