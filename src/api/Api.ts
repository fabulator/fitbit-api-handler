/* eslint-disable max-lines */
import {
    Api as ApiBase,
    DefaultResponseProcessor,
    ApiResponseType,
} from 'rest-api-handler';
import { parseUrl } from 'query-string';
import { DateTime } from 'luxon';
import { FitbitApiException } from '../exceptions';
import { Activity } from '../models';
import {
    IntradayResource,
    ApiToken,
    ActivityFilters,
    ApiActivity,
    ApiSleep,
    Scope,
    SubscriptionCollection,
    DateFilters,
} from '../types';
import ResponseProcessor from './ResponseProcessor';

type ResponseType = 'code' | 'token';
type Prompt = 'consent' | 'login' | 'login consent' | 'none';
type DetailLevel = '1sec' | '1min' | '15min';

type Pagination = {
    afterDate?: string,
    limit: number,
    next: string,
    offset: number,
    previous: string,
    sort: string,
};

export type ActivityResponse = {
    activities: Array<Activity>,
    pagination: Pagination,
};

export type SleepProcessedResponse = {
    sleep: Array<{
        dateOfSleep: string,
        duration: number,
        efficiency: number,
        endTime: DateTime,
        infoCode: number,
        levels: Object,
        logId: number,
        minutesAfterWakeup: number,
        minutesAsleep: number,
        minutesAwake: number,
        minutesToFallAsleep: number,
        startTime: DateTime,
        timeInBed: number,
        type: string,
    }>,
    pagination: Pagination,
};

export type IntradayResponse = {
    total: number,
    sets: Array<{
        time: DateTime,
        value: number,
    }>,
};

export type SubscriptionResponse = {
    collectionType: string,
    ownerId: string,
    ownerType: string,
    subscriberId: string,
    subscriptionId: string,
};

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
};

export type Token = ApiToken & {
    expireDate: string,
};

function base64Encode(string: string): string {
    if (typeof btoa !== 'undefined') {
        // eslint-disable-next-line no-undef
        return btoa(string);
    }

    return Buffer.from(string).toString('base64');
}

export default class Api extends ApiBase<ApiResponseType<any>> {
    private clientId: string;

    private secret: string;

    private accessToken: string | null = null;

    private dateFormat = 'yyyy-MM-dd';

    private timeFormat = 'HH:mm';

    private dateTimeFormat = `${this.dateFormat}'T'${this.timeFormat}`;

    public constructor(clientId: string, secret: string) {
        super('https://api.fitbit.com', [
            new DefaultResponseProcessor(FitbitApiException),
            new ResponseProcessor(),
        ]);
        this.clientId = clientId;
        this.secret = secret;
    }

    private getDateString(date: DateTime) {
        return date.toFormat(this.dateFormat);
    }

    private getDateTimeString(date: DateTime) {
        return date.toFormat(this.dateTimeFormat);
    }

    public setAccessToken(token: string) {
        this.accessToken = token;
        this.setDefaultHeader('Authorization', `Bearer ${token}`);
    }

    public getAccessToken(): string | null {
        return this.accessToken;
    }

