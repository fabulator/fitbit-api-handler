import {
    ACTIVITIES,
    BODY,
    FOODS,
    SLEEP,
} from '../constants/subscription-collections';

export type SubscriptionCollection = typeof ACTIVITIES | typeof BODY | typeof FOODS | typeof SLEEP;
