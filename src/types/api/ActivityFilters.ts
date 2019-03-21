import { DateTime } from 'luxon';

export interface ActivityFilters {
    beforeDate?: (DateTime | string),
    afterDate?: (DateTime | string),
    limit?: number,
    offset?: number,
}
