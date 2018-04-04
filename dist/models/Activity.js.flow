// @flow
import type { DateTime, Duration } from 'luxon';
import type { Unit } from 'mathjs';
import type { ApiActivity, ActivityType } from './../types';

type Constructing = {
    start: DateTime,
    duration: Duration,
    typeId: ActivityType,
    id?: ?number,
    typeName?: ?string,
    heartRateAvg?: ?number,
    calories?: ?number,
    distance?: ?Unit,
    steps?: ?number,
    tcxLink?: ?string,
    source?: ?ApiActivity,
}

export default class Activity {
    start: DateTime;
    duration: Duration;
    typeId: ActivityType;
    id: number | null;
    typeName: string | null;
    heartRateAvg: number | null;
    calories: number | null;
    distance: Unit | null;
    steps: number | null;
    tcxLink: string | null;
    source: ApiActivity | null;

    // eslint-disable-next-line complexity
    constructor({
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

    getId(): number | null {
        return this.id;
    }

    setId(id: number | null): this {
        this.id = id;
        return this;
    }

    getTypeId(): ActivityType {
        return this.typeId;
    }

    setTypeId(typeId: ActivityType): this {
        this.typeId = typeId;
        return this;
    }

    getTypeName(): string | null {
        return this.typeName;
    }

    getStart(): DateTime {
        return this.start;
    }

    setStart(start: DateTime): this {
        this.start = start;
        return this;
    }

    getEnd(): DateTime {
        return this.getStart().plus(this.getDuration());
    }

    getDuration(): Duration {
        return this.duration;
    }

    setDuration(duration: Duration): this {
        this.duration = duration;
        return this;
    }

    getDistance(): Unit | null {
        return this.distance;
    }

    setDistance(distance: Unit | null): this {
        this.distance = distance;
        return this;
    }

    getCalories(): number | null {
        return this.calories;
    }

    setCalories(calories: number | null): this {
        this.calories = calories;
        return this;
    }

    getAvgHeartRate(): number | null {
        return this.heartRateAvg;
    }

    setAvgHeartRate(hr: number | null): this {
        this.heartRateAvg = hr;
        return this;
    }

    getSource(): ApiActivity | null {
        return this.source;
    }

    getSteps(): number | null {
        return this.steps;
    }

    getTcxLink(): string | null {
        return this.tcxLink;
    }

    toString(): string {
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
