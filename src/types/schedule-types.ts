export interface ActivityArgs {
  activityType?: string;
  numOfChoices?: number;
}

type WaterSports = 'swim' | 'fish' | 'canoe' | 'snork' | 'sail' | 'pboard' | 'kayak';
export type WaterKids = Record<WaterSports, string[]>;
