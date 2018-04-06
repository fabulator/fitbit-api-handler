import math from 'mathjs';
import { DateTime, Duration } from 'luxon';
import { Api, DefaultResponseProcessor } from 'rest-api-handler/dist';
import queryString from 'query-string';

class FitbitException extends Error {
    constructor(message) {
        super(`Fitbit Error: ${message}`);
    }
}

class FitbitApiException extends FitbitException {

    constructor(response, request) {
        super(JSON.stringify(response.data));
        this.response = response;
        this.request = request;
    }
}

class Activity {

    // eslint-disable-next-line complexity
    constructor({
        start,
        id,
        duration,
        typeName,
        typeId,
        heartRateAvg,
        calories,
        distance,
        steps,
        tcxLink,
        source
    }) {
        this.start = start;
        this.duration = duration;
        this.typeId = typeId;

        this.id = id != null ? id : null;
        this.typeName = typeName != null ? typeName : null;
        this.heartRateAvg = heartRateAvg != null ? heartRateAvg : null;
        this.calories = calories != null ? calories : null;
        this.distance = distance != null ? distance : null;
        this.steps = steps != null ? steps : null;
        this.tcxLink = tcxLink != null ? tcxLink : null;
        this.source = source != null ? source : null;
    }

    getId() {
        return this.id;
    }

    setId(id) {
        this.id = id;
        return this;
    }

    getTypeId() {
        return this.typeId;
    }

    setTypeId(typeId) {
        this.typeId = typeId;
        return this;
    }

    getTypeName() {
        return this.typeName;
    }

    getStart() {
        return this.start;
    }

    setStart(start) {
        this.start = start;
        return this;
    }

    getEnd() {
        return this.getStart().plus(this.getDuration());
    }

    getDuration() {
        return this.duration;
    }

    setDuration(duration) {
        this.duration = duration;
        return this;
    }

    getDistance() {
        return this.distance;
    }

    setDistance(distance) {
        this.distance = distance;
        return this;
    }

    getCalories() {
        return this.calories;
    }

    setCalories(calories) {
        this.calories = calories;
        return this;
    }

    getAvgHeartRate() {
        return this.heartRateAvg;
    }

    setAvgHeartRate(hr) {
        this.heartRateAvg = hr;
        return this;
    }

    getSource() {
        return this.source;
    }

    getSteps() {
        return this.steps;
    }

    getTcxLink() {
        return this.tcxLink;
    }

    toString() {
        const distance = this.getDistance();

        return [`Workout ${this.getId() || ''}`, `type: ${this.getTypeName() || 'uknown'}`, `start: ${this.getStart().toFormat('yyyy-MM-dd HH:mm')}`, distance !== null ? `distance: ${Math.round(distance.toNumber('km') * 10) / 10}km` : null, `duration: ${Math.round(this.getDuration().as('minutes'))}min`].filter(item => item !== null).join('; ');
    }
}

class ActivityFactory {
    static getActivityFromApi(activity) {
        const { distance } = activity;

        const activityId = activity.activityTypeId || activity.activityId;
        if (!activityId) {
            throw new FitbitException('Activity type ID was not found in API response.');
        }

        return new Activity({
            start: DateTime.fromISO(activity.startTime),
            id: activity.logId,
            duration: Duration.fromMillis(activity.duration),
            typeName: activity.activityName || activity.name,
            typeId: activityId,
            heartRateAvg: activity.averageHeartRate,
            calories: activity.calories,
            distance: distance != null ? math.unit(activity.distance, 'km') : null,
            steps: activity.steps,
            tcxLink: activity.tcxLink,
            source: activity
        });
    }

    // eslint-disable-next-line max-params
    static get(typeId, start, duration, distance, calories) {
        return new Activity({
            calories,
            typeId,
            start,
            duration,
            distance
        });
    }
}

var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];

    for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }

  return target;
};

function tryParseJson(json) {
    try {
        return JSON.parse(json);
    } catch (error) {
        return json;
    }
}

class ResponseProcessor {