    public getLoginUrl(
        redirectUri: string,
        scope: Array<Scope>,
        {
            responseType = 'code',
            prompt,
            expiresIn,
            state,
        }: {
            responseType: ResponseType,
            prompt?: Prompt,
            expiresIn?: number,
            state?: string,
        },
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

    public async requestToken(parameters: Object): Promise<Token> {
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

    public requestAccessToken(code: string, redirectUri: string, expiresIn?: number, state?: string): Promise<ApiToken> {
        return this.requestToken({
            code,
            grant_type: 'authorization_code',
            client_id: this.clientId,
            redirect_uri: redirectUri,
            ...(expiresIn ? { expires_in: expiresIn } : {}),
            ...(state ? { state } : {}),
        });
    }

    public extendAccessToken(token: string, expiresIn?: number): Promise<ApiToken> {
        return this.requestToken({
            refresh_token: token,
            grant_type: 'refresh_token',
            ...(expiresIn ? { expires_in: expiresIn } : {}),
        });
    }

    private getApiUrl(namespace: string, userId?: string, version = '1', file = 'json'): string {
        return `${version}/user/${userId || '-'}/${namespace}.${file}`;
    }

    public async getIntradayData(
        resource: IntradayResource,
        from: DateTime,
        to?: DateTime,
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

    public async getActivitySummary(date: DateTime | string, userId?: string): Promise<ActivitySummaryResponse> {
        const url = this.getApiUrl(`activities/date/${typeof date === 'string' ? date : date.toFormat(this.dateFormat)}`, userId);
        const { data } = await this.get(url);
        return {
            ...data,
            activities: data.activities.map((activity: ApiActivity) => {
                return Activity.fromApi(activity);
            }),
        };
    }

    // eslint-disable-next-line complexity
    private processDateFilters(filters: DateFilters) {
        const {
            afterDate,
            beforeDate,
            limit,
            offset,
        } = filters;

        return {
            sort: afterDate ? 'asc' : 'desc',
            offset: offset || 0,
            limit: limit || 10,
            ...(afterDate ? { afterDate: typeof afterDate === 'string' ? afterDate : this.getDateTimeString(afterDate) } : {}),
            ...(beforeDate ? { beforeDate: typeof beforeDate === 'string' ? beforeDate : this.getDateTimeString(beforeDate) } : {}),
        };
    }

    public async getSleeps(filters: DateFilters): Promise<SleepProcessedResponse> {
        const { data } = await this.get(
            this.getApiUrl('sleep/list', undefined, '1.2'),
            this.processDateFilters(filters),
        );

        return {
            ...data,
            sleep: data.sleep.map((sleep: ApiSleep) => {
                return {
                    ...sleep,
                    endTime: DateTime.fromISO(sleep.endTime),
                    startTime: DateTime.fromISO(sleep.startTime),
                };
            }),
        };
    }

    public async getActivity(activityId: number): Promise<Activity> {
        const { data } = await this.get(this.getApiUrl(`activities/${activityId}`, undefined, '1.1'));
        return Activity.fromApi(data.activityLog);
    }

    // eslint-disable-next-line complexity
    public async getActivities(filters: ActivityFilters): Promise<ActivityResponse> {
        const { data } = await this.get(this.getApiUrl('activities/list'), this.processDateFilters(filters));

        return {
            ...data,
            activities: data.activities.map((activity: ApiActivity) => {
                return Activity.fromApi(activity);
            }),
        };
    }

    public async getActivitiesBetweenDates(from: DateTime, to: DateTime): Promise<ActivityResponse> {
        const data = await this.getActivities({
            afterDate: from,
        });

        return {
            ...data,
            // $FlowFixMe
            activities: data.activities.filter(activity => activity.getStart() <= to),
        };
    }

    public async processActivities(
        filter: ActivityFilters,
        processor: (activity: Activity) => Promise<Activity>,
    ): Promise<Array<Activity>> {
        const { activities, pagination } = await this.getActivities(filter);

        const processorPromises = activities.map((workout) => {
            return processor(workout);
        });

        if (pagination.next) {
            const data: Object = parseUrl(pagination.next).query;
            // @ts-ignore
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
    public async logActivity(activity: Activity): Promise<Activity> {
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

        const { data } = await this.post(this.getApiUrl('activities'), parameters, Api.FORMATS.FORM_DATA);

        return Activity.fromApi(data.activityLog);
    }

    public async requestSubscription(
        method: 'POST' | 'DELETE' | 'GET',
        collection?: SubscriptionCollection,
        id?: string,
        subscriberId?: number,
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
    public async addSubscription(id: string, collection?: SubscriptionCollection, subscriberId?: number): Promise<SubscriptionResponse> {
        const data: any = await this.requestSubscription('POST', collection, id, subscriberId);

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
    public deleteSubscription(id: string, collection?: SubscriptionCollection, subscriberId?: number): Promise<Object> {
        return this.requestSubscription('DELETE', collection, id, subscriberId);
    }

    /**
     * https://dev.fitbit.com/build/reference/web-api/subscriptions/#getting-a-list-of-subscriptions
     *
     * @param collection
     * @returns {Promise<void>}
     */
    public async getSubscriptions(collection?: SubscriptionCollection): Promise<Array<SubscriptionResponse>> {
        const data: any = await this.requestSubscription('GET', collection);
        return data.apiSubscriptions;
    }
}