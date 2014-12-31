"use strict";

var fetch = require('./lib/fetchParams.js')
	, checkErr = require('./lib/checkInvalidReq.js')
	, geoInfo = require('./lib/geoInfo.js');

/**
 *
 * @param option : this has key list of fetch parameter
 * @param addOn : this has add on key list
 * 								- geoip : config info describes how to fetch geo information from http request
 * @returns {Function}
 */
module.exports = function(option, addOn) {
	return function(req, res, next) {
		req.fetchParameter = fetch.fetchParameter.bind({req: req, extraOption: option});
		req.checkParamErr =  checkErr.checkParamErr;

		if (addOn && addOn.geoip) {
			req['x-fetcher-geoinfo'] = geoInfo.fetch(req, addOn.geoip);
		}

		return next();
	};
};
