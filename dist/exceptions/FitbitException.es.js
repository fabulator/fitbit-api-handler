class FitbitException extends Error {
    constructor(message) {
        super(`Fitbit Error: ${message}`);
    }
}

export default FitbitException;
