// @flow
import type { ApiResponseType } from 'rest-api-handler/src';
import FitbitException from './FitbitException';

export default class FitbitApiException extends FitbitException {
    response: ApiResponseType<*>;
    request: Request;

    constructor(response: ApiResponseType<*>, request: Request) {
        super(JSON.stringify(response.data));
        this.response = response;
        this.request = request;
    }
}
