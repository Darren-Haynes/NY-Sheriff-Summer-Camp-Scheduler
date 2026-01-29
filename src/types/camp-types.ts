export type CampActivities = {
  landActs: Array<string>;
  waterActs: Array<string>;
  water9am: WaterKids;
  water10am: WaterKids;
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
