export type CampActivities = {
  waterActs: Array<string>;
  landRanges: LandRanges;
  waterRanges: WaterRanges;
  landActs: Array<string>;
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
