# Fitbit API handler

[![npm version](https://badge.fury.io/js/fitbit-api-handler.svg)](https://badge.fury.io/js/fitbit-api-handler)
[![renovate-app](https://img.shields.io/badge/renovate-app-blue.svg)](https://renovateapp.com/) 
[![Known Vulnerabilities](https://snyk.io/test/github/fabulator/fitbit-api-handler/badge.svg)](https://snyk.io/test/github/fabulator/fitbit-api-handler)
[![codecov](https://codecov.io/gh/fabulator/fitbit-api-handler/branch/master/graph/badge.svg)](https://codecov.io/gh/fabulator/fitbit-api-handler) 
[![travis](https://travis-ci.org/fabulator/fitbit-api-handler.svg?branch=master)](https://travis-ci.org/fabulator/fitbit-api-handler)

This is an unofficial web API SDK for Fitbit. Current focus is to work with activities but it is possible to request all other endpoints.

The library is compiled for node 9.6.

## How it works
I use a library for handling REST API request - [rest-api-handler](https://github.com/fabulator/rest-api-handler). It is based on browser fetch feature so it needs polyfill.

## How to use

Install npm library:

```
npm install fitbit-api-handler --save
```

Include fetch polyfill. I recommend cross-fetch. And you have to include form-data polyfill.

```javascript
require('cross-fetch/polyfill');
global.FormData = require('form-data');
```

### Authentize

Check [authentization methods on Fitbit](https://dev.fitbit.com/build/reference/web-api/oauth2/). First generate url for Login to Fitbit:

```javascript
const { Api, SCOPES } = require('fitbit-api-handler');
const api = new Api(YOUR_CLIENT_ID, YOUR_CLIENT_SECRET);
console.log(api.getLoginUrl(YOUR_RETURN_URL, [SCOPES.ACTIVITY, SCOPES.PROFILE]))
```

After login you will be redirected to YOUR_RETURN_URL with code parameter. Use this code to create authentization token:

```javascript
const token = await api.requestAccessToken(YOUR_CODE, YOUR_RETURN_URL);
api.setAccessToken(token.access_token);

// extend your token
const extendedToken = await api.extendAccessToken(token.refresh_token);
```

Now you can send requests

### Getting activities

Search for activities:

```javascript
const { DateTime } = require('luxon');

const { activities } = await api.getActivities({
    afterDate: DateTime.fromObject({
        year: 2018,
        month: 3,
        day: 1,
    }),
});
console.log(activities);
```

### Create a new activity

To create activity, use ActivityFactory

```javascript
const { DateTime, Duration } = require('luxon');
const math = require('mathjs');
const { Activity, ACTIVITY_TYPES } = require('fitbit-api-handler');

const start = DateTime.fromObject({
    year: 2018,
    month: 3,
    day: 27,
    hour: 5,
    minute: 2,
});

const activity = Activity.get(
    ACTIVITY_TYPES.RUNNING,
    start,
    Duration.fromObject({ minutes: 3 }),
    math.unit(3, 'km'),
);

const createdActivity = await api.createActivity(activity);
```
