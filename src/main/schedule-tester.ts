import { ActivityPercentages, AllowedActivityTypes, AllowedTimes } from '../types/schedule-types'
import type { SchedulerListMethods } from '@src/types/scheduler-tester';

export class ScheduleTester {

  /**
   * Checks if kids choices percentages are invalid.
   * If any of the  percentage have been set to -1 previously it means they are invalid.
   * @returns {boolean}
   */
  checkPercentages(landPercentages: ActivityPercentages, waterPercentages: ActivityPercentages): boolean {;
  if (landPercentages.some(x => x  === -1)) {
    return false
  }
    if (waterPercentages.every(x => x === 0) || landPercentages.every(x => x === 0)) {
      return false
    }
    return true
    }

  /**
   * Tests that the number of unscheduled kids and activities matches the number of scheduled kids and activities for a given activity type and time slot.
   * @param {AllowedActivityTypes} activityType - only 2 options: 'land' or 'water'.
   * @param {AllowedTimes} timeSlot - only 2 options: '9am' or '10am'.
   * @returns {boolean} - true if the number of unscheduled kids and activities matches the number of scheduled kids and activities, false otherwise.
   */
  private testUnscheduledToScheduledActivityTypeTime(
    schedulerListMethods: SchedulerListMethods,
    activityType: AllowedActivityTypes,
    timeSlot: AllowedTimes,
    kidsCount: number
  ): boolean {
    const scheduledTimeNames = schedulerListMethods[0](activityType, timeSlot);
    const scheduledActivities = schedulerListMethods[1](activityType, timeSlot);
    const notScheduledTimeNames = schedulerListMethods[2](activityType, timeSlot, false);
    const notScheduledActivities = schedulerListMethods[3](activityType, timeSlot);
    if (activityType === 'water') {
      // Unscheduled kids list length and scheduled kids list length should add up to total amount of kids that need to be scheduled
      const scheduledAndNotScheduledCompareToAllNames =
        scheduledTimeNames.length + notScheduledTimeNames.length === kidsCount;
      if (!scheduledAndNotScheduledCompareToAllNames) {
        // console.log(
        //   `Water scheduled names (${scheduledTimeNames.length}) + not scheduled names (${notScheduledTimeNames.length}) does not equal total kids count (${this.kids.count})`
        // );
        return false;
      }
    }

    // The kids names in the unscheduled list should never be found in the scheduled list
    const scheduledKidsInUnscheduleKidsList = scheduledTimeNames.some(name =>
      notScheduledTimeNames.includes(name)
    );
    if (scheduledKidsInUnscheduleKidsList) {
      console.log(
        `At least one Scheduled kid (${scheduledTimeNames.length}) is in the unscheduled kids list (${notScheduledTimeNames.length})`
      );
      return false;
    }

    // The kids names in the unscheduled list should never be found in the scheduled list
    const scheduledActivitiesNotInUnscheduleActivitiesList = scheduledActivities.some(name =>
      notScheduledActivities.includes(name)
    );
    if (scheduledActivitiesNotInUnscheduleActivitiesList) {
      console.log(
        `At least one Scheduled activity (${scheduledActivities.length}) is in the unscheduled activities list (${notScheduledActivities.length})`
      );
      return false;
    }
    return true;
  }

  testUnscheduledToScheduled(schedulerListMethods: SchedulerListMethods, kidsCount: number): boolean {
    const allScheduleTests: boolean[] = [
      this.testUnscheduledToScheduledActivityTypeTime(schedulerListMethods, 'water', '9am', kidsCount),
      this.testUnscheduledToScheduledActivityTypeTime(schedulerListMethods, 'water', '10am', kidsCount),
      this.testUnscheduledToScheduledActivityTypeTime(schedulerListMethods, 'land', '9am', kidsCount),
      this.testUnscheduledToScheduledActivityTypeTime(schedulerListMethods, 'land', '10am', kidsCount),
    ];

    const result = allScheduleTests.every(test => test === true);

    if (!result && process.env.NODE_ENV !== 'production') {
      console.log('Unscheduled kids & activities count to scheduled kids & activities mismatch.');
    }

    return result;
  }
}
