// @flow
import math, { type Unit } from 'mathjs';
import { DateTime, Duration } from 'luxon';
import FitbitException from './../exceptions/FitbitException';
import type { ApiActivity } from './../types';
import { Activity } from './../models';

export default class ActivityFactory {
    static getActivityFromApi(activity: ApiActivity): Activity {
        const { distance } = activity;

        const activityId = activity.activityTypeId || activity.activityId;
        if (!activityId) {
            throw new FitbitException('Activity type ID was not found in API response.');
        }

        return new Activity({
            start: DateTime.fromISO(activity.startTime),
            id: activity.logId,
            duration: Duration.fromMillis(activity.duration),
            typeName: activity.activityName || activity.name,
            typeId: activityId,
            heartRateAvg: activity.averageHeartRate,
            calories: activity.calories,
            distance: distance != null ? math.unit(activity.distance, 'km') : null,
            steps: activity.steps,
            tcxLink: activity.tcxLink,
            source: activity,
        });
    }

    // eslint-disable-next-line max-params
    static get(typeId: number, start: DateTime, duration: Duration, distance: ?Unit, calories: ?number): Activity {
        return new Activity({
            calories,
            typeId,
            start,
            duration,
            distance,
        });
    }
}
