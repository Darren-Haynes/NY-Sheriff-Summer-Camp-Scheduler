import { Kids } from './kids';
import { Schedule } from './schedule';
import { Activities } from './activities';

export class Camp {
  kids: Kids;
  inputData: string;
  inputDataArr: string[];
  waterFirst: Schedule;
  run: Schedule;
  allRuns: Schedule[];
  numOfRuns: number;
  bestSchedule: Schedule | null;

  constructor(kids: Kids) {
    this.kids = kids;
    this.allRuns = [];
    this.bestSchedule = null;
  }

  /**
   * The schedule can be ran 1 to 100 times. Since there is randomness in the scheduling algorithm,
   * multiple runs are necessary to find the best schedule. Best meaning the schedule that gives
   * the most kids one of their 3 scheduled choice for water and land activities.
   * @param {numOfRuns} number - number of times to run the scheduling algorithm
   * @returns {void}
   */
  public scheduleTheKids(numOfRuns: number): void {
    if (numOfRuns < 1 || numOfRuns > 100) {
      throw new RangeError('Value must be between 1 and 100');
    }
    while (this.allRuns.length < numOfRuns) {
      this.run = new Schedule(this.kids, 'waterFirst');
      this.run.runAlgo();
      this.allRuns.push(this.run);
    }
    for (let i = 0; i < this.allRuns.length; i++) {
      console.log('Water Percentage', this.allRuns[i].waterPercentages);
      console.log('Land Percentage', this.allRuns[i].landPercentages);
    }
    this.bestSchedule = this.allRuns[0];
  }
}
