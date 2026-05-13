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

export type LandKids = Record<LandActivities, string[]>;
export type WaterKids = Record<WaterActivities, string[]>;

export interface ScheduledActivities {
  water9am: WaterKids;
  water10am: WaterKids;
  land9am: LandKids;
  land10am: LandKids;
}

const AllowedTimes = ['9am', '10am', 'both'] as const;
export type AllowedTimes = (typeof AllowedTimes)[number];

const Allowed9and10Only = ['9am', '10am'] as const;
export type Allowed9and10Only = (typeof AllowedTimes)[number];

const AllowedActivityTypes = ['land', 'water'] as const;
export type AllowedActivityTypes = (typeof AllowedActivityTypes)[number];

const WaterOnly = 'water' as const;
export type WaterOnly = (typeof WaterOnly)[number];

const AllowedChoices = [[1], [2], [3], [1, 2], [1, 2], [1, 3], [1, 2, 3]] as const;
export type AllowedChoices = (typeof AllowedChoices)[number];

const AllowedMaxMin = ['max', 'min'] as const;
export type AllowedMaxMin = (typeof AllowedMaxMin)[number];

const AllowedMaxMinSched = ['maxOnly', 'minOnly', 'bothMinAndMax'] as const;
export type AllowedMaxMinSched = (typeof AllowedMaxMinSched)[number];

const AllowedDoubleSingle = ['double', 'single'] as const;
export type AllowedDoubleSingle = (typeof AllowedDoubleSingle)[number];

const AllowedChoiceNums = [1, 2, 3] as const;
export type AllowedChoiceNums = (typeof AllowedChoiceNums)[number];

const AllowedActivities = ['swim', 'fish', 'canoe', 'snork', 'sail', 'pboard', 'kayak'] as const;
export type AllowedActivities = (typeof AllowedActivities)[number];

const AllowedActivityTimes = ['land9am', 'land10am', 'water9am', 'water10am'] as const;
export type AllowedActivityTimes = (typeof AllowedActivityTimes)[number];
