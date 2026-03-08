export type KidsData = Map<
  string,
  {
    choices: KidsChoices;
    timeSlots: {
      land9am: boolean | null;
      nineAM: string | null;
      tenAM: string | null;
    };
  }
>;

type KidsChoices = {
  land1: string;
  land2: string;
  land3: string;
  water1: string;
  water2: string;
  water3: string;
};

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
