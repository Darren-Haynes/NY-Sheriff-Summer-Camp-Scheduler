// Shortened names of all the land activities offered.
export const landActs: string[] = [
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
];

// Shortened names of all the water activities offered.
export const waterActs: string[] = ['swim', 'fish', 'canoe', 'snork', 'sail', 'pboard', 'kayak'];

/*
   Land activities people ranges and time slots offered.
   // tuple[0] min of num of people per land activity
   // tuple[1] max of num of people per land activity
   // tuple[2] 0 = 9am only, 1 = 10am only, 2 = 9am & 10am activities
*/

export const landRanges = {
  bball: [6, 12, 0],
  vball: [6, 12, 0],
  soc: [6, 12, 0],
  arch: [8, 16, 2],
  art: [4, 10, 2],
  hike: [4, 6, 2],
  cheer: [6, 12, 0],
  pball: [4, 12, 1],
  lax: [6, 12, 1],
  fball: [6, 12, 1],
  yoga: [6, 10, 1],
  fris: [3, 8, 1],
};

/*
  Water activities people ranges and time slots offered.
  // tuple[0] min of num of people per water activity
  // tuple[1] max of num of people per water activity
  // tuple[2] 0 = 9am only, 1 = 10am only, 2 = 9am & 10am activities
*/
export const waterRanges = {
  swim: [6, 16, 2],
  fish: [4, 7, 2],
  canoe: [6, 10, 2],
  snork: [4, 8, 2],
  sail: [6, 16, 2],
  pboard: [4, 8, 2],
  kayak: [6, 8, 2],
};
