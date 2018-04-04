// @flow
import type { ProcessedResponse } from 'rest-api-handler/src';
import { FitbitApiException } from './../exceptions';

function tryParseJson(json: string): Object | string {
    try {
        return JSON.parse(json);
    } catch (error) {
        return json;
    }
}

export default class ResponseProcessor {
    processResponse: (response: ProcessedResponse, request: Request) => Promise<ProcessedResponse>;

    async processResponse(response: ProcessedResponse, request: Request): Promise<ProcessedResponse> {
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
