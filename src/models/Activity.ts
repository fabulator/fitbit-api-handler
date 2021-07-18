import { Workout, WorkoutConstructor } from 'fitness-models';
import { DateTime, Duration } from 'luxon';
import { Unit, unit } from 'mathjs';
import { ActivityType } from '../constants/activity-types';
import { FitbitException } from '../exceptions';
import { ApiActivity } from '../types/api';

interface Constructor<Id, ApiSource> extends WorkoutConstructor {
    id: Id;
    source: ApiSource;
    steps?: number;
    tcxLink?: string;
    typeId: ActivityType;
    typeName?: string;
}

export default class Activity<Id extends number | undefined = any, ApiSource extends ApiActivity | undefined = any> extends Workout {
    protected typeId: ActivityType;

    protected typeName?: string;

    protected id: Id;

    protected steps?: number;

    protected tcxLink?: string;

    protected source: ApiSource;

    public constructor(options: Constructor<Id, ApiSource>) {
        super(options);
        this.typeId = options.typeId;
        this.typeName = options.typeName;
        this.id = options.id;
        this.steps = options.steps;
        this.tcxLink = options.tcxLink;
        this.source = options.source;
    }

    public static fromApi(activity: ApiActivity): Activity<number, ApiActivity> {
        const {
            distance,
            startTime,
            activityTypeId,
            activityId: activityIdSource,
            logId,
            duration,
            activityName,
            name,
            averageHeartRate,
            calories,
            steps,
            tcxLink,
        } = activity;

        const activityId = activityTypeId || activityIdSource;

        if (!activityId) {
            throw new FitbitException('ApiActivity type ID was not found in API response.');
        }

        return new Activity({
            start: DateTime.fromISO(startTime, { setZone: true }),
            id: logId,
            duration: Duration.fromMillis(duration),
            typeName: activityName || name,
            typeId: activityId,
            avgHeartRate: averageHeartRate,
            calories,
            steps,
            tcxLink,
            source: activity,
            ...(distance != null ? { distance: unit(distance, 'km') } : {}),
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

    protected clone(extension: Partial<Constructor<number | undefined, ApiSource>>): this {
        return new Activity({
            ...this.toObject(),
            ...extension,
        }) as this;
    }

    public getId() {
        return this.id;
    }

    public setId(id: number): Activity<number, ApiSource>;

    public setId(id: undefined): Activity<undefined, ApiSource>;

    public setId(id: undefined | number): Activity<number | undefined, ApiSource> {
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
        ]
            .filter((item) => item !== null)
            .join('; ');
    }

    public toObject(): Constructor<Id, ApiSource> {
        return {
            ...super.toObject(),
            typeId: this.typeId,
            points: this.points,
            hashtags: this.hashtags,
            id: this.id,
            source: this.source,
        };
    }
}
