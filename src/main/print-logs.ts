import { Activities } from './activities';
import { AllowedActivityTypes, AllowedTimes } from "../types/schedule-types";
import { KidsData, UnscheduledKids } from "../types/kids-types"
import type { Schedule } from "./schedule"

/**
 * PRINTLOGS CLASS
 * Contains the methods that print information about the kids, activities
 * and related data of the scheduled camp.
 * Primarily used for debugging assistence.
 */
export class PrintLogs {

  /**
   *
   * @param activityType - only 2 options 'land' or 'water'.
   * @param func_name  - name of scheduling function being called.
   */
  static initialStatement(
    activityType: AllowedActivityTypes | 'final log',
    func_name: string,
  ): void {
    console.log('\n');
    console.log('______________________________________');
    console.log(`\tENTERING LOGS -- ${activityType}`);
    console.log('--------------------------------------');
    console.log('\tAfter calling', func_name, '\n');
  }

  /**
    * Get list of all not scheduled activities for a given activity type and time slot.
    * @param {string} activityType - only 2 options: 'land' or 'water'.
    * @param {string} timeSlot - only 2 options: '9am' or '10am'.
    * @returns {Map<string, number>} - map of not scheduled activities and their remaining slots, e.g {'canoe', 10, 'pboard', 4}
    */
  static getNotScheduledActivities(
    activityType: AllowedActivityTypes,
    timeSlot: AllowedTimes,
    schedule: Schedule
  ): Map<string, number> {
    const scheduledActivities = schedule.getActivityTypeTimeSlot(activityType, timeSlot);
    const notScheduledActivities = new Map<string, number>();
    const activityRange = activityType === 'land' ? Activities.landRanges : Activities.waterRanges;
    for (const [activity, names] of Object.entries(scheduledActivities) as [
      keyof typeof scheduledActivities,
      string[],
    ][]) {
      if (names.length === 0) {
        notScheduledActivities.set(activity, activityRange[activity][1]);
      }
    }
    return new Map([...notScheduledActivities.entries()].sort((b, a) => a[1] - b[1]));
  }

  /**
    * Print unscheduled names and activities.
    * @param {string} activityType - only 2 options: 'land' or 'water'.
    * @param {Schedule} schedule - the main Schedule object.
    * @returns {void}
    */
  static unscheduledData(activityType: AllowedActivityTypes, schedule: Schedule): void {
    const notScheduledAllNames =
      activityType === 'land' ? schedule.notScheduledAllNamesLand : schedule.notScheduledAllNamesWater;
    const notScheduledNames9am = schedule.getNotScheduledKidsList(activityType, '9am', false);
    const notScheduledNames10am = schedule.getNotScheduledKidsList(activityType, '10am', false);
    const notScheduledActivities9am = this.getNotScheduledActivities(activityType, '9am', schedule);
    const notScheduledActivities10am = this.getNotScheduledActivities(activityType, '10am', schedule);
    console.log(`NOT SCHEDULED ${activityType.toUpperCase()}:`);
    console.log('-------------------');
    console.log(
      `NOT SCHEDULED COUNT ALL NAMES ${activityType.toUpperCase()}: `,
      notScheduledAllNames.length
    );
    console.log(
      `NOT SCHEDULED 9AM ${activityType.toUpperCase()} NAMES: `,
      notScheduledNames9am.length
    );
    console.log(`NOT SCHEDULED 9AM ${activityType.toUpperCase()} ACTIVITIES: `, [
      ...notScheduledActivities9am.keys(),
    ]);
    console.log(
      `NOT SCHEDULED 10AM ${activityType.toUpperCase()} NAMES: `,
      notScheduledNames10am.length
    );
    console.log(`NOT SCHEDULED 10AM ${activityType.toUpperCase()} ACTIVITIES: `, [
      ...notScheduledActivities10am.keys(),
    ]);
    console.log('\n');
  }

  /**
   * Switch for sending 'water' or 'land' data to unscheduledData() method.
   * @param activityType - 'land', 'water' or 'final log' that prints all final data.
   * @param schedule - the Schedule class object
   */
  static unscheduledDataSwitch(activityType: AllowedActivityTypes | 'final log', schedule: Schedule): void {
    if (activityType === 'water' || activityType === 'final log') {
      PrintLogs.unscheduledData('water', schedule);
    }

    if (activityType === 'land' || activityType === 'final log') {
      PrintLogs.unscheduledData('land', schedule);
    }
  }

  /**
   * Print info about kids that are not scheduled (or scheduled incorrectly)
   * @param kidsCount - total number of kids attending camp
   * @param totalKidsCountWater  - total number of kids assigned to water activities
   * @param totalKidsCountLand  - total number of kids assigned to land activities
   * @param logging - if true print additional logging info
   * @param unscheduledKids - list of kids that are unscheduled and their timeslots
   * @param allNotInTarget - false if a name is in both 9am and 10am water
   * @param allNamesEmpty - true if there are no kids left to schedule
   */
  static kidsNotScheduled(
    kidsCount: number,
    totalKidsCountWater: number,
    totalKidsCountLand: number,
    logging: boolean,
    unscheduledKids: UnscheduledKids[],
    allNotInTarget: boolean,
    allNamesEmpty: boolean): void {
      console.log('\nTOTAL KIDS NOT SCHEDULED Water:', kidsCount - totalKidsCountWater);
      console.log('\nTOTAL KIDS NOT SCHEDULED Land:', kidsCount - totalKidsCountLand);
      for (const kid of unscheduledKids) {
        console.log(kid);
      }

      if (logging) {
        console.log(
          'this.notScheduled9amWater.names !== this.notScheduled10amWater.names:',
          allNotInTarget
        );
        console.log('this.notScheduledAllNamesWater.length === 0:', allNamesEmpty);
      }
  }
}
