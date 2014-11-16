"use strict";

// $ URL=https://bbc.co.uk/ node index.js
var URL = process.env.URL;
var assert = require('assert');
var url = require('url');
var cheerio = require('cheerio');
var once = require('once');
var async = require('async');
var handleBadResponse = require('./lib/bad-response-handler');
var isValidUrl = require('./lib/url-validator');
var extractResources = require('./lib/resource-extractor');
var request = require('./lib/requester');

assert(isValidUrl(URL), 'must provide a correct URL env variable');

var rootHtml = '';
var resources = [];
var totalSize = 0;

async.series([
  function getRootHtml(cb) {
    request(URL, function(err, data) {
      if (err) { return cb(err); }

      rootHtml = data.body;

      cb(null, 123);
    });
  },
  function aggregateResources(cb) {
    resources = extractResources(rootHtml);

    setImmediate(cb);
  },
  function calculateSize(cb) {
    async.each(resources, function(relativeUrl, next) {
      var resourceUrl = url.resolve(URL, relativeUrl);

      request(resourceUrl, function(err, data) {
        if (err) { return next(err); }

        if (data.res.headers['content-length']) {
          totalSize += parseInt(data.res.headers['content-length'], 10);
        } else {
          totalSize += Buffer.byteLength(data.body, 'utf8');
        }

        next();
      });
    }, cb);
  }
], function(err) {
  if (err) { throw err; }

  var size = (totalSize / 1024 / 1024).toFixed(2);
  console.log('\nThere are ~ %s resources with a size of %s Mb.', resources.length, size);
});
