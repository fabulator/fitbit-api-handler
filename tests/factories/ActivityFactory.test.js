import { ActivityFactory, Activity } from './../../src';

describe('Test PointFactory class', () => {
    it('create point from api response', () => {
        const apiActivity = {
            activeDuration: 1,
            activityLevel: [],
            activityName: 'activity name',
            name: 'celebration',
            activityTypeId: 1,
            activityParentId: 2,
            activityParentName: 'a',
            averageHeartRate: 56,
            calories: 42,
            caloriesLink: '',
            distance: 9,
            distanceUnit: 'km',
            duration: 452,
            elevationGain: 5,
            heartRateLink: '',
            heartRateZones: [],
            lastModified: '',
            logId: 1,
            logType: 5,
            manualValuesSpecified: {},
            originalDuration: 1,
            originalStartTime: '',
            pace: 1,
            source: {},
            speed: 5,
            startTime: '',
            steps: 9,
            tcxLink: '',
        };
        const activity = ActivityFactory.getActivityFromApi(apiActivity);
        expect(activity instanceof Activity).toBeTruthy();
    });
});
