"use strict";

var handleBadResponse = require('./bad-response-handler');
var request = require('request');

module.exports = function getSiteData(url, callback) {
  request({
    url: url,
    gzip: true,
    // lying a bit
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/38.0.2125.111 Safari/537.36'
    }
  }, function(err, res, body) {
    if (handleBadResponse(err, url, res && res.statusCode, callback)) { return; }

    callback(null, {
      body: body,
      res: res
    });
  });
};
