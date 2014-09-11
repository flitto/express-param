"use strict";

var fetch = require('./lib/fetchParams.js')
	, checkErr = require('./lib/checkInvalidReq.js');

module.exports = function() {
	return function(req, res, next) {
		req.fetchParameter = fetch.fetchParameter.bind({req: req});
		req.checkParamErr =  checkErr.checkParamErr;

		return next();
	};
};