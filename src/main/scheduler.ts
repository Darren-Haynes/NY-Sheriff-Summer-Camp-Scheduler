import Camp from './camp';

/**
Main class that schedules the kids to activities.
*/
export class Scheduler {
  camp: Camp;
  inputData: string;

  constructor(inputData: string) {
    this.camp = new Camp(inputData);
  }
}
