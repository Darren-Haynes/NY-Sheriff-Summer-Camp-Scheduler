import { CampActivities } from '../types/camp-types';

export const Activities: CampActivities = Object.freeze({
  // Shortened names of all the land activities offered from both 9am and 10am.
  landActs: [
    'fris',
    'art',
    'hike',
    'pball',
    'bball',
    'cheer',
    'fball',
    'lax',
    'soc',
    'vball',
    'yoga',
    'arch',
  ],

  // Shortened names of all the land activities offered at 9am.
  land9amActs: ['art', 'hike', 'bball', 'cheer', 'soc', 'vball', 'arch'],
  // Shortened names of all the land activities offered at 10am.
  land10amActs: ['fris', 'art', 'hike', 'pball', 'fball', 'lax', 'yoga', 'arch'],
  // Shortened names of all the water activities offered.
  waterActs: ['fish', 'pboard', 'snork', 'canoe', 'kayak', 'sail', 'swim'],

  // To store all the kids scheduled for water activities at 9am.
  water9am: { fish: [], pboard: [], snork: [], canoe: [], kayak: [], sail: [], swim: [] },
  // To store all the kids scheduled for water activities at 10am.
  water10am: { fish: [], pboard: [], snork: [], canoe: [], kayak: [], sail: [], swim: [] },
  // To store all the kids scheduled for land activities at 9am.
  land9am: { art: [], hike: [], bball: [], cheer: [], soc: [], vball: [], arch: [] },
  // To store all the kids scheduled for land activities at 10am.
  land10am: {
    fris: [],
    art: [],
    hike: [],
    pball: [],
    fball: [],
    lax: [],
    yoga: [],
    arch: [],
  },

  /*
   Land activities people ranges and time slots offered.
   // array[0] min of num of people per land activity
   // array[1] max of num of people per land activity
   // array[2] 0 = 9am only, 1 = 10am only, 2 = 9am & 10am activities
*/
  landRanges: {
    fris: [3, 8, 1],
    art: [4, 10, 2],
    hike: [4, 6, 2],
    pball: [4, 12, 1],
    bball: [6, 12, 0],
    cheer: [6, 12, 0],
    fball: [6, 12, 1],
    lax: [6, 12, 1],
    soc: [6, 12, 0],
    vball: [6, 12, 0],
    yoga: [6, 10, 1],
    arch: [8, 16, 2],
  },

  // 80 max kids can be scheduled
  // 40 min can be scheduled if all activities are scheduled
  // 4 min can be scheduled if just one activity is scheduled
  landRanges9am: {
    art: [4, 10, 2],
    hike: [4, 6, 2],
    bball: [6, 12, 0],
    cheer: [6, 12, 0],
    soc: [6, 12, 0],
    vball: [6, 12, 0],
    arch: [8, 16, 2],
  },

  // 86 max kids can be scheduled
  // 41 min can be scheduled if all activities are scheduled
  // 3 min can be scheduled if just one activity is scheduled
  landRanges10am: {
    fris: [3, 8, 1],
    art: [4, 10, 2],
    hike: [4, 6, 2],
    pball: [4, 12, 1],
    fball: [6, 12, 1],
    lax: [6, 12, 1],
    yoga: [6, 10, 1],
    arch: [8, 16, 2],
  },

  /*
  Water activities people ranges and time slots offered.
  // array[0] min of num of people per water activity
  // array[1] max of num of people per water activity
  // array[2] 0 = 9am only, 1 = 10am only, 2 = 9am & 10am activities
  // array[3] Double the minimum num of people per activity
  // array[4] Double the maximum num of people per activity
*/
  waterRanges: {
    // 146 max kids can be scheduled (max 73 per 9am and 73 per 10am)
    // 72 min kids can be scheduled. (min 36 per 9am and 36 per 10am)
    // 4 minumum kids can be scheduled if just one activity scheduled for one time slot
    // 8 minumum kids can be scheduled if just one activity scheduled for one both time slots
    fish: [4, 7, 2, 8, 14],
    pboard: [4, 8, 2, 8, 16],
    snork: [4, 8, 2, 8, 16],
    canoe: [6, 10, 2, 12, 20],
    kayak: [6, 8, 2, 12, 16],
    sail: [6, 16, 2, 12, 32],
    swim: [6, 16, 2, 12, 32],
  },

  waterActivitiesChoiceCount: {
    swim: { total: 0, choice1: 0, choice2: 0, choice3: 0 },
    fish: { total: 0, choice1: 0, choice2: 0, choice3: 0 },
    canoe: { total: 0, choice1: 0, choice2: 0, choice3: 0 },
    snork: { total: 0, choice1: 0, choice2: 0, choice3: 0 },
    sail: { total: 0, choice1: 0, choice2: 0, choice3: 0 },
    pboard: { total: 0, choice1: 0, choice2: 0, choice3: 0 },
    kayak: { total: 0, choice1: 0, choice2: 0, choice3: 0 },
  },

  landActivitiesChoiceCount: {
    bball: { total: 0, choice1: 0, choice2: 0, choice3: 0 },
    vball: { total: 0, choice1: 0, choice2: 0, choice3: 0 },
    soc: { total: 0, choice1: 0, choice2: 0, choice3: 0 },
    arch: { total: 0, choice1: 0, choice2: 0, choice3: 0 },
    art: { total: 0, choice1: 0, choice2: 0, choice3: 0 },
    hike: { total: 0, choice1: 0, choice2: 0, choice3: 0 },
    cheer: { total: 0, choice1: 0, choice2: 0, choice3: 0 },
    pball: { total: 0, choice1: 0, choice2: 0, choice3: 0 },
    lax: { total: 0, choice1: 0, choice2: 0, choice3: 0 },
    fball: { total: 0, choice1: 0, choice2: 0, choice3: 0 },
    yoga: { total: 0, choice1: 0, choice2: 0, choice3: 0 },
    fris: { total: 0, choice1: 0, choice2: 0, choice3: 0 },
  },
});
