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
