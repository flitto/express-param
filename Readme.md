# Express-param

  Fetch Express.js Request parameters Middleware

## About

## parameter syntax
I was inspired by Spring Framework and Flask.
- required parameter
	- Array
    - [element1, element2, element3, ...]
    - type:{parameter_name}
    	- type: type is optional(default string). number or string. return variable with type.
        - {paremeter_name}: {} is optional. but paremeter name is required. if it include {}, it means that this is path variable
        - ex) ['number:{flitto_id}], 'string:req_id', 'res_id']
- optional parameter
	- Array
    - [element1, element2, element3, ...]
    - type:parameter_name|=default_value
    	- type: type is optional(default string). number or string. return variable with type.
        - parameter_name: required.
        - default_value: optional. if request object do not have specified parameter then assign this default value.
        - ex) ['number:count', 'order', 'string:res_list|=Y']


## Example
   Here is an simple example.
   ```js
   var express = require('express');
   var fetcher = require('express-param');
   var app = express();
   app.use(fetcher());

   app.get('/path', function(req, res, next) {
   	var requiredParams = ['id'];
    var optionalParams = ['count'];
   	var options = req.fetchParamter(requiredParams, optionalParams);

    if (options.err) return next(options.err);

    return res.send(options.params);
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

    if (options.err) return next(options.err);

    //options.params values is below.
    /*
    	{
        	id: '10',
            count: 10
            order: 'desc'
        }
    */
    return res.send(options.params);
   });
   ```
## Another example
   Custom reqeust key name belong to express req property
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
### fetchParameter(required[, optional])
fetch parameter of required and optional

## LICENSE
MIT

