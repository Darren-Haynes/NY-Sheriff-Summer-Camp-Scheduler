import { Kids } from './kids';
import { Schedule } from './schedule';
import { ERROR_LOGS, SUCCESS_LOGS, INFO_LOGS } from '../sheriff.config'

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
   * Find the run that leaves the fewest kids with no choice, counting water and land equally.
   * Ties are broken by the highest combined first-choice percentage, then by the earliest run.
   * @returns {Schedule}
   */
  private bestPercentagesSchedule(): Schedule {
    const noChoice = (run: Schedule): number =>
      run.waterPercentages[3] + run.landPercentages[3];
    const firstChoice = (run: Schedule): number =>
      run.waterPercentages[0] + run.landPercentages[0];

    let best = this.allRuns[0];
    for (const run of this.allRuns) {
      if (
        noChoice(run) < noChoice(best) ||
        (noChoice(run) === noChoice(best) && firstChoice(run) > firstChoice(best))
      ) {
        best = run;
      }
    }
    return best;
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
      const validResult = this.run.runAlgo(validCount + invalidCount);
      if (validResult) {
        validCount++;
        if (process.env.NODE_ENV !== 'production' && SUCCESS_LOGS) {
          const totalCount = validCount + invalidCount;
          console.log(`RUN #${totalCount} SUCCESSFULL`)
        }
        this.allRuns.push(this.run);
      } else {
        invalidCount++;
        if (process.env.NODE_ENV !== 'production' && ERROR_LOGS) {
          const totalCount = validCount + invalidCount;
          console.log(`RUN #${totalCount} FAILED`)
        }
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
    if (process.env.NODE_ENV !== 'production' && INFO_LOGS) {
      console.log(`\n=======RUN COUNTS=======`);
      console.log(`TOTAL RUNS COUNT: ${validCount + invalidCount}`);
      console.log(`VALID RUNS COUNT: ${validCount}`);
      console.log(`INVALID RUNS COUNT: ${invalidCount}`);
    }
  }
}
