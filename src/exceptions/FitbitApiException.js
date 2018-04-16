// @flow
import type { ApiResponseType } from 'rest-api-handler/src';
import FitbitException from './FitbitException';

type Error = {
    errorType: string,
    fieldName: string,
    message: string,
};

// eslint-disable-next-line no-unused-vars
type ErrorResponse = ApiResponseType<{
    errors: Array<Error>,
    success: false,
}>;

export default class FitbitApiException extends FitbitException {
    response: ApiResponseType<*>;
    request: Request;

    constructor(response: ApiResponseType<*>, request: Request) {
        const { data } = response;
        super(data.errors ? data.errors.map(item => item.message).join(', ') : JSON.stringify(data));
        this.response = response;
        this.request = request;
    }

    getErrors(): Array<Error> {
        return this.response.data.errors;
    }

    hasError(error: string): boolean {
        return typeof this.getErrors().find(item => item.errorType === error) === 'string';
    }
}
