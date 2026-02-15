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

  /*
  Water activities people ranges and time slots offered.
  // array[0] min of num of people per water activity
  // array[1] max of num of people per water activity
  // array[2] 0 = 9am only, 1 = 10am only, 2 = 9am & 10am activities
  // array[3] Double the minimum num of people per activity
  // array[4] Double the maximum num of people per activity
*/
  waterRanges: {
    fish: [4, 7, 2, 8, 14],
    pboard: [4, 8, 2, 8, 16],
    snork: [4, 8, 2, 8, 16],
    canoe: [6, 10, 2, 12, 20],
    kayak: [6, 8, 2, 12, 16],
    sail: [6, 16, 2, 12, 32],
    swim: [6, 16, 2, 12, 32],
  },
});
