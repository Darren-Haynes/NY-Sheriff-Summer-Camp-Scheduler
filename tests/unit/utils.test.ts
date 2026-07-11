import { describe, expect, test, vi } from 'vitest';
import {
  randomChoices,
  removeElementsFromArrayInPlace,
  removeDupChoicesInPlace,
  hasKey,
  getKidsChoice,
} from '../../src/main/scheduler-utils';

describe('scheduler-utils', () => {
  test('randomChoices returns requested count from array and elements are from input', () => {
    // Make randomness deterministic for the run
    const rnd = vi.spyOn(Math, 'random').mockReturnValue(0.1);

    const arr = ['a', 'b', 'c', 'd', 'e'];
    const chosen = randomChoices(arr, 2);
    expect(chosen.length).toBe(2);
    // all returned elements should exist in original array
    for (const item of chosen) {
      expect(arr).toContain(item);
    }

    // Request >= length returns full copy
    const all = randomChoices(arr, arr.length + 5);
    expect(all).toEqual(arr);

    rnd.mockRestore();
  });

  test('removeElementsFromArrayInPlace mutates array and removes elements', () => {
    const arr = ['a', 'b', 'c', 'd', 'e'];
    removeElementsFromArrayInPlace(arr, ['b', 'e']);
    expect(arr).toEqual(['a', 'c', 'd']);

    // Removing non-existing element does nothing
    removeElementsFromArrayInPlace(arr, ['x']);
    expect(arr).toEqual(['a', 'c', 'd']);
  });

  test('removeDupChoicesInPlace removes duplicates between first/second/third', () => {
    const first = ['A', 'B', 'C'];
    const second = ['C', 'D', 'A', 'E'];
    const third = ['A', 'D', 'F', 'C'];

    removeDupChoicesInPlace(first, second, third);

    // After removing, second should no longer contain A or C
    expect(second).not.toContain('A');
    expect(second).not.toContain('C');

    // Third should not contain any names from first or second (after second mutated)
    for (const n of first) {
      expect(third).not.toContain(n);
    }
    for (const n of second) {
      expect(third).not.toContain(n);
    }
  });

  test('hasKey works as a type guard', () => {
    const obj = { a: 1, b: 'x' };
    expect(hasKey(obj, 'a')).toBe(true);
    expect(hasKey(obj, 'z')).toBe(false);
  });

  test('getKidsChoice returns expected string form', () => {
    expect(getKidsChoice('land', 1)).toBe('land1');
    expect(getKidsChoice('land', 2)).toBe('land2');
    expect(getKidsChoice('land', 3)).toBe('land3');
    expect(getKidsChoice('water', 1)).toBe('water1');
    expect(getKidsChoice('water', 2)).toBe('water2');
    expect(getKidsChoice('water', 3)).toBe('water3');
  });
});
