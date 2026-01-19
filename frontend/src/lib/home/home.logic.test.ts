import { describe, it, expect } from 'vitest';
import { getStatColor, resolvePhotoUrl } from './home.logic';

describe('Home page simple unit tests', () => {
  it('getStatColor returns correct class based on value', () => {
    expect(getStatColor(80)).toBe('text-green-600');   // good
    expect(getStatColor(30)).toBe('text-yellow-600');  // medium
    expect(getStatColor(10)).toBe('text-red-600');     // bad
  });

  it('resolvePhotoUrl builds correct url for activity photos', () => {
    expect(resolvePhotoUrl(null, 'http://api.test')).toBeNull();
    expect(resolvePhotoUrl('/api/files/1.jpg', 'http://api.test')).toBe('http://api.test/api/files/1.jpg');
    expect(resolvePhotoUrl('https://cdn.com/a.jpg', 'http://api.test')).toBe('https://cdn.com/a.jpg');
  });
});
