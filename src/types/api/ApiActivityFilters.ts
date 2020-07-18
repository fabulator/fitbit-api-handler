import { DateTime } from 'luxon';

export interface ApiActivityFilters {
    afterDate?: DateTime | string;
    beforeDate?: DateTime | string;
    limit?: number;
    offset?: number;
}
