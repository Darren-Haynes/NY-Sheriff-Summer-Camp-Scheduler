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
  landRanges9am: LandRanges9am;
  landRanges10am: LandRanges10am;
  waterRanges: WaterRanges;
  waterActivitiesChoiceCount: WaterActivityCounts;
  landActivitiesChoiceCount: LandActivityCounts;
};

type LandRangeType = [number, number, number];

export interface LandRanges {
  [key: string]: LandRangeType;
  art: LandRangeType;
  hike: LandRangeType;
  bball: LandRangeType;
  cheer: LandRangeType;
  soc: LandRangeType;
  vball: LandRangeType;
  arch: LandRangeType;
  pball: LandRangeType;
  lax: LandRangeType;
  fball: LandRangeType;
  yoga: LandRangeType;
  fris: LandRangeType;
}

export interface LandRanges9am {
  [key: string]: LandRangeType;
  art: LandRangeType;
  hike: LandRangeType;
  bball: LandRangeType;
  cheer: LandRangeType;
  soc: LandRangeType;
  vball: LandRangeType;
  arch: LandRangeType;
}

export interface LandRanges10am {
  [key: string]: LandRangeType;
  fris: LandRangeType;
  art: LandRangeType;
  hike: LandRangeType;
  pball: LandRangeType;
  fball: LandRangeType;
  lax: LandRangeType;
  yoga: LandRangeType;
  arch: LandRangeType;
}

type WaterRangeType = [number, number, number, number, number];

export interface WaterRanges {
  [key: string]: WaterRangeType;
  swim: WaterRangeType;
  fish: WaterRangeType;
  canoe: WaterRangeType;
  snork: WaterRangeType;
  sail: WaterRangeType;
  pboard: WaterRangeType;
  kayak: WaterRangeType;
}

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

export type AllLandWaterKids9am10am = {
  swim?: Array<string>;
  fish?: Array<string>;
  canoe?: Array<string>;
  snork?: Array<string>;
  sail?: Array<string>;
  pboard?: Array<string>;
  kayak?: Array<string>;
  art?: Array<string>;
  hike?: Array<string>;
  bball?: Array<string>;
  cheer?: Array<string>;
  soc?: Array<string>;
  vball?: Array<string>;
  arch?: Array<string>;
  fris?: Array<string>;
  pball?: Array<string>;
  fball?: Array<string>;
  lax?: Array<string>;
  yoga?: Array<string>;
};
