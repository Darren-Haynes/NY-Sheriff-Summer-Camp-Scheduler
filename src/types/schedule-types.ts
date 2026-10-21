import { Int } from "./num-types";

export interface ActivityArgs {
  activityType?: string;
  numOfChoices?: number;
  isMax?: boolean;
}

export interface NotScheduledLand {
  names: string[];
  landActivities: string[];
}

export interface NotScheduledWater {
  names: string[];
  waterActivities: WaterActivities[];
}

export interface ScheduledWater {
  names: string[];
  waterActivities: WaterActivities[];
}

export interface ScheduledLand9am {
  names: string[];
  landActivities: LandActivities9am[];
}

export interface ScheduledLand10am {
  names: string[];
  landActivities: LandActivities10am[];
}

export interface NotScheduledActivities {
  activity: AllActivities;
  shortFall: number;
  timeSlot: AllowedTimes;
}

export interface LandCount9am {
  [key: string]: number;
  art: number;
  hike: number;
  bball: number;
  cheer: number;
  soc: number;
  vball: number;
  arch: number;
}

export interface LandCount10am {
  [key: string]: number;
  fris: number;
  art: number;
  hike: number;
  pball: number;
  fball: number;
  lax: number;
  yoga: number;
  arch: number;
}

export interface RescheduleMatches {
  reScheduleKid: string;
  fromActivity: AllActivities;
  toActivity: AllActivities;
}

export interface RescheduleKidsData {
  name: string;
  activity: AllActivities;
  activityType: AllowedActivityTypes;
  timeSlot: AllowedTimes;
}

export type ActivityKidsMap = {
  [key: string]: string[];
};

export type WaterActivities = 'swim' | 'fish' | 'canoe' | 'snork' | 'sail' | 'pboard' | 'kayak';
// TODO: uncomment the 2 line below to try and increase type safety
// type Land9amActivities = 'bball' | 'vball' | 'soc' | 'arch' | 'art' | 'hike' | 'cheer';
// type Land10amActivities = 'pball' | 'lax' | 'fball' | 'yoga' | 'fris' | 'arch' | 'art' | 'hike';

export type LandActivities =
  | 'bball'
  | 'vball'
  | 'soc'
  | 'arch'
  | 'art'
  | 'hike'
  | 'cheer'
  | 'pball'
  | 'lax'
  | 'fball'
  | 'yoga'
  | 'fris';

export type LandActivities9am = 'art' | 'hike' | 'bball' | 'cheer' | 'soc' | 'vball' | 'arch';
export type LandActivities10am =
  | 'fris'
  | 'art'
  | 'hike'
  | 'pball'
  | 'fball'
  | 'lax'
  | 'yoga'
  | 'arch';

export type AllActivities = LandActivities | WaterActivities;

export type LandKids9am = Record<LandActivities9am, string[]> | null;
export type LandKids10am = Record<LandActivities10am, string[]> | null;
export type WaterKids = Record<WaterActivities, string[]> | null;

export interface ScheduledActivities {
  water9am: WaterKids;
  water10am: WaterKids;
  land9am: LandKids9am;
  land10am: LandKids10am;
}

export type ActivityPercentages = [Int, Int, Int, Int]

export const AllowedTimes = ['9am', '10am', 'both'] as const;
export type AllowedTimes = (typeof AllowedTimes)[number];

export const Allowed9and10Only = ['9am', '10am'] as const;
// TODO: this is intentionally as wide as AllowedTimes. Water scheduling passes 'both' through helpers
// typed with this alias, and they work only because they ignore the slot on that path. Narrowing it
// to '9am' | '10am' (typeof Allowed9and10Only) needs those helpers reworked first.
export type Allowed9and10Only = (typeof AllowedTimes)[number];

export const AllowedActivityTypes = ['land', 'water'] as const;
export type AllowedActivityTypes = (typeof AllowedActivityTypes)[number];

export const WaterOnly = 'water' as const;
export type WaterOnly = typeof WaterOnly;

export const AllowedChoices = [[1], [2], [3], [1, 2], [1, 2], [1, 3], [1, 2, 3]] as const;
export type AllowedChoices = (typeof AllowedChoices)[number];

export const AllowedMaxMin = ['max', 'min'] as const;
export type AllowedMaxMin = (typeof AllowedMaxMin)[number];

export const AllowedMaxMinSched = ['maxOnly', 'minOnly', 'bothMinAndMax'] as const;
export type AllowedMaxMinSched = (typeof AllowedMaxMinSched)[number];

export const AllowedDoubleSingle = ['double', 'single'] as const;
export type AllowedDoubleSingle = (typeof AllowedDoubleSingle)[number];

export type AllowedChoiceNums = 1 | 2 | 3;

export const AllowedActivities = ['swim', 'fish', 'canoe', 'snork', 'sail', 'pboard', 'kayak'] as const;
export type AllowedActivities = (typeof AllowedActivities)[number];

export const AllowedActivityTimes = ['land9am', 'land10am', 'water9am', 'water10am'] as const;
export type AllowedActivityTimes = (typeof AllowedActivityTimes)[number];
