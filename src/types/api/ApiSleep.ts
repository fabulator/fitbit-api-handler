import { DateTime, Duration } from 'luxon';
import { Pagination } from '../../api/Api';

export interface ApiSleep {
    dateOfSleep: string;
    duration: number;
    efficiency: number;
    endTime: string;
    infoCode: number;
    isMainSleep: boolean;
    levels: Record<string, unknown>;
    logId: number;
    minutesAfterWakeup: number;
    minutesAsleep: number;
    minutesAwake: number;
    minutesToFallAsleep: number;
    startTime: string;
    timeInBed: number;
    type: string;
}

export interface ApiSleepTransformed {
    afterWakeup: Duration;
    asleep: Duration;
    awake: Duration;
    duration: Duration;
    efficiency: number;
    endDateTime: DateTime;
    id: number;
    isMainSleep: boolean;
    source: ApiSleep;
    startDateTime: DateTime;
    toFallAsleep: Duration;
}

export interface SleepProcessedResponse {
    pagination: Pagination;
    sleep: ApiSleepTransformed[];
}
