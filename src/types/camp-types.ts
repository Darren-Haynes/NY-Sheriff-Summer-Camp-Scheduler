export type CampActivities = {
  landActs: Array<string>;
  waterActs: Array<string>;
  land9amActs: Array<string>;
  land10amActs: Array<string>;
  water9am: WaterKids;
  water10am: WaterKids;
  land9am: LandKidsAM;
  land10am: LandKidsPM;
  landRanges: LandRanges;
  waterRanges: WaterRanges;
};

export type LandRanges = {
  bball: Array<number>;
  vball: Array<number>;
  soc: Array<number>;
  arch: Array<number>;
  art: Array<number>;
  hike: Array<number>;
  cheer: Array<number>;
  pball: Array<number>;
  lax: Array<number>;
  fball: Array<number>;
  yoga: Array<number>;
  fris: Array<number>;
};

export type WaterRanges = {
  swim: Array<number>;
  fish: Array<number>;
  canoe: Array<number>;
  snork: Array<number>;
  sail: Array<number>;
  pboard: Array<number>;
  kayak: Array<number>;
};

export type WaterKids = {
  swim: Array<string>;
  fish: Array<string>;
  canoe: Array<string>;
  snork: Array<string>;
  sail: Array<string>;
  pboard: Array<string>;
  kayak: Array<string>;
};

export type LandKidsAM = {
  bball: Array<string>;
  vball: Array<string>;
  soc: Array<string>;
  arch: Array<string>;
  art: Array<string>;
  hike: Array<string>;
  cheer: Array<string>;
};

export type LandKidsPM = {
  pball: Array<string>;
  lax: Array<string>;
  fball: Array<string>;
  yoga: Array<string>;
  fris: Array<string>;
  arch: Array<string>;
  art: Array<string>;
  hike: Array<string>;
};
