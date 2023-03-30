import * as utils from '../colors';

describe('Unit test for getting colors from token and returning the theme specific color', () => {
  test('Should return the token itself when the token is not from DataVizPallette', () => {
    expect(utils.getColorFromToken('blue')).toEqual('blue');
  });
  test('Should return the color code when the token is from DataVizPallette', () => {
    expect(utils.getColorFromToken('qualitative.1')).toEqual('#637cef');
  });

  test('Should return the first color from the provided colors list when dark theme is disabled and length of colors list is more than 1', () => {
    expect(utils.getColorFromToken('qualitative.11', false)).toEqual('#3c51b4');
  });

  test('Should return the first color from the provided colors list when dark theme is enabled and length of colors list is equal to 1', () => {
    expect(utils.getColorFromToken('qualitative.1', true)).toEqual('#637cef');
  });

  test('Should return the second color from the provided colors list when dark theme is enabled and length of colors list is more than 1', () => {
    expect(utils.getColorFromToken('qualitative.11', true)).toEqual('#93a4f4');
  });
});
