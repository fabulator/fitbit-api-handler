import { DateTime } from 'luxon';

export type ActivityFilters = {
    beforeDate?: (DateTime | string),
    afterDate?: (DateTime | string),
    limit?: number,
    offset?: number,
};
