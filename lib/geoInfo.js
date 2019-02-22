const geoip = require('geoip-lite');

/**
 * fetch geographic information from express.js http request
 * @param req - express.js request
 * @param config.keyName - this is nested key name that describes ip address value
 * @returns {object}
 */
function fetchGeoInfoFromRemoteAddr(req, config) {
  let remoteIp;
  let geoInfo = {};

  if (config.keyName) {
    const keyList = config.keyName.split('.');
    let pickKeyObj = req;

    keyList.forEach(function(key) {
      pickKeyObj = pickKeyObj[key];
    });

    remoteIp = pickKeyObj;
  } else {
    remoteIp = req.headers['x-forwarded-for'] || req.ip || req.socket.remoteAddress;
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
