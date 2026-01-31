import { CampActivities } from '../types/camp-types';

export const Activities: CampActivities = Object.freeze({
  // Shortened names of all the land activities offered from both 9am and 10am.
  landActs: [
    'bball',
    'vball',
    'soc',
    'arch',
    'art',
    'hike',
    'cheer',
    'pball',
    'lax',
    'fball',
    'yoga',
    'fris',
  ],

  // Shortened names of all the land activities offered at 9am.
  land9amActs: ['bball', 'vball', 'soc', 'arch', 'art', 'hike', 'cheer'],
  // Shortened names of all the land activities offered at 10am.
  land10amActs: ['pball', 'lax', 'fball', 'yoga', 'fris', 'arch', 'art', 'hike'],
  // Shortened names of all the water activities offered.
  waterActs: ['swim', 'fish', 'canoe', 'snork', 'sail', 'pboard', 'kayak'],

  // To store all the kids scheduled for water activities at 9am.
  water9am: { swim: [], fish: [], canoe: [], snork: [], sail: [], pboard: [], kayak: [] },
  // To store all the kids scheduled for water activities at 10am.
  water10am: { swim: [], fish: [], canoe: [], snork: [], sail: [], pboard: [], kayak: [] },
  // To store all the kids scheduled for land activities at 9am.
  land9am: { bball: [], vball: [], soc: [], arch: [], art: [], hike: [], cheer: [] },
  // To store all the kids scheduled for land activities at 10am.
  land10am: {
    pball: [],
    lax: [],
    fball: [],
    yoga: [],
    fris: [],
    arch: [],
    art: [],
    hike: [],
    cheer: [],
  },

  /*
   Land activities people ranges and time slots offered.
   // array[0] min of num of people per land activity
   // array[1] max of num of people per land activity
   // array[2] 0 = 9am only, 1 = 10am only, 2 = 9am & 10am activities
*/
  landRanges: {
    bball: [6, 12, 0],
    vball: [6, 12, 0],
    soc: [6, 12, 0],
    cheer: [6, 12, 0],
    pball: [4, 12, 1],
    lax: [6, 12, 1],
    fball: [6, 12, 1],
    yoga: [6, 10, 1],
    fris: [3, 8, 1],
    arch: [8, 16, 2],
    art: [4, 10, 2],
    hike: [4, 6, 2],
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
    swim: [6, 16, 2, 12, 32],
    fish: [4, 7, 2, 8, 14],
    canoe: [6, 10, 2, 12, 20],
    snork: [4, 8, 2, 8, 16],
    sail: [6, 16, 2, 12, 32],
    pboard: [4, 8, 2, 8, 16],
    kayak: [6, 8, 2, 12, 16],
  },
});
