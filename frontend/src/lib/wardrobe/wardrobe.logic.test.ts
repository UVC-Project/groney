import { describe, it, expect } from 'vitest';
import { getGroenySrc } from './wardrobe.logic';

describe('Wardrobe simple test', () => {
  it('shows item gif when selected, otherwise default gif', () => {
    const DefaultGif = '/default.gif';

    const groenyGifMap = {
      'hat-red-cap': '/redHat.gif',
    };

    expect(getGroenySrc('hat-red-cap', groenyGifMap, DefaultGif))
      .toBe('/redHat.gif');

    expect(getGroenySrc(null, groenyGifMap, DefaultGif))
      .toBe('/default.gif');
  });
});
