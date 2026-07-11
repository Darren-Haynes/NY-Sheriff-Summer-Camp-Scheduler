import { describe, expect, test, vi, beforeAll, afterAll } from 'vitest';
import { Kids } from '../../src/main/kids';
import { Schedule } from '../../src/main/schedule';

const HEADER =
  ['First', 'Last', 'X', 'Land1', 'Land2', 'Land3', 'Water1', 'Water2', 'Water3'].join('\t') + '\n';

describe('Schedule mutator basics', () => {
  beforeAll(() => {
    // Keep randomness deterministic if any helper uses it
    vi.spyOn(Math, 'random').mockReturnValue(0.1);
    // Silence console output from Schedule internals
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  test('setKidsTimeSlot updates schedule map', () => {
    const rows = [['John', 'Doe', '', 'bball', 'art', 'hike', 'canoe', 'swim', 'fish']];
    const input = HEADER + rows.map(r => r.join('\t')).join('\n') + '\n';
    const kids = new Kids(input);
    const scheduler = new Schedule(kids, 'waterFirst');

    // Precondition: null time slot
    const before = scheduler.schedule.get('John Doe');
    expect(before).toBeDefined();
    expect(before!.timeSlots.water9am).toBeNull();

    // Call private method via any cast
    (scheduler as any).setKidsTimeSlot(['John Doe'], 'canoe', 'water9am');

    const after = scheduler.schedule.get('John Doe');
    expect(after).toBeDefined();
    expect(after!.timeSlots.water9am).toBe('canoe');

    // Also verify that setting multiple names works (idempotent in this small case)
    (scheduler as any).setKidsTimeSlot(['John Doe'], null, 'water9am');
    const reverted = scheduler.schedule.get('John Doe');
    expect(reverted!.timeSlots.water9am).toBeNull();
  });

  test('addKidToActivity and removeKidFromActivity update activity pools', () => {
    const rows = [['Alice', 'Smith', '', 'fris', 'art', 'hike', 'swim', 'canoe', 'fish']];
    const input = HEADER + rows.map(r => r.join('\t')).join('\n') + '\n';
    const kids = new Kids(input);
    const scheduler = new Schedule(kids, 'waterFirst');

    // Ensure activity pool exists and is empty initially
    // @ts-ignore runtime access
    expect(Array.isArray(scheduler.water9am.canoe)).toBe(true);
    // add
    (scheduler as any).addKidToActivity('Alice Smith', 'canoe', 'water', '9am');
    // verify in pool
    // @ts-ignore
    expect(scheduler.water9am.canoe).toContain('Alice Smith');

    // remove
    (scheduler as any).removeKidFromActivity('Alice Smith', 'canoe', 'water', '9am');
    // @ts-ignore
    expect(scheduler.water9am.canoe).not.toContain('Alice Smith');

    // Also verify scheduled lists are unaffected by addKidToActivity/removeKidFromActivity (they only mutate pools)
    // @ts-ignore
    expect(scheduler.scheduled9amWater.names.includes('Alice Smith')).toBe(false);
  });

  test('addKidToNotScheduled and scheduleKid / unScheduleKid perform full lifecycle', () => {
    const rows = [['Tim', 'Lee', '', 'bball', 'vball', 'soc', 'canoe', 'kayak', 'swim']];
    const input = HEADER + rows.map(r => r.join('\t')).join('\n') + '\n';
    const kids = new Kids(input);
    const scheduler = new Schedule(kids, 'waterFirst');

    // Ensure Tim is initially represented in the schedule map
    expect(scheduler.schedule.has('Tim Lee')).toBe(true);

    // Add Tim explicitly to not scheduled lists for water 9am (simulate unscheduled)
    (scheduler as any).addKidToNotScheduled('Tim Lee', 'water', '9am');

    // Confirm Tim is in notScheduled9amWater.names and in overall notScheduledAllNamesWater
    // @ts-ignore
    expect(scheduler.notScheduled9amWater.names).toContain('Tim Lee');
    // @ts-ignore
    expect(scheduler.notScheduledAllNamesWater).toContain('Tim Lee');

    // Schedule Tim to canoe at 9am using scheduleKid (wrapper)
    (scheduler as any).scheduleKid('Tim Lee', 'canoe', 'water', '9am');

    // After scheduling: Tim should not be in notScheduled9amWater.names, should be in water9am pool and scheduled9amWater names
    // @ts-ignore
    expect(scheduler.notScheduled9amWater.names.includes('Tim Lee')).toBe(false);
    // @ts-ignore
    expect(scheduler.water9am.canoe).toContain('Tim Lee');
    // scheduled metadata
    // @ts-ignore
    expect(scheduler.scheduled9amWater.names).toContain('Tim Lee');

    // schedule map updated
    const timeSlots = scheduler.schedule.get('Tim Lee');
    expect(timeSlots).toBeDefined();
    expect(timeSlots!.timeSlots.water9am).toBe('canoe');

    // Also ensure notScheduledAllNamesWater no longer contains Tim
    // @ts-ignore
    expect(scheduler.notScheduledAllNamesWater.includes('Tim Lee')).toBe(false);

    // Now unschedule Tim
    (scheduler as any).unScheduleKid('Tim Lee', 'canoe', 'water', '9am');

    // After unscheduling: schedule map should be null for water9am, notScheduled lists should include Tim, and activity pool should not include him
    const after = scheduler.schedule.get('Tim Lee');
    expect(after).toBeDefined();
    expect(after!.timeSlots.water9am).toBeNull();
    // @ts-ignore
    expect(scheduler.notScheduled9amWater.names).toContain('Tim Lee');
    // @ts-ignore
    expect(scheduler.notScheduledAllNamesWater).toContain('Tim Lee');
    // @ts-ignore
    expect(scheduler.water9am.canoe).not.toContain('Tim Lee');
    // scheduled list should no longer include Tim
    // @ts-ignore
    expect(scheduler.scheduled9amWater.names).not.toContain('Tim Lee');
  });

  test('removeKidFromScheduled helper removes name from scheduled list', () => {
    const rows = [
      ['Sam', 'Cole', '', 'art', 'hike', 'bball', 'swim', 'canoe', 'fish'],
      ['Ria', 'Lopez', '', 'art', 'hike', 'bball', 'swim', 'canoe', 'fish'],
    ];
    const input = HEADER + rows.map(r => r.join('\t')).join('\n') + '\n';
    const kids = new Kids(input);
    const scheduler = new Schedule(kids, 'waterFirst');

    // Schedule Sam and Ria manually to the same activity pool for test
    (scheduler as any).addKidToActivity('Sam Cole', 'swim', 'water', '9am');
    (scheduler as any).addKidToActivity('Ria Lopez', 'swim', 'water', '9am');
    // Also add to scheduled9amWater names to mirror full scheduling flow
    // @ts-ignore
    scheduler.scheduled9amWater.names.push('Sam Cole', 'Ria Lopez');

    // Ensure they're present
    // @ts-ignore
    expect(scheduler.scheduled9amWater.names).toContain('Sam Cole');
    // Now remove Sam via removeKidFromScheduled
    (scheduler as any).removeKidFromScheduled('Sam Cole', 'water', '9am');

    // Sam should no longer be in scheduled9amWater.names
    // @ts-ignore
    expect(scheduler.scheduled9amWater.names).not.toContain('Sam Cole');

    // The pool should still have Ria
    // @ts-ignore
    expect(scheduler.water9am.swim).toContain('Ria Lopez');
  });
});
