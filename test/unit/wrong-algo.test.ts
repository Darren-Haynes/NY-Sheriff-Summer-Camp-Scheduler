import { describe,expect, test } from 'vitest';
import { Kids } from '../../src/main/kids';
import { Schedule } from '../../src/main/schedule';

describe('Incorrect algo', () => {
  test('pass incorrect algo to scheduler', () => {
    const input = [['John', 'Doe', 'bball', 'art', 'hike', 'canoe', 'swim', 'fish']];
    const kids = new Kids(input);
    const incorrectAlgo = 'badName'
    expect(() => new Schedule(kids, incorrectAlgo)).toThrow();
  });
});
