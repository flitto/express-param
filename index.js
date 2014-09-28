"use strict";

var fetch = require('./lib/fetchParams.js')
	, checkErr = require('./lib/checkInvalidReq.js');

module.exports = function(option) {
	return function(req, res, next) {
		req.fetchParameter = fetch.fetchParameter.bind({req: req, extraOption: option});
		req.checkParamErr =  checkErr.checkParamErr;

		return next();
	};
};
