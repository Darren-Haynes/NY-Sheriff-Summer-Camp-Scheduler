import { WaterActivityCounts, LandActivityCounts } from '../types/kids-types';

export type CampActivities = {
  landActs: Array<string>;
  waterActs: Array<string>;
  land9amActs: Array<string>;
  land10amActs: Array<string>;
  water9am: WaterKids;
  water10am: WaterKids;
  land9am: LandKids9am;
  land10am: LandKids10am;
  landRanges: LandRanges;
  landRanges9am: LandRanges;
  landRanges10am: LandRanges;
  waterRanges: WaterRanges;
  waterActivitiesChoiceCount: WaterActivityCounts;
  landActivitiesChoiceCount: LandActivityCounts;
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

export type LandRanges9am = {
  art: Array<number>;
  hike: Array<number>;
  bball: Array<number>;
  cheer: Array<number>;
  soc: Array<number>;
  vball: Array<number>;
  arch: Array<number>;
};

export type LandRanges10am = {
  fris: Array<number>;
  art: Array<number>;
  hike: Array<number>;
  pball: Array<number>;
  fball: Array<number>;
  lax: Array<number>;
  yoga: Array<number>;
  arch: Array<number>;
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

export type LandKids9am = {
  art: Array<string>;
  hike: Array<string>;
  bball: Array<string>;
  cheer: Array<string>;
  soc: Array<string>;
  vball: Array<string>;
  arch: Array<string>;
};

export type LandKids10am = {
  fris: Array<string>;
  art: Array<string>;
  hike: Array<string>;
  pball: Array<string>;
  fball: Array<string>;
  lax: Array<string>;
  yoga: Array<string>;
  arch: Array<string>;
};
