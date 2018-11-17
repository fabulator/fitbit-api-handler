import {
    CALORIES,
    STEPS,
    DISTANCE,
    FLOORS,
    ELEVATION,
    HEART,
} from '../constants/intraday-resources';

export type IntradayResource = typeof CALORIES |
    typeof STEPS |
    typeof DISTANCE |
    typeof FLOORS |
    typeof ELEVATION |
    typeof HEART;
