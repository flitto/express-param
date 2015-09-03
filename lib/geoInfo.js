"use strict";

var geoip = require('geoip')
  , path = require('path')
  , Country = geoip.Country
  , country = new Country(path.join(__dirname + '/../dat/GeoIP.dat'));

var TYPE_LIST = ['country'];
/**
 *   fetch geographic information from express.js http request
 * @param req : express.js request
 * @param config :
 *             - keyName : this is nested key name that describes ip address value
 * @returns {null}
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

  TYPE_LIST.forEach(function(type) {
    switch(type) {
      case 'country':
        geoInfo.country = country.lookupSync(remoteIp);
        if (geoInfo.country) 
          geoInfo.country.remoteIp = remoteIp;
        break;
      default:
        geoInfo.country = country.lookupSync(remoteIp);
        if (geoInfo.country) 
          geoInfo.country.remoteIp = remoteIp;
        break;
    }
  });

  return geoInfo;
}

module.exports.fetch = fetchGeoInfoFromRemoteAddr;
