import { DateTime, Duration } from 'luxon';
import { unit } from 'mathjs';
import { Activity, ActivityType } from '../../src';

describe('Test ApiActivity class', () => {
    it('has corrent unit in distance', () => {
        const activity = new Activity({
            id: undefined,
            source: undefined,
            start: DateTime.local(),
            duration: Duration.fromObject({ day: 1 }),
            typeId: ActivityType.RUNNING,
            distance: unit(2, 'km'),
        });

        const distance = activity.getDistance();

        if (!distance) {
            throw new Error('Distance is undefined.');
        }

        expect(distance.toNumber('m')).toEqual(2000);
    });
});
