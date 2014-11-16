"use strict";

module.exports = function(err, url, statusCode, cb) {
  if (!err && (statusCode !== 200)) {
    err = new Error(URL + ' responded with a bad code ' + res.statusCode);
  }

  if (err) {
    cb(err);
    return true;
  }

  return false;
};
