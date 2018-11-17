import { DateTime } from 'luxon';

export type DateFilters = {
    beforeDate?: (DateTime | string),
    afterDate?: (DateTime | string),
    limit?: number,
    offset?: number,
};
