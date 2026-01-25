import { Kids } from './kids';
import { Activities } from './activities';
import { ActivityArgs } from '../types/schedule-types';

/**
Main class that schedules the kids to activities.
*/
export class Schedule {
  inputData: string;
  kids: Kids;
  notScheduled: Array<string>;

  constructor(inputData: string) {
    this.inputData = inputData;
    this.kids = new Kids(this.inputData);
    this.notScheduled = this.kids.names;
  }

  private activityTemplate(): Map<string, number> {
    const choicesCount = new Map<string, number>();
    Activities.waterActs.forEach(activity => {
      choicesCount.set(activity, 0);
    });
    return choicesCount;
  }

  private countActivityChoices({
    activityType = 'land',
    numOfChoices = 1,
  }: ActivityArgs): Map<string, number> {
    if (typeof numOfChoices === 'number' && numOfChoices % 1 !== 0) {
      throw new Error('Only an integers with range of 1 to 3 permitted');
    }
    if (numOfChoices > 3 || numOfChoices < 1) {
      throw new Error(`${numOfChoices} is outside the allowed range 1 to 3.`);
    }

    if (!['land', 'water'].includes(activityType)) {
      throw new Error("'land' and 'water' are the only acccepted keyword arguments");
    }

    let kidsChoices: string[] = ['land1', 'land2', 'land3'];
    if (activityType === 'water') {
      kidsChoices = ['water1', 'water2', 'water3'];
    }

    const activitiesChoicesCount = this.activityTemplate();
    for (let i = 0; i < numOfChoices; i++) {
      this.notScheduled.forEach(kid => {
        const kidsData = this.kids.data.get(kid);
        const activity = kidsData.choices[kidsChoices[i]].toLowerCase();
        const currentActivityCount = activitiesChoicesCount.get(activity);
        const newActivityCount = currentActivityCount + 1;
        activitiesChoicesCount.set(activity, newActivityCount);
      });
    }
    return activitiesChoicesCount;
  }

  getDoubleMax(): string[] {
    const countedChoices = this.countActivityChoices({ activityType: 'water' });
    console.log(countedChoices);
    const aboveDoubleMax: string[] = [];
    for (const [activity, range] of Object.entries(Activities.waterRanges)) {
      if (countedChoices.get(activity) > range[4]) {
        aboveDoubleMax.push(activity);
      }
    }
    return aboveDoubleMax;
  }
}
