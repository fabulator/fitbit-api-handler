import { DateTime, Duration } from 'luxon';
import { Pagination } from '../../api/Api';

export enum StagesSleepState {
    deep = 'deep',
    light = 'light',
    rem = 'rem',
    wake = 'wake',
}

export enum ClassicSleepState {
    asleep = 'asleep',
    awake = 'awake',
    restless = 'restless',
}

export enum SleepType {
    classic = 'classic',
    stages = 'stages',
}

interface SummaryData {
    count: number;
    minutes: number;
    thirtyDayAvgMinutes: number;
}

interface SleepData<Level> {
    datetime: string;
    level: Level;
    seconds: number;
}

interface ApiSleepBase<Levels extends Record<string, unknown>, Type extends SleepType> {
    dateOfSleep: string;
    duration: number;
    efficiency: number;
    endTime: string;
    infoCode: number;
    isMainSleep: boolean;
    levels: Levels;
    logId: number;
    minutesAfterWakeup: number;
    minutesAsleep: number;
    minutesAwake: number;
    minutesToFallAsleep: number;
    startTime: string;
    timeInBed: number;
    type: Type;
}

export type ApiSleep =
    | ApiSleepBase<
          {
              data: SleepData<StagesSleepState>[];
              shortData: SleepData<StagesSleepState>[];
              summary: {
                  [state in StagesSleepState]: SummaryData;
              };
          },
          SleepType.stages
      >
    | ApiSleepBase<
          {
              data: SleepData<ClassicSleepState>[];
              summary: {
                  [state in ClassicSleepState]: {
                      count: number;
                      minutes: number;
                  };
              };
          },
          SleepType.classic
      >;

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

export interface SingleDayProcessedResponse {
    sleep: ApiSleepTransformed[];
}

export interface SleepProcessedResponse {
    pagination: Pagination;
    sleep: ApiSleepTransformed[];
}
