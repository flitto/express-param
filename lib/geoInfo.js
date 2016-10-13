"use strict";

var geoip = require('geoip-lite');

/**
 * fetch geographic information from express.js http request
 * @param req - express.js request
 * @param config.keyName - this is nested key name that describes ip address value
 * @returns {object}
 */
function fetchGeoInfoFromRemoteAddr(req, config) {
  var remoteIp
    , geoInfo = {};

  if (config.keyName) {
    var keyList = config.keyName.split('.')
      , pickKeyObj = req;

    keyList.forEach(function(key) {
      pickKeyObj = pickKeyObj[key];
    });

    remoteIp = pickKeyObj;
  } else {
    remoteIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  }

  if (!remoteIp) {
    geoInfo.error = {
      msg: 'Can not find remote Address!',
      key_name: config.keyName
    };
    return geoInfo;
  }

  geoInfo = geoip.lookup(remoteIp);
  if (geoInfo && geoInfo.hasOwnProperty('country'))
    geoInfo.remoteIp = remoteIp;

  return geoInfo;
}

exports.fetch = fetchGeoInfoFromRemoteAddr;
