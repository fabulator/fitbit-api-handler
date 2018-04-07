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

export default FitbitApiException;
