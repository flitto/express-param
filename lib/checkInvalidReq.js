"use strict";

function checkErr(fetch_result) {
  if (fetch_result instanceof  Error) {
    return fetch_result;
  } else {
    return false;
  }
}

module.exports.checkParamErr = checkErr;