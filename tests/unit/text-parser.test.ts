import { describe, expect, test } from 'vitest';
import parsePastedText from '../../src/main/text-parser';

describe('parsePastedText', () => {
  test('parses legacy no-header format (Last, First, Grade, L1-L3, W1-W3)', () => {
    const input = [
      'Brooks\tJoseph\tG8\tcheer\tvball\tarch\tpboard\tsail\tcanoe',
      'Brown\tJack\t5\tpball\tarch\tsoc\tkayak\tfish\tpboard',
    ].join('\n');

    const result = parsePastedText(input);

    expect(result).toEqual([
      ['Joseph', 'Brooks', 'cheer', 'vball', 'arch', 'pboard', 'sail', 'canoe'],
      ['Jack', 'Brown', 'pball', 'arch', 'soc', 'kayak', 'fish', 'pboard'],
    ]);
  });

  test('parses new header-based format regardless of column order', () => {
    const input = [
      ['Last Name', 'First Name', 'W1', 'W2', 'W3', 'L1', 'L2', 'L3'].join('\t'),
      ['Brooks', 'Joseph', 'pboard', 'sail', 'canoe', 'cheer', 'vball', 'arch'].join('\t'),
    ].join('\n');

    const result = parsePastedText(input);

    expect(result).toEqual([
      ['Joseph', 'Brooks', 'cheer', 'vball', 'arch', 'pboard', 'sail', 'canoe'],
    ]);
  });

  test('ignores trailing blank lines from a textarea paste', () => {
    const input =
      ['Brooks\tJoseph\tG8\tcheer\tvball\tarch\tpboard\tsail\tcanoe'].join('\n') + '\n\n';

    const result = parsePastedText(input);

    expect(result).toHaveLength(1);
  });

  test('returns an empty array for empty input', () => {
    expect(parsePastedText('')).toEqual([]);
  });
});
