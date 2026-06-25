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

  /**
   * Find the schedule that has scheduled kids with the least amount of no choices.
   * @returns {Schedule}
   */
  private bestPercentagesSchedule(): Schedule {
    let currBestWaterSchedule = this.allRuns[0];
    let currBestLandSchedule = this.allRuns[0];

    for (let i = 0; i < this.allRuns.length; i++) {
      if (this.allRuns[i].waterPercentages[3] < currBestWaterSchedule.waterPercentages[3]) {
        currBestWaterSchedule = this.allRuns[i];
        continue;
      }
      if (
        this.allRuns[i].waterPercentages[3] === currBestWaterSchedule.waterPercentages[3] &&
        this.allRuns[i].landPercentages[3] < currBestWaterSchedule.landPercentages[3]
      ) {
        currBestWaterSchedule = this.allRuns[i];
      }
    }

    for (let i = 0; i < this.allRuns.length; i++) {
      if (this.allRuns[i].landPercentages[3] < currBestLandSchedule.landPercentages[3]) {
        currBestLandSchedule = this.allRuns[i];
        continue;
      }
      if (
        this.allRuns[i].landPercentages[3] === currBestLandSchedule.landPercentages[3] &&
        this.allRuns[i].waterPercentages[3] < currBestLandSchedule.waterPercentages[3]
      ) {
        currBestLandSchedule = this.allRuns[i];
      }
    }

    const totalWaterFirstNoChoicePercentage =
      currBestWaterSchedule.waterPercentages[3] + currBestLandSchedule.landPercentages[3];
    const totalLandFirstNoChoicePercentage =
      currBestLandSchedule.landPercentages[3] + currBestWaterSchedule.waterPercentages[3];
    return totalLandFirstNoChoicePercentage < totalWaterFirstNoChoicePercentage
      ? currBestLandSchedule
      : currBestWaterSchedule;
  }

  /**
   * The schedule can be ran 1 to 100 times. Since there is randomness in the scheduling algorithm,
   * multiple runs are necessary to find the best schedule. Best meaning the schedule that gives
   * the most kids one of their 3 scheduled choice for water and land activities.
   * @param {number} numOfRuns - number of times to run the scheduling algorithm
   * @returns {void}
   */
  public scheduleTheKids(numOfRuns: number): void {
    if (numOfRuns < 1 || numOfRuns > 1000) {
      throw new RangeError('Value must be between 1 and 1000');
    }
    let validResults = true;
    let validCount = 0;
    let invalidCount = 0;
    while (this.allRuns.length < numOfRuns) {
      this.run = new Schedule(this.kids, 'waterFirst');
      const validResult = this.run.runAlgo();
      if (validResult) {
        validCount++;
        this.allRuns.push(this.run);
      } else {
        invalidCount++;
      }
      if (invalidCount > numOfRuns) {
        validResults = false;
        break;
      }
    }
    if (!validResults) {
      if (validCount > 0) {
        this.bestSchedule = this.bestPercentagesSchedule();
      } else {
        this.bestSchedule = null;
      }
    } else {
      this.bestSchedule = this.bestPercentagesSchedule();
    }
  }
}
