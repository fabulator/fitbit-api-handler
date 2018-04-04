// @flow
export const CALORIES: 'calories' = 'calories';
export const STEPS: 'steps' = 'steps';
export const DISTANCE: 'distance' = 'distance';
export const FLOORS: 'floors' = 'floors';
export const ELEVATION: 'elevation' = 'elevation';
export const HEART: 'heart' = 'heart';

export type IntradayResource = typeof CALORIES |
    typeof STEPS |
    typeof DISTANCE |
    typeof FLOORS |
    typeof ELEVATION |
    typeof HEART;
