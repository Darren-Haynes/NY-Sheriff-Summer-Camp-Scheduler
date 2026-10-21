import { describe, expect, test } from 'vitest';
import { Camp } from '../../src/main/camp';
import { Kids } from '../../src/main/kids';
import { Schedule } from '../../src/main/schedule';

type Percentages = [number, number, number, number];

// Only the fields bestPercentagesSchedule() reads are needed, so we use light
// stand-ins instead of running the (slow, random) scheduling algorithm.
function fakeRun(id: string, water: Percentages, land: Percentages): Schedule {
  return { id, waterPercentages: water, landPercentages: land } as unknown as Schedule;
}

function pickBest(runs: Schedule[]): Schedule {
  const camp = new Camp({} as Kids);
  camp.allRuns = runs;
  return (camp as unknown as { bestPercentagesSchedule: () => Schedule }).bestPercentagesSchedule();
}

describe('Camp.bestPercentagesSchedule', () => {
  test('prefers the lowest combined water + land no-choice percentage', () => {
    // A has a perfect water score but a terrible land score. B is better overall.
    const a = fakeRun('A', [90, 10, 0, 0], [60, 20, 10, 10]);
    const b = fakeRun('B', [80, 10, 9, 1], [90, 5, 5, 0]);

    expect(pickBest([a, b])).toBe(b);
    expect(pickBest([b, a])).toBe(b);
  });

  test('can pick a run that is best on land even if another run is better on water', () => {
    const waterSpecialist = fakeRun('W', [95, 5, 0, 0], [50, 20, 10, 20]);
    const landSpecialist = fakeRun('L', [80, 10, 5, 5], [95, 5, 0, 0]);

    expect(pickBest([waterSpecialist, landSpecialist])).toBe(landSpecialist);
  });

  test('breaks a combined no-choice tie using the higher combined first-choice percentage', () => {
    const fewerFirstChoices = fakeRun('few', [60, 30, 8, 2], [60, 30, 8, 2]);
    const moreFirstChoices = fakeRun('more', [80, 10, 8, 2], [70, 20, 8, 2]);

    expect(pickBest([fewerFirstChoices, moreFirstChoices])).toBe(moreFirstChoices);
    expect(pickBest([moreFirstChoices, fewerFirstChoices])).toBe(moreFirstChoices);
  });

  test('keeps the earliest run when everything ties', () => {
    const first = fakeRun('first', [70, 20, 8, 2], [70, 20, 8, 2]);
    const second = fakeRun('second', [70, 20, 8, 2], [70, 20, 8, 2]);

    expect(pickBest([first, second])).toBe(first);
  });

  test('returns the only run when there is just one', () => {
    const only = fakeRun('only', [70, 20, 8, 2], [70, 20, 8, 2]);

    expect(pickBest([only])).toBe(only);
  });
});
