// @flow
import {
    Api as ApiBase,
    DefaultResponseProcessor,
    type ApiResponseType,
} from 'rest-api-handler/src';
import queryString from 'query-string';
import { DateTime } from 'luxon';
import { FitbitApiException } from './../exceptions';
import { ActivityFactory } from './../factories';
import { Activity } from './../models';
import type { IntradayResource, ApiToken, ActivityFilters, ApiActivity, Scope, SubscriptionCollection } from './../types';
import ResponseProcessor from './ResponseProcessor';

type ResponseType = 'code' | 'token';
type Prompt = 'consent' | 'login' | 'login consent' | 'none';
type DetailLevel = '1sec' | '1min' | '15min';

export type ActivityResponse = {
    activities: Array<Activity>,
    pagination: {
        afterDate?: string,
        limit: number,
        next: string,
        offset: number,
        previous: string,
        sort: string,
    }
}

export type IntradayResponse = {
    total: number,
    sets: Array<{
        time: DateTime,
        value: number,
    }>,
}

export type SubscriptionResponse = {
    collectionType: string,
    ownerId: string,
    ownerType: string,
    subscriberId: string,
    subscriptionId: string,
}

export type ActivitySummaryResponse = {
    activities: Array<Activity>,
    goals: {
        caloriesOut: number,
        distance: number,
        floors: number,
        steps: number,
    },
    summary: {
        activityCalories: number,
        caloriesBMR: number,
        caloriesOut: number,
        distances: Array<{ activity: string, distance: number }>,
        elevation: number,
        fairlyActiveMinutes: number,
        floors: number,
        lightlyActiveMinutes: number,
        marginalCalories: number,
        sedentaryMinutes: number,
        steps: number,
        veryActiveMinutes: number,
    },
}

export type Token = ApiToken & {
    expireDate: string,
};

function base64Encode(string: string) {
    if (typeof btoa !== 'undefined') {
        // eslint-disable-next-line no-undef
        return btoa(string);
    }

    return Buffer.from(string).toString('base64');
}

export default class Api extends ApiBase<ApiResponseType<*>> {
    clientId: string;
    secret: string;

    accessToken: ?string;
    dateFormat = 'yyyy-MM-dd';
    timeFormat = 'HH:mm';
    dateTimeFormat = `${this.dateFormat}'T'${this.timeFormat}`;

    constructor(clientId: string, secret: string) {
        super('https://api.fitbit.com', [
            new DefaultResponseProcessor(FitbitApiException),
            new ResponseProcessor(),
        ]);
        this.clientId = clientId;
        this.secret = secret;
    }

    getDateString(date: DateTime) {
        return date.toFormat(this.dateFormat);
    }

    getDateTimeString(date: DateTime) {
        return date.toFormat(this.dateTimeFormat);
    }

    setAccessToken(token: string) {
        this.accessToken = token;
        this.setDefaultHeader('Authorization', `Bearer ${token}`);
    }

    getAccessToken(): ?string {
        return this.accessToken;
    }

    getLoginUrl(
        redirectUri: string,
        scope: Array<Scope>,
        {
            responseType = 'code',
            prompt,
            expiresIn,
            state,
        }: {
            responseType: ResponseType,
            prompt: ?Prompt,
            expiresIn: ?number,
            state: ?string,
        } = {},
    ): string {
        return `https://www.fitbit.com/oauth2/authorize${ApiBase.convertParametersToUrl({
            response_type: responseType,
            client_id: this.clientId,
            redirect_uri: redirectUri,
            scope: scope.join(' '),
            ...(prompt ? { prompt } : {}),
            ...(state ? { state } : {}),
            ...(expiresIn ? { expires_in: expiresIn } : {}),
        })}`;
    }

    async requestToken(parameters: Object): Promise<Token> {
        const response = await this.request(
            `oauth2/token${ApiBase.convertParametersToUrl(parameters)}`,
            'POST',
            {},
            {
                'content-type': 'application/x-www-form-urlencoded',
                Authorization: `Basic ${base64Encode(`${this.clientId}:${this.secret}`)}`,
            },
        );

        this.setAccessToken(response.data.access_token);

        return {
            ...response.data,
            expireDate: DateTime.utc().plus({ seconds: response.data.expires_in }).toISO(),
        };
    }

    requestAccessToken(code: string, redirectUri: string, expiresIn: ?number, state: ?string): Promise<ApiToken> {
        return this.requestToken({
            code,
            grant_type: 'authorization_code',
            client_id: this.clientId,
            redirect_uri: redirectUri,
            ...(expiresIn ? { expires_in: expiresIn } : {}),
            ...(state ? { state } : {}),
        });
    }

    extendAccessToken(token: string, expiresIn: ?number): Promise<ApiToken> {
        return this.requestToken({
            refresh_token: token,
            grant_type: 'refresh_token',
            ...(expiresIn ? { expires_in: expiresIn } : {}),
        });
    }

    getApiUrl(namespace: string, userId: ?string, version: string = '1', file: string = 'json'): string {
        return `${version}/user/${userId || '-'}/${namespace}.${file}`;
    }

