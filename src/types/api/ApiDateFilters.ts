import { DateTime } from 'luxon';

export interface ApiDateFilters {
    afterDate?: DateTime | string;
    beforeDate?: DateTime | string;
    limit?: number;
    offset?: number;
}
