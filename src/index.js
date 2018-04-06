// @flow
import { Api } from './api';
import { ACTIVITY_TYPES, INTRADAY_RESOURCES, SCOPES, SUBSCRIPTION_COLLECTIONS } from './constants';
import { FitbitException, FitbitApiException } from './exceptions';
import { ActivityFactory } from './factories';
import { Activity } from './models';
import type { IntradayResource, ApiActivity, ApiToken, ActivityFilters, ActivityType, SubscriptionCollection } from './types';

export type { IntradayResource, ApiActivity, ApiToken, ActivityFilters, ActivityType, SubscriptionCollection };

export {
    Api,
    ACTIVITY_TYPES,
    INTRADAY_RESOURCES,
    SCOPES,
    SUBSCRIPTION_COLLECTIONS,
    FitbitException,
    FitbitApiException,
    ActivityFactory,
    Activity,
};
