import { ApiResponseType } from 'rest-api-handler';
import { FitbitApiException } from '../exceptions';

function tryParseJson(json: string): Record<string, any> | string {
    try {
        return JSON.parse(json);
    } catch (exception) {
        return json;
    }
}

export default class ResponseProcessor {
    public async processResponse(response: ApiResponseType<any>, request: Request): Promise<ApiResponseType<any>> {
        const { data } = response;
        const processedData = typeof data === 'string' ? tryParseJson(data) : data;

        const processedResponse = {
            ...response,
            data: processedData,
        };

        if (typeof processedData === 'object' && processedData.errors) {
            throw new FitbitApiException(processedResponse, request);
        }

        return processedResponse;
    }
}
