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
  land1: string;
  land2: string;
  land3: string;
  water1: string;
  water2: string;
  water3: string;
}

interface ActivityCounts {
  total: number;
  choice1: number;
  choice2: number;
  choice3: number;
}

export interface WaterActivityCounts {
  [key: string]: ActivityCounts;
  swim: ActivityCounts;
  fish: ActivityCounts;
  canoe: ActivityCounts;
  snork: ActivityCounts;
  sail: ActivityCounts;
  pboard: ActivityCounts;
  kayak: ActivityCounts;
}

export interface LandActivityCounts {
  [key: string]: ActivityCounts;
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
