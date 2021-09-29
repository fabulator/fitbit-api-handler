import { DateTime } from 'luxon';

export interface ApiWeight {
    bmi: number;
    datetime: DateTime;
    logId: number;
    source: string;
    weight: number;
}
