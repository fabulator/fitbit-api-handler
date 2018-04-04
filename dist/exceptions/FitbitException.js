'use strict';

class FitbitException extends Error {
    constructor(message) {
        super(`Fitbit Error: ${message}`);
    }
}

module.exports = FitbitException;
