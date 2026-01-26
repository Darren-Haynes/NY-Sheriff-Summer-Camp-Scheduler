import { Schedule } from './schedule';

export class Camp {
  inputData: string;
  waterFirst: Schedule;

  constructor(inputData: string) {
    this.waterFirst = new Schedule(inputData, 'waterFirst');
  }
}
