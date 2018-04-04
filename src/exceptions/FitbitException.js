// @flow
export default class FitbitException extends Error {
    constructor(message: string) {
        super(`Fitbit Error: ${message}`);
    }
}
