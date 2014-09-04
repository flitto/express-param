var _ = require('underscore');

var TYPE_DELIMETER = ':'
	, PATH_REGEX = /^{[A-Za-z0-9]+}$/
	, DEFAULT_VAL_DELIMETER = '|=';

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

		pathKey = type_tokenized[0].match(PATH_REGEX) === null ? false : true;
		keyName = pathKey ? type_tokenized[0].replace('{', '').replace('}', '') : type_tokenized[0];
	} else if (len1 === 2) {
		keyInfo.type = type_tokenized[0];

		pathKey = type_tokenized[1].match(PATH_REGEX) === null ? false : true;
		keyName = pathKey ? type_tokenized[1].replace('{', '').replace('}', '') : type_tokenized[1];
	} else {
		err = new Error('Invalid required parameter expression. Your Input: ' + param_expression);
		err.code = 4001;

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
		err.code = 4000;

		throw err;
	}

	len2 = val_tokenized.length;

	keyInfo.keyName = val_tokenized[0];
	if (len2 === 2) keyInfo.defaultVal = val_tokenized[1];

	if (len2 > 2) {
		err = new Error('Invalid parameter expression. expression have to include \''
			+ DEFAULT_VAL_DELIMETER + '\' delimeter one or zero. Your Input: ' + param_expression);
		err.code = 4000;

		throw err;
	}

	return keyInfo;
}

//type:key_name|=default_value
function getOptionalParams(req, option_expressions, next) {
	var options = {};

	//possible expression : {type}:keyName!={defaultValue}
	for (var i = 0, li = option_expressions.length; i < li; i++) {
		try {
			var keyInfo = getOptionalKeyInfo(option_expressions[i]);
		} catch (e) {
			return next(e);
		}

		if (keyInfo.type === 'number') {
			options[keyInfo.keyName] = req.param(keyInfo.keyName)
				? parseInt(req.param(keyInfo.keyName), 10) : parseInt(keyInfo.defaultVal, 10);
		} else {
			options[keyInfo.keyName] = req.param(keyInfo.keyName) ? req.param(keyInfo.keyName) : keyInfo.defaultVal;
		}
	}

	return options;
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

		}

		getFunc = function(keyName) {
			return req.param.call(req, keyName);
		};

		if (keyInfo.pathKey) {
			getFunc = function (name) {
				return req.params[name];
			};
		}

		if (keyInfo.type === 'number') {
			options[keyInfo.keyName] = parseInt(getFunc(keyInfo.keyName), 10);
		} else {
			options[keyInfo.keyName] = getFunc(keyInfo.keyName);
		}
	}

	if (err) return err;
	return options;
}

//required = ['id', 'number:req_id:path'], optional = ['order', 'number:count:10']
function fetchParameter(req, required, optional, next) {
	//문자열 배열인지 먼저 확인하자.
	var requiredData
		, optionalData
		, options;

	//TODO: check req가 express.js req인지. next도.


	requiredData = requiredParameter(req, required);

	if (Array.isArray(optional)) { //3번째가 next가 올 수 도 있지.
		optionalData = getOptionalParams(req, optional, next);
	} else {
		next = optional;
	}

	options = _.extend(requiredData, optionalData);

	return options;
}

module.exports.fetchParameter = fetchParameter;
