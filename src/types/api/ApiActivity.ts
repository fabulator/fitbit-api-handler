import { ActivityType } from '../../constants/activity-types';

export interface ApiActivity {
    activeDuration?: number;
    activityId?: ActivityType;
    activityLevel?: unknown[];
    activityName?: string;
    activityParentId?: ActivityType;
    activityParentName?: string;
    activityTypeId?: ActivityType;
    averageHeartRate: number;
    calories: number;
    caloriesLink: string;
    distance: number;
    distanceUnit: string;
    duration: number;
    elevationGain: number;
    heartRateLink: string;
    heartRateZones: unknown[];
    lastModified: string;
    logId: number;
    logType: string;
    manualValuesSpecified: Record<string, unknown>;
    name?: string;
    originalDuration: number;
    originalStartTime: string;
    pace: number;
    source: Record<string, unknown>;
    speed: number;
    startTime: string;
    steps: number;
    tcxLink: string;
}
