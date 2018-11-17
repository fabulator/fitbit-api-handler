import { DateTime, Duration } from 'luxon';
import { unit, Unit } from 'mathjs';
import { ApiActivity, ActivityType } from '../types';
import { FitbitException } from '../exceptions';

type Constructing = {
    start: DateTime,
    duration: Duration,
    typeId: ActivityType,
    id?: number,
    typeName?: string,
    heartRateAvg?: number,
    calories?: number,
    distance?: Unit,
    steps?: number,
    tcxLink?: string,
    source?: ApiActivity,
};

export default class Activity {
    private start: DateTime;

    private duration: Duration;

    private typeId: ActivityType;

    private id: number | null;

    private typeName: string | null;

    private heartRateAvg: number | null;

    private calories: number | null;

    private distance: Unit | null;

    private steps: number | null;

    private tcxLink: string | null;

    private source: ApiActivity | null;


    // eslint-disable-next-line complexity
    public constructor({
        start,
        id,
        duration,
        typeName,
        typeId,
        heartRateAvg,
        calories,
        distance,
        steps,
        tcxLink,
        source,
    }: Constructing) {
        this.start = start;
        this.duration = duration;
        this.typeId = typeId;

        this.id = id != null ? id : null;
        this.typeName = typeName != null ? typeName : null;
        this.heartRateAvg = heartRateAvg != null ? heartRateAvg : null;
        this.calories = calories != null ? calories : null;
        this.distance = distance != null ? distance : null;
        this.steps = steps != null ? steps : null;
        this.tcxLink = tcxLink != null ? tcxLink : null;
        this.source = source != null ? source : null;
    }

    public static fromApi(activity: ApiActivity): Activity {
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
            heartRateAvg: activity.averageHeartRate,
            calories: activity.calories,
            steps: activity.steps,
            tcxLink: activity.tcxLink,
            source: activity,
            ...(distance != null ? { distance: unit(activity.distance, 'km') } : {}),
        });
    }

    // eslint-disable-next-line max-params
    public static get(typeId: number, start: DateTime, duration: Duration, distance?: Unit, calories?: number): Activity {
        return new Activity({
            calories,
            typeId,
            start,
            duration,
            distance,
        });
    }

    public getId(): number | null {
        return this.id;
    }

    public setId(id: number | null): this {
        this.id = id;
        return this;
    }

    public getTypeId(): ActivityType {
        return this.typeId;
    }

    public setTypeId(typeId: ActivityType): this {
        this.typeId = typeId;
        return this;
    }

    public getTypeName(): string | null {
        return this.typeName;
    }

    public getStart(): DateTime {
        return this.start;
    }

    public setStart(start: DateTime): this {
        this.start = start;
        return this;
    }

    public getEnd(): DateTime {
        return this.getStart().plus(this.getDuration());
    }

    public getDuration(): Duration {
        return this.duration;
    }

    public setDuration(duration: Duration): this {
        this.duration = duration;
        return this;
    }

    public getDistance(): Unit | null {
        return this.distance;
    }

    public setDistance(distance: Unit | null): this {
        this.distance = distance;
        return this;
    }

    public getCalories(): number | null {
        return this.calories;
    }

    public setCalories(calories: number | null): this {
        this.calories = calories;
        return this;
    }

    public getAvgHeartRate(): number | null {
        return this.heartRateAvg;
    }

    public setAvgHeartRate(hr: number | null): this {
        this.heartRateAvg = hr;
        return this;
    }

    public getSource(): ApiActivity | null {
        return this.source;
    }

    public getSteps(): number | null {
        return this.steps;
    }

    public getTcxLink(): string | null {
        return this.tcxLink;
    }

    public toString(): string {
        const distance = this.getDistance();

        return [
            `Workout ${this.getId() || ''}`,
            `type: ${this.getTypeName() || 'uknown'}`,
            `start: ${this.getStart().toFormat('yyyy-MM-dd HH:mm')}`,
            distance !== null ? `distance: ${Math.round(distance.toNumber('km') * 10) / 10}km` : null,
            `duration: ${Math.round(this.getDuration().as('minutes'))}min`,
        ].filter(item => item !== null).join('; ');
    }
}
