import { DateTime, Duration } from 'luxon';
import { unit, Unit } from 'mathjs';
import { Workout, TYPES } from 'fitness-models';
import { ApiActivity, ActivityType } from '../types';
import { FitbitException } from '../exceptions';

interface Constructor<Id, ApiSource> extends TYPES.WorkoutConstructor {
    typeId: ActivityType,
    id: Id,
    typeName?: string,
    tcxLink?: string,
    steps?: number,
    source: ApiSource,
}

export default class Activity<Id extends (number | undefined) = any, ApiSource extends (ApiActivity | undefined) = any> extends Workout {
    protected typeId: ActivityType;

    protected typeName?: string;

    protected id?: number;

    protected steps?: number;

    protected tcxLink?: string;

    protected source?: ApiActivity;

    public constructor(options: Constructor<Id, ApiSource>) {
        super(options);
        this.typeId = options.typeId;
        this.id = options.id;
        this.steps = options.steps;
        this.tcxLink = options.tcxLink;
        this.source = options.source;
    }

    public static fromApi(activity: ApiActivity): Activity<number, ApiActivity> {
        const { distance } = activity;

        const activityId = activity.activityTypeId || activity.activityId;
        if (!activityId) {
            throw new FitbitException('Activity type ID was not found in API response.');
        }

        return new Activity({
            start: DateTime.fromISO(activity.startTime, { setZone: true }),
            id: activity.logId,
            duration: Duration.fromMillis(activity.duration),
            typeName: activity.activityName || activity.name,
            typeId: activityId,
            avgHeartRate: activity.averageHeartRate,
            calories: activity.calories,
            steps: activity.steps,
            tcxLink: activity.tcxLink,
            source: activity,
            ...(distance != null ? { distance: unit(activity.distance, 'km') } : {}),
        });
    }

    // eslint-disable-next-line max-params
    public static get(
        typeId: ActivityType,
        start: DateTime,
        duration: Duration,
        distance?: Unit,
        calories?: number,
    ): Activity<undefined, undefined> {
        return new Activity({
            calories,
            typeId,
            start,
            duration,
            distance,
            id: undefined,
            source: undefined,
        });
    }

    protected clone(extension: Partial<Constructor<number | undefined, ApiSource>>): any {
        // @ts-ignore
        return new Activity({
            ...this.toObject(),
            ...extension,
        });
    }

    public getId(): number | undefined {
        return this.id;
    }

    public setId(id: number): Activity<number, ApiActivity>

    public setId(id: undefined): Activity<undefined, ApiActivity>

    public setId(id: number | undefined) {
        return this.clone({ id });
    }

    public getTypeId() {
        return this.typeId;
    }

    public getTypeName() {
        return this.typeName || 'unknown';
    }

    public getSource() {
        return this.source;
    }

    public getSteps(): number | undefined {
        return this.steps;
    }

    public getTcxLink(): string | undefined {
        return this.tcxLink;
    }

    public toString(): string {
        const distance = this.getDistance();

        return [
            `Workout ${this.getId() || ''}`,
            `type: ${this.getTypeName()}`,
            `start: ${this.getStart().toFormat('yyyy-MM-dd HH:mm')}`,
            distance != null ? `distance: ${Math.round(distance.toNumber('km') * 10) / 10}km` : null,
            `duration: ${Math.round(this.getDuration().as('minutes'))}min`,
        ].filter(item => item !== null).join('; ');
    }
}
