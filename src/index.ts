import { Api } from './api';
import {
    ACTIVITY_TYPES,
    INTRADAY_RESOURCES,
    SCOPES,
    SUBSCRIPTION_COLLECTIONS,
} from './constants';
import { FitbitException, FitbitApiException } from './exceptions';
import { Activity } from './models';
import {
    Scope as ScopeSource,
    ApiToken as ApiTokenSource,
    ActivityFilters as ActivityFiltersSource,
    ActivityType as ActivityTypeSource,
} from './types';

export declare namespace TYPES {
    export type Scope = ScopeSource;
    export type ApiToken = ApiTokenSource;
    export type ActivityFilters = ActivityFiltersSource;
    export type ActivityType = ActivityTypeSource;
}

export {
    Api,
    ACTIVITY_TYPES,
    INTRADAY_RESOURCES,
    SCOPES,
    SUBSCRIPTION_COLLECTIONS,
    FitbitException,
    FitbitApiException,
    Activity,
};
