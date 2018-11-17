import { IntradayResource as IntradayResourceSource } from './IntradayResource';
import { ActivityType as ActivityTypeSource } from './ActivityType';
import { Scope as ScopeSource } from './Scope';
import { SubscriptionCollection as SubscriptionCollectionSource } from './SubscriptionCollection';
import {
    Activity as ApiActivitySource,
    Token as ApiTokenSource,
    Sleep as ApiSleepSource,
    ActivityFilters as ActivityFiltersSource,
    DateFilters as DateFiltersSource,
} from './api';

export type IntradayResource = IntradayResourceSource;
export type ActivityType = ActivityTypeSource;
export type Scope = ScopeSource;
export type SubscriptionCollection = SubscriptionCollectionSource;
export type ActivityFilters = ActivityFiltersSource;
export type DateFilters = DateFiltersSource;
export type ApiActivity = ApiActivitySource;
export type ApiToken = ApiTokenSource;
export type ApiSleep = ApiSleepSource;
