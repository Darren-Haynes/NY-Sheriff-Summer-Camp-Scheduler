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

  test('handles short rows with missing fields to trigger fallback default mapping branches', () => {
    // 1. First Row cuts short at column 1 (Index 1 is undefined, hitting Line 54).
    // 2. Second Row uses a tab split on an completely empty structure, forcing index 0 to be empty or undefined.
    // To ensure a row mapping array index 0 evaluates to undefined, we can trick the mapper
    // by using a trailing newline with an explicit spacer, or appending an empty slice block.
    const input = [
      'Brooks',
    ].join('\n');

    const result = parsePastedText(input);

    expect(result).toHaveLength(1);
    expect(result[0][0]).toBe(''); // Line 54 hit!

    // TACTICAL UNIVERSE EXPANSION:
    // To cleanly hit line 55 without mutating the text structure, we can pass a row that uses a
    // header format where lastNameCol points to an index far out of bounds (like index 99).
    const outOfBoundsHeaderInput = [
      ['First Name', 'W1', 'W2', 'W3', 'L1', 'L2', 'L3', 'Last Name'].join('\t'),
      ['Joseph', 'pboard', 'sail', 'canoe', 'cheer', 'vball', 'arch'].join('\t'), // Omit the last element entirely
    ].join('\n');

    const outOfBoundsResult = parsePastedText(outOfBoundsHeaderInput);
    expect(outOfBoundsResult).toHaveLength(1);

    // Because 'Last Name' was the 8th column (index 7) but the data row was cut short,
    // row[indices.lastNameCol] will evaluate to undefined, cleanly hitting Line 55!
    expect(outOfBoundsResult[0][1]).toBe('');
  });
});
