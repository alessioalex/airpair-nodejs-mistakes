"use strict";

// $ URL=https://bbc.co.uk/ node before.js
var URL = process.env.URL;
var assert = require('assert');
var url = require('url');
var request = require('request');
var cheerio = require('cheerio');
var once = require('once');
var async = require('async');
var isUrl = new RegExp(/[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi);

assert(isUrl.test(URL), 'must provide a correct URL env variable');

var rootHtml = '';
var resources = [];
var totalSize = 0;

var handleBadResponse = function(err, url, statusCode, cb) {
  if (!err && (statusCode !== 200)) {
    err = new Error(URL + ' responded with a bad code ' + res.statusCode);
  }

  if (err) {
    cb(err);
    return true;
  }

  return false;
};

async.series([
  function getRootHtml(cb) {
    request({ url: URL, gzip: true }, function(err, res, body) {
      if (handleBadResponse(err, URL, res.statusCode, cb)) { return; }

      rootHtml = body;

      cb();
    });
  },
  function aggregateResources(cb) {
    var $ = cheerio.load(rootHtml);

    $('script').each(function(index, el) {
      var src = $(this).attr('src');
      if (src) { resources.push(src); }
    });

    $('img').each(function(index, el) {
      var src = $(this).attr('src');
      if (src) { resources.push(src); }
    });

    $('link').each(function(index, el) {
      var $el = $(this);
      var src = $el.attr('href');
      var rel = $el.attr('rel');

      if (src) {
        if (/icon/ig.test(rel) || rel === 'stylesheet') {
          resources.push(src);
        }
      }
    });

    setImmediate(cb);
  },
  function calculateSize(cb) {
    async.each(resources, function(relativeUrl, next) {
      var resourceUrl = url.resolve(URL, relativeUrl);

      request({ url: resourceUrl, gzip: true }, function(err, res, body) {
        if (handleBadResponse(err, resourceUrl, res.statusCode, cb)) { return; }

        if (res.headers['content-length']) {
          totalSize += parseInt(res.headers['content-length'], 10);
        } else {
          totalSize += Buffer.byteLength(body, 'utf8');
        }

        next();
      });
    }, cb);
  }
], function(err) {
  if (err) { throw err; }

  var size = (totalSize / 1024 / 1024).toFixed(2);
  console.log('There are ~ %s resources with a size of %s Mb.', resources.length, size);
});
