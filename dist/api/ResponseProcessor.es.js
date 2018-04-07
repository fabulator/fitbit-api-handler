class FitbitException extends Error {
    constructor(message) {
        super(`Fitbit Error: ${message}`);
    }
}

// eslint-disable-next-line no-unused-vars


class FitbitApiException extends FitbitException {

    constructor(response, request) {
        super(response.data.errors.map(item => item.message).join(', '));
        this.response = response;
        this.request = request;
    }

    getErrors() {
        return this.response.data.errors;
    }

    hasError(error) {
        return typeof this.getErrors().find(item => item.errorType === error) === 'string';
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

export default ResponseProcessor;
