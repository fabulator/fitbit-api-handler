import {
    BIKE,
    RUNNING,
    FENCING,
    WALKING,
    SKATEBOARDING,
    YOGA,
    SWIMMING,
    CIRKUIT_TRAINING,
    WEIGHT_TRAINING,
} from '../constants/activity-types';

export type ActivityType = typeof BIKE |
    typeof RUNNING |
    typeof FENCING |
    typeof WALKING |
    typeof SKATEBOARDING |
    typeof YOGA |
    typeof SWIMMING |
    typeof CIRKUIT_TRAINING |
    typeof WEIGHT_TRAINING |
    number;
