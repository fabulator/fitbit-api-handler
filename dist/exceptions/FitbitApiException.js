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

module.exports = FitbitApiException;
