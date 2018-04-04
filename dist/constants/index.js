'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const BIKE = 90001;
const RUNNING = 90009;
const FENCING = 15200;
const WALKING = 90013;
const SKATEBOARDING = 15580;
const YOGA = 52000;
const SWIMMING = 90024;

var activityTypes = Object.freeze({
	BIKE: BIKE,
	RUNNING: RUNNING,
	FENCING: FENCING,
	WALKING: WALKING,
	SKATEBOARDING: SKATEBOARDING,
	YOGA: YOGA,
	SWIMMING: SWIMMING
});

const CALORIES = 'calories';
const STEPS = 'steps';
const DISTANCE = 'distance';
const FLOORS = 'floors';
const ELEVATION = 'elevation';
const HEART = 'heart';

var intradayResources = Object.freeze({
	CALORIES: CALORIES,
	STEPS: STEPS,
	DISTANCE: DISTANCE,
	FLOORS: FLOORS,
	ELEVATION: ELEVATION,
	HEART: HEART
});

const ACTIVITY = 'activity';
const HEARTRATE = 'heartrate';
const LOCATION = 'location';
const NUTRITION = 'nutrition';
const PROFILE = 'profile';
const SETTINGS = 'settings';
const SLEEP = 'sleep';
const SOCIAL = 'social';
const WEIGHT = 'weight';

var scopes = Object.freeze({
	ACTIVITY: ACTIVITY,
	HEARTRATE: HEARTRATE,
	LOCATION: LOCATION,
	NUTRITION: NUTRITION,
	PROFILE: PROFILE,
	SETTINGS: SETTINGS,
	SLEEP: SLEEP,
	SOCIAL: SOCIAL,
	WEIGHT: WEIGHT
});

exports.ACTIVITY_TYPES = activityTypes;
exports.INTRADAY_RESOURCES = intradayResources;
exports.SCOPES = scopes;
