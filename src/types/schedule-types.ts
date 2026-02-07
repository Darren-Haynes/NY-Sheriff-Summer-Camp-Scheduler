export interface ActivityArgs {
  activityType?: string;
  numOfChoices?: number;
  isMax?: boolean;
}

export interface NotScheduled {
  names: string[];
  landActivities: string[];
  waterActivities: string[];
}

type WaterActivities = 'swim' | 'fish' | 'canoe' | 'snork' | 'sail' | 'pboard' | 'kayak';
// TODO: uncomment the 2 line below to try and increase type safety
// type Land9amActivities = 'bball' | 'vball' | 'soc' | 'arch' | 'art' | 'hike' | 'cheer';
// type Land10amActivities = 'pball' | 'lax' | 'fball' | 'yoga' | 'fris' | 'arch' | 'art' | 'hike';

type LandActivities =
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

export type LandKids = Record<LandActivities, string[]>;
export type WaterKids = Record<WaterActivities, string[]>;

const AllowedTimes = ['9am', '10am'] as const;
export type AllowedTimes = (typeof AllowedTimes)[number];

const AllowedActivityTypes = ['land', 'water'] as const;
export type AllowedActivityTypes = (typeof AllowedActivityTypes)[number];

const AllowedChoices = [[1], [2], [3], [1, 2], [1, 2], [1, 3], [1, 2, 3]] as const;
export type AllowedChoices = (typeof AllowedChoices)[number];

const AllowedMaxMin = ['max', 'min'] as const;
export type AllowedMaxMin = (typeof AllowedMaxMin)[number];

const AllowedDoubleSingle = ['double', 'single'] as const;
export type AllowedDoubleSingle = (typeof AllowedDoubleSingle)[number];
