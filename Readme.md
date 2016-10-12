# express-param

Express.js request parameters parsing middleware

[![Build Status](https://travis-ci.org/flitto/express-param.svg?branch=master)](https://travis-ci.org/flitto/express-param)
<span class="badge-npmversion"><a href="https://npmjs.org/package/express-param" title="View this project on NPM"><img src="https://img.shields.io/npm/v/express-param.svg" alt="NPM version" /></a></span>

## About

You can reduce amount of code. It can remove redundant code and generate high readability.

See below.

- may be existing

```js
function route(req, res, next) {
  var id = req.params.id
    , count = req.param('count') ? parseInt(req.param('count'), 10) : 10
    , odrer = req.param('order')
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

- after using this

```js
function route(req, res, next) {
  var requiredParams = ['{id}', 'name', 'res_id']
    , optionalParams = ['number:count|=10', 'order|=desc', 'type|=integer', 'since', 'from']
    , options;

  options = req.fetchParamter(requiredParams, optionalParams);

  if (req.checkParamErr(options)) return next(options);

	return res.send(options);
}
```

## parameter syntax

I was inspired by Spring Framework and Flask.
- required parameter
	- Array
    - [element1, element2, element3, ...]
    - type:{parameter_name}
    	- type: type is optional(default string). number or string. return variable with type.
        - {parameter_name}: {} is optional. but parameter name is required. if it include {}, it means that this is path variable
        - ex) ['number:{id1}], 'string:id2', 'id3']
- optional parameter
	- Array
    - [element1, element2, element3, ...]
    - type:parameter_name|=default_value
    	- type: type is optional(default string). number or string. return variable with type.
        - parameter_name: required.
        - default_value: optional. if request object do not have specified parameter then assign this default value.
        - ex) ['number:count', 'order', 'string:option1|=Y']


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

Here is another example with express-param syntax

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
  { id: '10',
    count: 10,
    order: 'desc' }

  return res.send(options);
});
```

## Another example

Custom request key name belong to req property of express

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

  fetch parameters that are required and optional

## Add ON

- **fetch geographic information**

  It can fetch country information from remote ip address!

```js
var addOnOpt = {
  geoip: {
    keyName: 'headers.x-forwarded-for'
  }
};

app.use(fetcher({
  'ipaddr': 'ip'
}, addOnOpt));

////// ....

console.log(req.param('x-fetcher-geoinfo'))
{ range: [ 3479299040, 3479299071 ],
  country: 'US',
  region: 'CA',
  city: 'San Francisco',
  ll: [37.7484, -122.4156] }  
```

- **fetch detail imsi information by mnc, mcc code**

  It can generate detail imsi(country, operator...) information by mcc, mnc code!


```js
var addOnOpt = {
  imsi: true
};
app.use(fetcher({
  'ipaddr': 'ip'
}, addOnOpt));

////// ....

// url maybe hostname/api?mnc=11&mcc=450. if only exist mcc then results array length may be greater than 1.

console.log(req.param('x-imsi'))
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
```    

## Contributing

We'd love your contributions! Please send us Pull Requests. Also, read the [contribution guidelines](https://github.com/SungYeolWoo/express-param/blob/master/Contribution.md).



## LICENSE

MIT

---

This product includes GeoLite data created by MaxMind, available from
http://www.maxmind.com
