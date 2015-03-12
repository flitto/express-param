"use strict";

var imsiList = require('../dat/mcc_mnc.json')
	, _  = require('underscore');

function addImsi(req) {
	var mcc = req.param('mcc')
		, mnc = req.param('mnc')
		, info = [];

  info = _.filter(imsiList, function(el) {
    return el.mcc == mcc;
  });

  if (mnc) {
    var match_mnc = _.filter(info, function (el) {
      return el.mnc == mnc;
    });

    if (match_mnc.length != 0) {
      info = match_mnc;
    }
  }

  req.headers['x-flt-imsi'] = !info[0] ? [] : info;
}

module.exports.addImsi = addImsi;
