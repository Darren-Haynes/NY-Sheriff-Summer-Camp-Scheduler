import { Kids } from './kids';
import { Schedule } from './schedule';
import { Activities } from './activities';

export class Camp {
  kids: Kids;
  inputData!: string;
  inputDataArr!: string[];
  waterFirst!: Schedule;
  run!: Schedule;
  allRuns!: Schedule[];
  numOfRuns!: number;
  bestSchedule!: Schedule | null;

  constructor(kids: Kids) {
    this.kids = kids;
    this.allRuns = [];
    this.bestSchedule = null;
  }

  private bestPercentagesSchedule(): Schedule {
    let currBestSchedule = this.allRuns[0];
    for (let i = 0; i < this.allRuns.length; i++) {
      if (this.allRuns[i].waterPercentages[3] < currBestSchedule.waterPercentages[3]) {
        currBestSchedule = this.allRuns[i];
        continue;
      }
      if (
        this.allRuns[i].waterPercentages[3] === currBestSchedule.waterPercentages[3] &&
        this.allRuns[i].landPercentages[3] < currBestSchedule.landPercentages[3]
      ) {
        currBestSchedule = this.allRuns[i];
      }
    }
    return currBestSchedule;
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
    let validResults = true;
    let validCount = 0;
    let invalidCount = 0;
    while (this.allRuns.length < numOfRuns) {
      this.run = new Schedule(this.kids, 'waterFirst');
      const validResult = this.run.runAlgo();
      if (validResult) {
        validCount++;
        console.log('VALID RUN: ', validCount);
        this.allRuns.push(this.run);
      } else {
        invalidCount++;
        console.log('INVALID RUN: ', invalidCount);
      }
      if (invalidCount > numOfRuns) {
        validResults = false;
        break;
      }
    }
    if (!validResults) {
      this.bestSchedule = null;
    } else {
      this.bestSchedule = this.bestPercentagesSchedule();
    }
  }
}
