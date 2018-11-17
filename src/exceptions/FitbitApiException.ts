import { ApiResponseType } from 'rest-api-handler';
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
    private response: ApiResponseType<any>;

    private request: Request;

    public constructor(response: ApiResponseType<any>, request: Request) {
        const { data } = response;
        super(data.errors ? data.errors.map((item: any) => item.message).join(', ') : JSON.stringify(data));
        this.response = response;
        this.request = request;
    }

    public getErrors(): Array<Error> {
        return this.response.data.errors;
    }

    public hasError(error: string): boolean {
        return typeof this.getErrors().find(item => item.errorType === error) === 'string';
    }

    public getResponse(): ApiResponseType<any> {
        return this.response;
    }

    public getRequest(): Request {
        return this.request;
    }
}
