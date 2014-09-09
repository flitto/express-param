"use strict";

var fetch = require('./lib/fetchParams.js');

module.exports = function() {
	return function(req, res, next) {
		req.fetchParameter = fetch.fetchParameter.bind({req: req});
		return next();
	};
};