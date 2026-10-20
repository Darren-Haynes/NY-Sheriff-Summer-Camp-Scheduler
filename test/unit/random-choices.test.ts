import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { Kids } from '../../src/main/kids';
import { Schedule } from '../../src/main/schedule';
import { randomChoices as utilRandomChoices } from '../../src/main/scheduler-utils';
import { seededRandom } from '../helpers/seeded-random';

/**
 * Fairness tests for the shuffle that decides which kids get a spot when an activity is
 * oversubscribed. Every kid must have the same chance of being picked, regardless of where
 * they appear in the spreadsheet (alphabetical, by sign-up order, etc.).
 *
 * Math.random is replaced with a seeded generator so these statistical tests are fully
 * deterministic: they can't flake, and they fail the same way every time against a biased shuffle.
 */

type Picker = (arr: string[], numOfItems: number) => string[];

const makeSchedule = () => {
  const kids = new Kids([['John', 'Doe', 'bball', 'art', 'hike', 'canoe', 'swim', 'fish']]);
  const schedule = new Schedule(kids, 'waterFirst');
  return (arr: string[], numOfItems: number) => (schedule as any).randomChoices(arr, numOfItems);
};

const names = (count: number) => Array.from({ length: count }, (_, i) => `Kid${String(i).padStart(2, '0')}`);

/** Fraction of trials in which each name was among the picked items. */
const selectionRates = (pick: Picker, count: number, numOfItems: number, trials: number) => {
  const all = names(count);
  const hits = new Map(all.map(name => [name, 0]));
  for (let t = 0; t < trials; t++) {
    // A fresh, identically ordered list every trial, like the same spreadsheet order.
    for (const name of pick([...all], numOfItems)) {
      hits.set(name, (hits.get(name) ?? 0) + 1);
    }
  }
  return all.map(name => (hits.get(name) ?? 0) / trials);
};

const TRIALS = 20000;
// With 20,000 trials the standard error of a fair 50% rate is ~0.35%, so a 3% window is
// ~8 standard errors wide: a fair shuffle never trips it, while the old
// `arr.sort(() => Math.random() - 0.5)` shuffle (up to ~11% off) always does.
const MAX_DEVIATION = 0.03;

describe.each([
  ['Schedule.randomChoices (used by the scheduler)', makeSchedule],
  ['scheduler-utils randomChoices', () => utilRandomChoices as Picker],
])('%s', (_label, createPicker) => {
  let pick: Picker;

  beforeEach(() => {
    vi.spyOn(Math, 'random').mockImplementation(seededRandom(20240607));
    pick = createPicker();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('gives every kid the same chance when choosing half of the list', () => {
    const rates = selectionRates(pick, 20, 10, TRIALS);
    for (const rate of rates) {
      expect(Math.abs(rate - 10 / 20)).toBeLessThan(MAX_DEVIATION);
    }
  });

  test('does not favor kids at the start of a long list (8 spots, 30 kids)', () => {
    const rates = selectionRates(pick, 30, 8, TRIALS);
    for (const rate of rates) {
      expect(Math.abs(rate - 8 / 30)).toBeLessThan(MAX_DEVIATION);
    }
  });

  test('splits a fully-requested list fairly (used to split kids between 9am and 10am)', () => {
    // Asking for at least as many items as the list holds must still shuffle, because the
    // double-activity scheduler slices the result into a 9am group and a 10am group.
    const all = names(10);
    const firstHalfHits = new Map(all.map(name => [name, 0]));
    for (let t = 0; t < TRIALS; t++) {
      const shuffled = pick([...all], 20);
      for (const name of shuffled.slice(0, 5)) {
        firstHalfHits.set(name, (firstHalfHits.get(name) ?? 0) + 1);
      }
    }
    for (const name of all) {
      const rate = (firstHalfHits.get(name) ?? 0) / TRIALS;
      expect(Math.abs(rate - 0.5)).toBeLessThan(MAX_DEVIATION);
    }
  });

  test('returns the requested number of distinct kids taken from the input', () => {
    const all = names(12);
    const picked = pick([...all], 5);
    expect(picked).toHaveLength(5);
    expect(new Set(picked).size).toBe(5);
    for (const name of picked) {
      expect(all).toContain(name);
    }
  });

  test('returns every kid, each exactly once, when asked for more than exist', () => {
    const all = names(6);
    const picked = pick([...all], 50);
    expect([...picked].sort()).toEqual(all);
  });

  test('does not modify the list it was given', () => {
    const all = names(15);
    const input = [...all];
    pick(input, 7);
    expect(input).toEqual(all);
  });
});
