import type { Schedule } from '../main/schedule';

type GetScheduledKidsListFn = InstanceType<typeof Schedule>['getScheduledKidsList'];
type GetScheduledActivitiesListFn = InstanceType<typeof Schedule>['getScheduledActivitiesList'];
type GetNotScheduledKidsListFn = InstanceType<typeof Schedule>['getNotScheduledKidsList'];
type GetNotScheduledActivitiesListFn = InstanceType<typeof Schedule>['getNotScheduledActivitiesList'];

export type SchedulerListMethods = [
  GetScheduledKidsListFn,
  GetScheduledActivitiesListFn,
  GetNotScheduledKidsListFn,
  GetNotScheduledActivitiesListFn
];

// Add any other shared types/interfaces here as your refactor grows
export interface CampStats {
  landPercentagesTrue: boolean;
  waterPercentagesTrue: boolean;
}
