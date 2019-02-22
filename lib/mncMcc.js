const imsiList = require('mcc-mnc-list').all()

function addImsi(req) {
  const getImsiInfoFromReq = function(name) {
    if (req.query && req.query[name]) {
      return req.query[name];
    } else if (req.body && req.body[name]) {
      return req.body[name];
    } else if (req.params && req.params[name]) {
      return req.params[name];
    } else {
      return null
    }
  };

  const mcc = getImsiInfoFromReq('mcc');
  const mnc = getImsiInfoFromReq('mnc');
  let info = []

  if (mcc) {
    info = imsiList.filter((r) => r.mcc === mcc.toString());
    if (mnc) {
      const matchedMnc = info.filter((r) => r.mnc === mnc.toString());

      if (matchedMnc.length !== 0) {
        info = matchedMnc;
      }
    }

    info.forEach((r) => {
      r.country_name = r.countryName
      r.country_code = r.countryCode
    })
  }

  req.headers['x-fetcher-imsi'] = !info[0] ? [] : info;
}

exports.addImsi = addImsi;
