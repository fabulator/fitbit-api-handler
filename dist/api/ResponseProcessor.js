'use strict';

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

module.exports = ResponseProcessor;
