import { Duration } from 'luxon';
import getRateLimits from '../helpers/getRateLimits';
import FitbitApiException from './FitbitApiException';

export default class FitbitApiLimitException extends FitbitApiException {
    public retryIn() {
        const { rateReset } = getRateLimits(this.getResponse().source.headers);
        return rateReset as Duration;
    }
}
