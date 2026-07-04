import { Kids } from '../../src/main/kids';

const HEADER =
  ['First', 'Last', 'X', 'Land1', 'Land2', 'Land3', 'Water1', 'Water2', 'Water3'].join('\t') + '\n';

describe('Kids class parsing and counts', () => {
  test('parses names, counts and choices correctly', () => {
    const rows = [
      ['John', 'Doe', '', 'bball', 'art', 'hike', 'canoe', 'swim', 'fish'],
      ['Alice', 'Jones', '', 'fball', 'pball', 'lax', 'swim', 'canoe', 'kayak'],
      ['Bob', 'Smith', '', 'art', 'hike', 'cheer', 'fish', 'pboard', 'swim'],
      ['Eve', 'Stone', '', 'fris', 'art', 'pball', 'kayak', 'pboard', 'swim'],
    ];
    const input = HEADER + rows.map(r => r.join('\t')).join('\n') + '\n';

    const kids = new Kids(input);

    expect(kids.count).toBe(4);
    expect(kids.names).toEqual(['John Doe', 'Alice Jones', 'Bob Smith', 'Eve Stone']);

    expect(kids.choices['John Doe'].land1).toBe('bball');
    expect(kids.choices['John Doe'].water1).toBe('canoe');

    expect(kids.landActivitiesChoiceCount.bball.choice1).toBeGreaterThanOrEqual(1);
    expect(kids.waterActivitiesChoiceCount.swim.total).toBeGreaterThanOrEqual(1);

    expect(kids.duplicateChoice).toBe(false);
  });

  test('detects duplicate choices', () => {
    const rows = [['Dup', 'Kid', '', 'art', 'art', 'hike', 'canoe', 'canoe', 'fish']];
    const input = HEADER + rows.map(r => r.join('\t')).join('\n') + '\n';

    const kids = new Kids(input);
    expect(kids.count).toBe(1);
    expect(kids.duplicateChoice).toBe(true);
  });
});
