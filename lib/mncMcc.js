"use strict";

var imsiList = require('../dat/mcc_mnc.json')
	, _  = require('underscore');

function addImsi(req) {
	var mcc = req.param('mcc')
		, mnc = req.param('mnc')
		, info = null;

	if (mcc && !mnc) {
		info = _.filter(imsiList, function(el) {
			return el.mcc == mcc;
		});
	} else if (mcc && mnc) {
		info = [_.find(imsiList, function(el) {
			return (el.mcc == mcc && el.mnc == mnc);
		})];
	}

	if (req.body) {
		req.body['x-imsi'] = info;
	} else {
		req.body = {
			'x-imsi': info
		};
	}

	return;
}

module.exports.addImsi = addImsi;
