import { DateTime } from 'luxon';

export interface DateFilters {
    beforeDate?: (DateTime | string),
    afterDate?: (DateTime | string),
    limit?: number,
    offset?: number,
}