    async processResponse(response, request) {
        const { data } = response;
        const processedData = typeof data === 'string' ? tryParseJson(data) : data;

        const processedResponse = _extends({}, response, {
            data: processedData
        });

        if (typeof processedData === 'object' && processedData.errors) {
            throw new FitbitApiException(processedResponse, request);
        }

        return processedResponse;
    }
}

function base64Encode(string) {
    if (typeof btoa !== 'undefined') {
        // eslint-disable-next-line no-undef
        return btoa(string);
    }

    return Buffer.from(string).toString('base64');
}

class Api$1 extends Api {

    constructor(clientId, secret) {
        super('https://api.fitbit.com', [new DefaultResponseProcessor(FitbitApiException), new ResponseProcessor()]);
        this.dateFormat = 'yyyy-MM-dd';
        this.timeFormat = 'HH:mm';
        this.dateTimeFormat = `${this.dateFormat}'T'${this.timeFormat}`;
        this.clientId = clientId;
        this.secret = secret;
    }

    getDateString(date) {
        return date.toFormat(this.dateFormat);
    }

    getDateTimeString(date) {
        return date.toFormat(this.dateTimeFormat);
    }

    setAccessToken(token) {
        this.accessToken = token;
        this.setDefaultHeader('Authorization', `Bearer ${token}`);
    }

    getAccessToken() {
        return this.accessToken;
    }

    getLoginUrl(redirectUri, scope, {
        responseType = 'code',
        prompt,
        expiresIn,
        state
    } = {}) {
        return `https://www.fitbit.com/oauth2/authorize${Api.convertParametersToUrl(_extends({
            response_type: responseType,
            client_id: this.clientId,
            redirect_uri: redirectUri,
            scope: scope.join(' ')
        }, prompt ? { prompt } : {}, state ? { state } : {}, expiresIn ? { expires_in: expiresIn } : {}))}`;
    }

    async requestToken(parameters) {
        const response = await this.request(`oauth2/token${Api.convertParametersToUrl(parameters)}`, 'POST', {}, {
            'content-type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${base64Encode(`${this.clientId}:${this.secret}`)}`
        });

        this.setAccessToken(response.data.access_token);

        return _extends({}, response.data, {
            expireDate: DateTime.utc().plus({ seconds: response.data.expires_in }).toISO()
        });
    }

    requestAccessToken(code, redirectUri, expiresIn, state) {
        return this.requestToken(_extends({
            code,
            grant_type: 'authorization_code',
            client_id: this.clientId,
            redirect_uri: redirectUri
        }, expiresIn ? { expires_in: expiresIn } : {}, state ? { state } : {}));
    }

    extendAccessToken(token, expiresIn) {
        return this.requestToken(_extends({
            refresh_token: token,
            grant_type: 'refresh_token'
        }, expiresIn ? { expires_in: expiresIn } : {}));
    }

    getApiUrl(namespace, userId, version = '1', file = 'json') {
        return `${version}/user/${userId ? userId.toString() : '-'}/${namespace}.${file}`;
    }

    async getIntradayData(resource, from, to, detail = '1min') {
        const until = to || from.endOf('day');

        // eslint-disable-next-line max-len
        const response = await this.get(this.getApiUrl(`activities/${resource}/date/${from.toFormat(this.dateFormat)}/${until.toFormat(this.dateFormat)}/${detail}/time/${from.toFormat(this.timeFormat)}/${until.toFormat(this.timeFormat)}`));

        const sets = response.data[`activities-${resource}-intraday`].dataset.map(set$$1 => {
            return {
                time: DateTime.fromFormat(`${from.toFormat(this.dateFormat)}${set$$1.time}`, `${this.dateFormat}HH:mm:ss`),
                value: set$$1.value
            };
        });

        return {
            total: Number(response.data[`activities-${resource}`][0].value),
            sets
        };
    }

