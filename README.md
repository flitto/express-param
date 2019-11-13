# express-param

Middleware for parsing Express.js request parameters

[![Build Status](https://travis-ci.com/flitto/express-param.svg?branch=master)](https://travis-ci.com/flitto/express-param)
<span class="badge-npmversion"><a href="https://npmjs.org/package/express-param" title="View this project on NPM"><img src="https://img.shields.io/npm/v/express-param.svg" alt="NPM version" /></a></span>


## About

You can use this library to remove redundancies in your code and to improve readability.

For example, you may have something like
```js
function route(req, res, next) {
  var id = req.params.id
    , count = req.param('count') ? parseInt(req.param('count'), 10) : 10
    , order = req.param('order')
    , type = req.param('type')
    , name = req.param('name')
    , since = req.param('since')
    , from = req.param('from')
    , res_id = req.param('res_id');

  if (!res_id) return next(400);
  if (!name) return next(400);
  if (!order) order = 'desc';
  if (!type) type = 'integer';

  // some code...
}
```

Using this library, the code above is reduced to
```js
function route(req, res, next) {
  var requiredParams = ['{id}', 'name', 'res_id']
    , optionalParams = ['int:id', 'int32:sum', 'uint32:max', 'float:avg', 'number:count|=10', 'order|=desc', 'type|=integer', 'since', 'from']
    , options;

  options = req.fetchParamter(requiredParams, optionalParams);

  if (req.checkParamErr(options)) return next(options);

  return res.send(options);
}
```

## Parameter syntax

Our parameter syntax was inspired by Spring Framework and Flask.

#### Required parameter : Array
- [element1, element2, element3, ...]
- `type:{parameter_name}`
  - `type` is optional; it defaults to string. `type` can be an `int`, `int32`, `uint32`, `float`, `number` (for backwards compatibility), or `string`.
  - Curly braces in `{parameter_name}` are optional but `parameter_name` is required. Put {} around `parameter_name` to indicate that it is a path variable.
  - Example:
  ```js
  ['number:{id}', 'string:username', 'address']
  ```


#### Optional parameter : Array
- [element1, element2, element3, ...]
- `type:parameter_name|=default_value`
  - `type` is optional; it defaults to string. `type` can be an `int`, `int32`, `unit32`, `float`, `number` (for backwards compatibility), or `string`.
  - `parameter_name` is required.
  - `default_value` is optional. If the request object does not have any specified parameter then assign this default value.
  - Example:
  ```js
  ['int:count', 'order', 'string:option1|=Y']
  ```

#### Parameter with multiple values

Selects the last parameter value for protection from HTTP pollution attacks.

```js
GET /path?id=1&type=number&id=2&name=first&name=second

{id: 2, type: 'number', name: 'second'}
```

If you want to select multiple values from the parameter, use string type after separating the values with commas.

```js
GET /path?id=1,2&type=number&name=first,second

{id: '1,2', type: 'number', name: 'first,second'}
```


## Example

Here is a simple example.

```js
var express = require('express');
var fetcher = require('express-param');
var app = express();
app.use(fetcher());

app.get('/path', function(req, res, next) {
  var requiredParams = ['id'];
  var optionalParams = ['count'];
  var options = req.fetchParamter(requiredParams, optionalParams);

  if (req.checkParamErr(options)) return next(options);

  return res.send(options);
});
```

Here is another example with express-param syntax:

```js
var fetcher = require('express-param');
var app = express();
app.use(fetcher());

app.get('/path/:id/', function(req, res, next) {
  var requiredParams = ['string:{id}'];
  var optionalParams = ['number:count|=10, order|=desc'];
  var options = req.fetchParamter(requiredParams, optionalParams);

  if (req.checkParamErr(options)) return next(options);

  console.log(options);
  {
    id: '10',
    count: 10,
    order: 'desc'
  }

  return res.send(options);
});
```

## Another example

Custom request key name belongs to request property of express:

```js
var express = require('express');
var fetcher = require('express-param');
var app = express();
app.use(fetcher({
  'ipaddr': 'ip'
}));

app.get('/path', function(req, res, next) {
  var requiredParams = ['id'];
  var optionalParams = ['count', 'ipaddr'];
  var options = req.fetchParamter(requiredParams, optionalParams);

  if (options.err) return next(options.err);

  /*
  options.ipaddr is equal to req.ip
  */
  return res.send(options.params);
});
```

## API

- **fetchParameter(required[, optional])**

  Fetch required and optional parameters.


## Add ON

- **fetch geographic information**

  Fetch country information from remote IP addresses!

  ```js
  var addOnOpt = {
    geoip: {
      keyName: 'headers.x-forwarded-for'
    }
  };
  app.use(fetcher({
    'ipaddr': 'ip',
    'geo-info': 'headers.x-fetcher-geoinfo',
    'access-country': true
  }, addOnOpt));

  ////// ....

  console.log(req.headers['x-fetcher-geoinfo']);
  // or console.log(options['geo-info']);
  {
    range: [ 3479299040, 3479299071 ],
    country: 'US',
    region: 'CA',
    city: 'San Francisco',
    ll: [37.7484, -122.4156]
  }

  console.log(options['access-country']);
  'US'

  ```

- **fetch detail imsi information by mnc, mcc code**

  It can generate detail imsi(country, operator...) information by mcc, mnc code!


```js
var addOnOpt = {
  imsi: true
};
app.use(fetcher({
  'ipaddr': 'ip',
  'access-country': true
}, addOnOpt));

////// ....

// The URL may be hostname/api?mnc=11&mcc=450.
// If only mcc is present then the length of the results array may be greater than 1.

console.log(req.headers['x-fetcher-imsi'])
[{
  country_name: 'South Korea',
  country_code: 'KR',
  mcc: '450',
  mnc: '11',
  brand: 'SKTelecom',
  operator: 'Korea Cable Telecom(t-plus), Eco-mobile',
  status: 'Operational',
  bands: 'UMTS 2100'
}]

console.log(options['access-country']);
'KR'
```

## Make contributions

We'd love your contributions! Please send us Pull Requests. Also, read the [contribution guidelines](https://github.com/SungYeolWoo/express-param/blob/master/Contribution.md).



## LICENSE

MIT

---

This product includes GeoLite data created by MaxMind, available from
http://www.maxmind.com
