import math from 'mathjs';
import { DateTime, Duration } from 'luxon';

class Activity {

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
        source
    }) {
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

    getId() {
        return this.id;
    }

    setId(id) {
        this.id = id;
        return this;
    }

    getTypeId() {
        return this.typeId;
    }

    setTypeId(typeId) {
        this.typeId = typeId;
        return this;
    }

    getTypeName() {
        return this.typeName;
    }

    getStart() {
        return this.start;
    }

    setStart(start) {
        this.start = start;
        return this;
    }

    getEnd() {
        return this.getStart().plus(this.getDuration());
    }

    getDuration() {
        return this.duration;
    }

    setDuration(duration) {
        this.duration = duration;
        return this;
    }

    getDistance() {
        return this.distance;
    }

    setDistance(distance) {
        this.distance = distance;
        return this;
    }

    getCalories() {
        return this.calories;
    }

    setCalories(calories) {
        this.calories = calories;
        return this;
    }

    getAvgHeartRate() {
        return this.heartRateAvg;
    }

    setAvgHeartRate(hr) {
        this.heartRateAvg = hr;
        return this;
    }

    getSource() {
        return this.source;
    }

    getSteps() {
        return this.steps;
    }

    getTcxLink() {
        return this.tcxLink;
    }

    toString() {
        const distance = this.getDistance();

        return [`Workout ${this.getId() || ''}`, `type: ${this.getTypeName() || 'uknown'}`, `start: ${this.getStart().toFormat('yyyy-MM-dd HH:mm')}`, distance !== null ? `distance: ${Math.round(distance.toNumber('km') * 10) / 10}km` : null, `duration: ${Math.round(this.getDuration().as('minutes'))}min`].filter(item => item !== null).join('; ');
    }
}

class ActivityFactory {
    static getActivityFromApi(activity) {
        const { distance } = activity;

        return new Activity({
            start: DateTime.fromISO(activity.startTime),
            id: activity.logId,
            duration: Duration.fromMillis(activity.duration),
            typeName: activity.activityName || activity.name,
            typeId: activity.activityTypeId,
            heartRateAvg: activity.averageHeartRate,
            calories: activity.calories,
            distance: distance != null ? math.unit(activity.distance, 'km') : null,
            steps: activity.steps,
            tcxLink: activity.tcxLink,
            source: activity
        });
    }

    // eslint-disable-next-line max-params
    static get(typeId, start, duration, distance, calories) {
        return new Activity({
            calories,
            typeId,
            start,
            duration,
            distance
        });
    }
}

export default ActivityFactory;
