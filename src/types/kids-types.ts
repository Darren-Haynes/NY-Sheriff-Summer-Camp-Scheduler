import { LandActivities, WaterActivities } from './schedule-types';

export type KidsData = Map<
  string,
  {
    timeSlots: {
      land9am: LandActivities | null;
      land10am: LandActivities | null;
      water9am: WaterActivities | null;
      water10am: WaterActivities | null;
    };
  }
>;

export interface KidsChoices {
  [key: string]: string;
  art: string;
  hike: string;
  bball: string;
  cheer: string;
  soc: string;
  vball: string;
  arch: string;
  pball: string;
  lax: string;
  fball: string;
  yoga: string;
  fris: string;
}

interface ActivityCounts {
  total: number;
  choice1: number;
  choice2: number;
  choice3: number;
}

export interface WaterActivityCounts {
  swim: ActivityCounts;
  fish: ActivityCounts;
  canoe: ActivityCounts;
  snork: ActivityCounts;
  sail: ActivityCounts;
  pboard: ActivityCounts;
  kayak: ActivityCounts;
}

export interface LandActivityCounts {
  bball: ActivityCounts;
  vball: ActivityCounts;
  soc: ActivityCounts;
  arch: ActivityCounts;
  art: ActivityCounts;
  hike: ActivityCounts;
  cheer: ActivityCounts;
  pball: ActivityCounts;
  lax: ActivityCounts;
  fball: ActivityCounts;
  yoga: ActivityCounts;
  fris: ActivityCounts;
}
