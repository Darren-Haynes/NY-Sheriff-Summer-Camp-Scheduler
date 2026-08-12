import { AllowedActivityTypes, AllowedTimes } from '../types/schedule-types'
import type { Schedule } from './schedule'

export class ScheduleTester {
  schedule: Schedule

  constructor(schedule: Schedule) {
    this.schedule = schedule
  }
  /**
   * Checks if kids choices percentages are invalid.
   * If any of the  percentage have been set to -1 previously it means they are invalid.
   * @returns {boolean}
   */
  checkPercentages(): boolean {;
  if (this.schedule.landPercentages.some(x => x  === -1)) {
    return false
  }
    if (this.schedule.waterPercentages.every(x => x === 0) || this.schedule.landPercentages.every(x => x === 0)) {
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
    activityType: AllowedActivityTypes,
    timeSlot: AllowedTimes,
  ): boolean {
    const scheduledTimeNames = this.schedule.getScheduledKidsList(activityType, timeSlot);
    const scheduledActivities = this.schedule.getScheduledActivitiesList(activityType, timeSlot);
    const notScheduledTimeNames = this.schedule.getNotScheduledKidsList(activityType, timeSlot, false);
    const notScheduledActivities = this.schedule.getNotScheduledActivitiesList(activityType, timeSlot);
    if (activityType === 'water') {
      // Unscheduled kids list length and scheduled kids list length should add up to total amount of kids that need to be scheduled
      const scheduledAndNotScheduledCompareToAllNames =
        scheduledTimeNames.length + notScheduledTimeNames.length === this.schedule.kids.count;
      if (!scheduledAndNotScheduledCompareToAllNames) {
        if (process.env.NODE_ENV !== 'production') {
          console.log(
            `Water scheduled names (${scheduledTimeNames.length}) + not scheduled names (${notScheduledTimeNames.length}) does not equal total kids count (${this.schedule.kids.count})`
          );

        }
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

  testUnscheduledToScheduled(): boolean {
    const allScheduleTests: boolean[] = [
      this.testUnscheduledToScheduledActivityTypeTime('water', '9am'),
      this.testUnscheduledToScheduledActivityTypeTime('water', '10am'),
      this.testUnscheduledToScheduledActivityTypeTime('land', '9am'),
      this.testUnscheduledToScheduledActivityTypeTime('land', '10am'),
    ];

    const result = allScheduleTests.every(test => test === true);

    if (!result && process.env.NODE_ENV !== 'production') {
      console.log('Unscheduled kids & activities count to scheduled kids & activities mismatch.');
    }

    return result;
  }
}