    async getActivitySummary(date, userId) {
        const url = this.getApiUrl(`activities/date/${typeof date === 'string' ? date : date.toFormat(this.dateFormat)}`, userId);
        const { data } = await this.get(url);
        return _extends({}, data, {
            activities: data.activities.map(activity => {
                return ActivityFactory.getActivityFromApi(activity);
            })
        });
    }

    // eslint-disable-next-line complexity
    async getActivities(filters) {
        const {
            afterDate,
            beforeDate,
            limit,
            offset
        } = filters;

        const { data } = await this.get(this.getApiUrl('activities/list'), _extends({
            sort: afterDate ? 'asc' : 'desc',
            offset: offset || 0,
            limit: limit || 10
        }, afterDate ? { afterDate: typeof afterDate === 'string' ? afterDate : this.getDateTimeString(afterDate) } : {}, beforeDate ? { beforeDate: typeof beforeDate === 'string' ? beforeDate : this.getDateTimeString(beforeDate) } : {}));

        return _extends({}, data, {
            activities: data.activities.map(activity => {
                return ActivityFactory.getActivityFromApi(activity);
            })
        });
    }

    async getActivityBetweenDates(from, to) {
        const { activities } = await this.getActivities({
            afterDate: from
        });

        const activity = activities[0];

        if (!activity) {
            return null;
        }

        // $FlowFixMe
        if (activity.getStart() <= to) {
            return activity;
        }

        return null;
    }

    async processActivities(filter, processor) {
        const { activities, pagination } = await this.getActivities(filter);

        const processorPromises = activities.map(workout => {
            return processor(workout);
        });

        if (pagination.next) {
            const data = queryString.parseUrl(pagination.next).query;
            processorPromises.push(...(await this.processActivities(data, processor)));
        }

        return Promise.all(processorPromises);
    }

    /**
     * https://dev.fitbit.com/build/reference/web-api/activity/#activity-logging
     *
     * @param activity
     * @returns {Promise<Activity>}
     */
    async logActivity(activity) {
        const calories = activity.getCalories();
        const distance = activity.getDistance();

        const parameters = _extends({
            date: activity.getStart().toFormat(this.dateFormat),
            startTime: activity.getStart().toFormat(this.timeFormat),
            durationMillis: activity.getDuration().as('milliseconds'),
            activityId: activity.getTypeId()
        }, calories != null ? { manualCalories: Math.round(calories) } : {}, distance != null ? { distance: distance.toNumber('km') } : {});

        const { data } = await this.post(this.getApiUrl('activities'), parameters, Api$1.FORMATS.FORM_DATA_FORMAT);

        return ActivityFactory.getActivityFromApi(data.activityLog);
    }

    async requestSubscription(method, collection, id, subscriberId) {
        const { data } = await this.request(this.getApiUrl(`${collection ? `${collection}/` : ''}apiSubscriptions${id ? `/${id}` : ''}`), method, {}, _extends({}, subscriberId ? { 'X-Fitbit-Subscriber-Id': subscriberId } : {}));
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
    async addSubscription(id, collection, subscriberId) {
        const data = await this.requestSubscription('POST', collection, id, subscriberId);

        return _extends({}, data, {
            subscriberId: Number(data.subscriberId),
            subscriptionId: Number(data.subscriptionId)
        });
    }

    /**
     * https://dev.fitbit.com/build/reference/web-api/subscriptions/#deleting-a-subscription
     *
     * @param id
     * @param collection
     * @param subscriberId
     * @returns {Promise<Object>}
     */
    deleteSubscription(id, collection, subscriberId) {
        return this.requestSubscription('DELETE', collection, id, subscriberId);
    }

    /**
     * https://dev.fitbit.com/build/reference/web-api/subscriptions/#getting-a-list-of-subscriptions
     *
     * @param collection
     * @returns {Promise<void>}
     */
    async getSubscriptions(collection) {
        const data = await this.requestSubscription('GET', collection);
        return data.apiSubscriptions.map(subscription => {
            return _extends({}, subscription, {
                subscriberId: Number(subscription.subscriberId),
                subscriptionId: Number(subscription.subscriptionId)
            });
        });
    }
}

export default Api$1;
