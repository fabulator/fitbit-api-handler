import { ApiResponseType } from 'rest-api-handler';
import FitbitException from './FitbitException';

interface Error {
    errorType: string;
    fieldName: string;
    message: string;
}

export default class FitbitApiException extends FitbitException {
    private response: ApiResponseType<any>;

    private request: Request;

    public constructor(response: ApiResponseType<any>, request: Request) {
        const { data } = response;
        super(data.errors ? data.errors.map((item: { message: any[] }) => item.message).join(', ') : JSON.stringify(data));
        this.response = response;
        this.request = request;
    }

    public getErrors(): Error[] {
        return this.response.data.errors;
    }

    public hasError(error: string): boolean {
        return !!this.getErrors().find((item) => item.errorType === error);
    }

    public getResponse(): ApiResponseType<any> {
        return this.response;
    }

    public getRequest(): Request {
        return this.request;
    }
}
