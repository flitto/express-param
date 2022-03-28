"use strict";

var fetch = require('./lib/fetchParams.js')
  , imsi = require('./lib/mncMcc.js')
  , checkErr = require('./lib/checkInvalidReq.js')
  , geoInfo = require('./lib/geoInfo.js');

/**
 *
 * @param option : this has key list of fetch parameter
 * @param addOn  : this has add on key list
 *                 - geoip : config info describes how to fetch geo information from http request
 *                 - imsi : get full mcc, mnc, country code info by mnc code or mcc code
 * @returns {Function}
 */
module.exports = function(option, addOn) {
  return function(req, res, next) {
    req.fetchParameter = fetch.fetchParameter.bind({req: req, extraOption: option});
    req.checkParamErr = checkErr.checkParamErr;

    if (addOn) {
      if (addOn.geoip) req.headers['x-fetcher-geoinfo'] = geoInfo.fetch(req, addOn.geoip);
      if (addOn.imsi) imsi.addImsi(req);
    }

    return next();
  };
};
