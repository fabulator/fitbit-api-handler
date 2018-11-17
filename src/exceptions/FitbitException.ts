export default class FitbitException extends Error {
    public constructor(message: string) {
        super(`Fitbit Error: ${message}`);
    }
}
