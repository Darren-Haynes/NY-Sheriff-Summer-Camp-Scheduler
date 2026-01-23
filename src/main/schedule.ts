import { Kids } from './kids';
import { Activities } from './activities';

/**
Main class that schedules the kids to activities.
*/
export class Schedule {
  inputData: string;
  kids: Kids;

  constructor(inputData: string) {
    this.inputData = inputData;
    this.kids = new Kids(this.inputData);
  }
}
