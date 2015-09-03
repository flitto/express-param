"use strict";

var _ = require('underscore');

var TYPE_DELIMETER = ':'
  , PATH_REGEX = /^{[A-Za-z0-9_]+}$/
  , DEFAULT_VAL_DELIMETER = '|='
  , extraOption;

//type:keyName  || type:{keyName}
function getRequiredKeyInfo(param_expression) {
  var keyInfo = {}
    , type_tokenized = param_expression.split(TYPE_DELIMETER)
    , len1 = type_tokenized.length
    , pathKey
    , keyName
    , err;

  if (len1 === 1) {
    keyInfo.type = 'string';

    pathKey = !(type_tokenized[0].match(PATH_REGEX) === null);
    keyName = pathKey ? type_tokenized[0].replace('{', '').replace('}', '') : type_tokenized[0];
  } else if (len1 === 2) {
    keyInfo.type = type_tokenized[0];

    pathKey = !(type_tokenized[1].match(PATH_REGEX) === null);
    keyName = pathKey ? type_tokenized[1].replace('{', '').replace('}', '') : type_tokenized[1];
  } else {
    err = new Error('Invalid required parameter expression. Your Input: ' + param_expression);
    err.code = 400;

    throw err;
  }

  keyInfo.pathKey = pathKey;
  keyInfo.keyName = keyName;

  return keyInfo;
}

function getOptionalKeyInfo(param_expression) {
  var keyInfo = {}
    , type_tokenized = param_expression.split(TYPE_DELIMETER)
    , len1 = type_tokenized.length
    , len2
    , val_tokenized
    , err;

  if (len1 === 1) { //no type, set type as string
    keyInfo.type = 'string';
    val_tokenized = type_tokenized[0].split(DEFAULT_VAL_DELIMETER);
  } else if (len1 === 2) {
    keyInfo.type = type_tokenized[0];
    val_tokenized = type_tokenized[1].split(DEFAULT_VAL_DELIMETER);
  } else {
    err = new Error('Invalid parameter expression. Your Input: ' + param_expression);
    err.code = 400;

    throw err;
  }

  len2 = val_tokenized.length;

  keyInfo.keyName = val_tokenized[0];
  if (len2 === 2) keyInfo.defaultVal = val_tokenized[1];

  if (len2 > 2) {
    err = new Error('Invalid parameter expression. expression have to include \''
      + DEFAULT_VAL_DELIMETER + '\' delimeter one or zero. Your Input: ' + param_expression);
    err.code = 400;

    throw err;
  }

  return keyInfo;
}

//type:key_name|=default_value
function getOptionalParams(req, option_expressions) {
  var options = {}
    , getValueFn
    , err;

  //possible expression : {type}:keyName|={defaultValue}
  for (var i = 0, li = option_expressions.length; i < li; i++) {
    try {
      var keyInfo = getOptionalKeyInfo(option_expressions[i]);
    } catch (e) {
      err = e;
    }

    getValueFn = function(keyName) {
      if (req.params && req.params[keyName]) {
        return req.params[keyName];
      } else if (req.body && req.body[keyName]) {
        return req.body[keyName];
      } else if (req.query && req.query[keyName]) {
        return req.query[keyName];
      } else {
        return null;
      }
    };


    var parameterValue = getValueFn(keyInfo.keyName);

    if (keyInfo.type === 'number') {
      if (parameterValue)
        options[keyInfo.keyName] = parseInt(parameterValue, 10);
      else if (keyInfo.defaultVal)
        options[keyInfo.keyName] = parseInt(keyInfo.defaultVal, 10);
      else
        continue;

      if (isNaN(options[keyInfo.keyName])) {
        err = new Error('The parameter value is not a number : ' + keyInfo.keyName);
        err.code = 400;
      }
    } else {
      options[keyInfo.keyName] = parameterValue ? parameterValue : keyInfo.defaultVal;
    }

  }

  return {
    err: err,
    params: options
  };
}

function getDefaultRequestInfo(req, extraOption) {
  var options = {};

  for (var key in extraOption) {
    if (extraOption.hasOwnProperty(key)) {
      options[key] = req[extraOption[key]];
    }
  }

  return {
    params: options
  }
}

function requiredParameter(req, required_expressions) {
  var options = {}
    , getFunc
    , err;

  for (var i = 0, li = required_expressions.length; i <li ; i++) {
    var keyInfo;
    try {
      keyInfo = getRequiredKeyInfo(required_expressions[i]);
    } catch (e) {
      err = e;
      break;
    }

    getFunc = function(keyName) {
      if (req.params && req.params[keyName]) {
        return req.params[keyName];
      } else if (req.body && req.body[keyName]) {
        return req.body[keyName];
      } else if (req.query && req.query[keyName]) {
        return req.query[keyName];
      } else {
        return null;
      }
      //return req.param.call(req, keyName);
    };

    if (keyInfo.pathKey) {
      getFunc = function (name) {
        return req.params[name];
      };
    }

    if (extraOption[keyInfo.keyName]) {
      getFunc = function (name) {
        return req[extraOption[name]];
      };
    }

    if (keyInfo.type === 'number') {
      options[keyInfo.keyName] = parseInt(getFunc(keyInfo.keyName), 10);
      if (isNaN(options[keyInfo.keyName])) {
        err = new Error('The parameter value is not a number : ' + keyInfo.keyName);
        err.code = 400;
      }
    } else {
      options[keyInfo.keyName] = getFunc(keyInfo.keyName);
    }

    if (!options[keyInfo.keyName]) {
      err = new Error('No Request Data For Required : ' + keyInfo.keyName);
      err.code = 400;
      break;
    }
  }

  return {
    err: err,
    params: options
  };
}

//required = ['id', 'number:req_id:path'], optional = ['order', 'number:count:10']
function fetchParameter(required, optional) {
  //문자열 배열인지 먼저 확인하자.
  var requiredResult
    , optionalResult = {}
    , extraResult
    , options = {}
    , req;

  req = this.req;
  if (!this.req) {
    throw Error('insert this express-param middleware into express app!');
  }

  //req.user value is default
  extraOption = this.extraOption || {};
  if (!extraOption.user) extraOption.user = 'user';

  requiredResult = requiredParameter(req, required);

  if (requiredResult.err) {
    return requiredResult.err;
  }

  if (Array.isArray(optional)) {
    optionalResult = getOptionalParams(req, optional);
    if (optionalResult.err) {
      return optionalResult.err;
    }
  }

  extraResult = getDefaultRequestInfo(req, extraOption);

  var extendOptionVal = _.extend(optionalResult.params, extraResult.params);
  options.params = _.extend(requiredResult.params, extendOptionVal);

  return options.params;
}

module.exports.fetchParameter = fetchParameter;