    async getIntradayData(
        resource: IntradayResource,
        from: DateTime,
        to: ?DateTime,
        detail: DetailLevel = '1min',
    ): Promise<IntradayResponse> {
        const until = to || from.endOf('day');

        // eslint-disable-next-line max-len
        const response = await this.get(this.getApiUrl(`activities/${resource}/date/${from.toFormat(this.dateFormat)}/${until.toFormat(this.dateFormat)}/${detail}/time/${from.toFormat(this.timeFormat)}/${until.toFormat(this.timeFormat)}`));

        const sets = response.data[`activities-${resource}-intraday`].dataset.map((set: { value: number, time: string }) => {
            return {
                time: DateTime.fromFormat(`${from.toFormat(this.dateFormat)}${set.time}`, `${this.dateFormat}HH:mm:ss`),
                value: set.value,
            };
        });

        return {
            total: Number(response.data[`activities-${resource}`][0].value),
            sets,
        };
    }

    async getActivitySummary(date: DateTime | string, userId: ?string): Promise<ActivitySummaryResponse> {
        const url = this.getApiUrl(`activities/date/${typeof date === 'string' ? date : date.toFormat(this.dateFormat)}`, userId);
        const { data } = await this.get(url);
        return {
            ...data,
            activities: data.activities.map((activity) => {
                return ActivityFactory.getActivityFromApi(activity);
            }),
        };
    }

    // eslint-disable-next-line complexity
    async getActivities(filters: ActivityFilters): Promise<ActivityResponse> {
        const {
            afterDate,
            beforeDate,
            limit,
            offset,
        } = filters;

        const { data } = await this.get(this.getApiUrl('activities/list'), {
            sort: afterDate ? 'asc' : 'desc',
            offset: offset || 0,
            limit: limit || 10,
            ...(afterDate ? { afterDate: typeof afterDate === 'string' ? afterDate : this.getDateTimeString(afterDate) } : {}),
            ...(beforeDate ? { beforeDate: typeof beforeDate === 'string' ? beforeDate : this.getDateTimeString(beforeDate) } : {}),
        });

        return {
            ...data,
            activities: data.activities.map((activity: ApiActivity) => {
                return ActivityFactory.getActivityFromApi(activity);
            }),
        };
    }

    async getActivitiesBetweenDates(from: DateTime, to: DateTime): Promise<ActivityResponse> {
        const data = await this.getActivities({
            afterDate: from,
        });

        return {
            ...data,
            // $FlowFixMe
            activities: data.activities.filter(activity => activity.getStart() <= to),
        };
    }

    async processActivities(
        filter: ActivityFilters,
        processor: (activity: Activity) => Promise<Activity>,
    ): Promise<Array<Activity>> {
        const { activities, pagination } = await this.getActivities(filter);

        const processorPromises = activities.map((workout) => {
            return processor(workout);
        });

        if (pagination.next) {
            const data = queryString.parseUrl(pagination.next).query;
            processorPromises.push(...await this.processActivities(data, processor));
        }

        return Promise.all(processorPromises);
    }

    /**
     * https://dev.fitbit.com/build/reference/web-api/activity/#activity-logging
     *
     * @param activity
     * @returns {Promise<Activity>}
     */
    async logActivity(activity: Activity): Promise<Activity> {
        const calories = activity.getCalories();
        const distance = activity.getDistance();

        const parameters = {
            date: activity.getStart().toFormat(this.dateFormat),
            startTime: activity.getStart().toFormat(this.timeFormat),
            durationMillis: activity.getDuration().as('milliseconds'),
            activityId: activity.getTypeId(),
            ...(calories != null ? { manualCalories: Math.round(calories) } : {}),
            ...(distance != null ? { distance: distance.toNumber('km') } : {}),
        };

        const { data } = await this.post(this.getApiUrl('activities'), parameters, Api.FORMATS.FORM_DATA_FORMAT);

        return ActivityFactory.getActivityFromApi(data.activityLog);
    }

    async requestSubscription(
        method: 'POST' | 'DELETE' | 'GET',
        collection: ?SubscriptionCollection,
        id: ?string,
        subscriberId: ?number,
    ): Promise<Object> {
        const { data } = await this.request(
            this.getApiUrl(`${collection ? `${collection}/` : ''}apiSubscriptions${id ? `/${id}` : ''}`),
            method,
            {},
            {
                ...(subscriberId ? { 'X-Fitbit-Subscriber-Id': subscriberId } : {}),
            },
        );
        return data;
    }

    /**
     * https://dev.fitbit.com/build/reference/web-api/subscriptions/#adding-a-subscription
     *
     * @param id
     * @param collection
     * @param subscriberId
     * @returns {Promise<SubscriptionResponse>}
     */
    async addSubscription(id: string, collection: ?SubscriptionCollection, subscriberId: ?number): Promise<SubscriptionResponse> {
        const data = await this.requestSubscription('POST', collection, id, subscriberId);

        return {
            ...data,
            subscriberId: Number(data.subscriberId),
            subscriptionId: Number(data.subscriptionId),
        };
    }

    /**
     * https://dev.fitbit.com/build/reference/web-api/subscriptions/#deleting-a-subscription
     *
     * @param id
     * @param collection
     * @param subscriberId
     * @returns {Promise<Object>}
     */
    deleteSubscription(id: string, collection: ?SubscriptionCollection, subscriberId: ?number): Promise<Object> {
        return this.requestSubscription('DELETE', collection, id, subscriberId);
    }

    /**
     * https://dev.fitbit.com/build/reference/web-api/subscriptions/#getting-a-list-of-subscriptions
     *
     * @param collection
     * @returns {Promise<void>}
     */
    async getSubscriptions(collection: ?SubscriptionCollection): Promise<Array<SubscriptionResponse>> {
        const data = await this.requestSubscription('GET', collection);
        return data.apiSubscriptions;
    }
}
