import { describe, expect, test, vi } from 'vitest';
import { Kids } from '../../src/main/kids';
import { Camp } from '../../src/main/camp';
import { Schedule } from '../../src/main/schedule';
import { ScheduleChecker } from '../../src/main/schedule-checker';
import { seededRandom } from '../helpers/seeded-random';

const makeChecker = () => {
  const kids = new Kids([['John', 'One', 'bball', 'art', 'hike', 'canoe', 'swim', 'fish']]);
  const schedule = new Schedule(kids, 'waterFirst');
  return { schedule, checker: new ScheduleChecker(schedule) };
};

const names = (count: number) => Array.from({ length: count }, (_, i) => `Kid ${i}`);

describe('ScheduleChecker maximum group size', () => {
  test('an empty schedule is not over-scheduled', () => {
    const { checker } = makeChecker();
    expect(checker.checkOverScheduled()).toBe(true);
  });

  test('an activity filled exactly to its maximum passes', () => {
    const { schedule, checker } = makeChecker();
    schedule.land9am.hike.push(...names(6)); // hike max is 6
    schedule.water9am.fish.push(...names(7)); // fish max per slot is 7
    schedule.water10am.fish.push(...names(7));
    expect(checker.checkOverScheduledByActivityTypeAndTime('land', '9am')).toBe(true);
    expect(checker.checkOverScheduledByActivityTypeAndTime('water', '9am')).toBe(true);
    expect(checker.checkOverScheduledByActivityTypeAndTime('water', '10am')).toBe(true);
    expect(checker.checkOverScheduled()).toBe(true);
  });

  test('a land activity one over its maximum is flagged only for its own slot', () => {
    const { schedule, checker } = makeChecker();
    schedule.land9am.hike.push(...names(7)); // hike max is 6
    expect(checker.checkOverScheduledByActivityTypeAndTime('land', '9am')).toBe(false);
    expect(checker.checkOverScheduledByActivityTypeAndTime('land', '10am')).toBe(true);
    expect(checker.checkOverScheduledByActivityTypeAndTime('water', '9am')).toBe(true);
    expect(checker.checkOverScheduled()).toBe(false);
  });

  test('a land activity over its maximum at 10am is flagged', () => {
    const { schedule, checker } = makeChecker();
    schedule.land10am.fris.push(...names(9)); // fris max is 8
    expect(checker.checkOverScheduledByActivityTypeAndTime('land', '10am')).toBe(false);
    expect(checker.checkOverScheduled()).toBe(false);
  });

  test('a water activity is checked against the per-slot maximum, not the doubled one', () => {
    const { schedule, checker } = makeChecker();
    // fish: per-slot max 7, both-slot max 14. 8 kids in one slot is over.
    schedule.water10am.fish.push(...names(8));
    expect(checker.checkOverScheduledByActivityTypeAndTime('water', '10am')).toBe(false);
    expect(checker.checkOverScheduledByActivityTypeAndTime('water', '9am')).toBe(true);
    expect(checker.checkOverScheduled()).toBe(false);
  });

  test('checkScheduling rejects an otherwise valid schedule when the max-size check fails', () => {
    vi.spyOn(Math, 'random').mockImplementation(seededRandom(7));
    const rows = [
      ['John', 'Doe', 'bball', 'art', 'hike', 'canoe', 'swim', 'fish'],
      ['Alice', 'Jones', 'fball', 'pball', 'lax', 'swim', 'canoe', 'kayak'],
      ['Bob', 'Smith', 'art', 'hike', 'cheer', 'fish', 'pboard', 'swim'],
      ['Eve', 'Stone', 'fris', 'art', 'pball', 'kayak', 'pboard', 'swim'],
      ['Tim', 'Brown', 'bball', 'vball', 'soc', 'canoe', 'kayak', 'swim'],
      ['Zoe', 'Lane', 'arch', 'art', 'hike', 'swim', 'canoe', 'fish'],
    ];
    const camp = new Camp(new Kids(rows));
    camp.scheduleTheKids(1000);
    const best = camp.bestSchedule as any;
    expect(best).toBeDefined();

    // A real, valid schedule passes every check...
    expect(best.checkScheduling()).toBe(true);

    // ...and fails when only the max-size check is made to fail, so it is wired in.
    const spy = vi.spyOn(ScheduleChecker.prototype, 'checkOverScheduled').mockReturnValue(false);
    expect(best.checkScheduling()).toBe(false);
    expect(spy).toHaveBeenCalled();
    vi.restoreAllMocks();
  });
});
