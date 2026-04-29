import { Kids } from './kids';
import { Schedule } from './schedule';
import { Activities } from './activities';

export class Camp {
  kids: Kids;
  inputData: string;
  inputDataArr: string[];
  waterFirst: Schedule;

  constructor(kids: Kids) {
    this.waterFirst = new Schedule(kids, 'waterFirst');
  }
}
