"use strict";

// $ URL=https://bbc.co.uk/ node before.js
var URL = process.env.URL;
var assert = require('assert');
var url = require('url');
var request = require('request');
var cheerio = require('cheerio');
var once = require('once');
var isUrl = new RegExp(/[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi);

assert(isUrl.test(URL), 'must provide a correct URL env variable');

request({ url: URL, gzip: true }, function(err, res, body) {
  if (err) { throw err; }

  if (res.statusCode !== 200) {
    return console.error('Bad server response', res.statusCode);
  }

  var $ = cheerio.load(body);
  var resources = [];

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

  var counter = resources.length;
  var next = once(function(err, result) {
    if (err) { throw err; }

    var size = (result.size / 1024 / 1024).toFixed(2);

    console.log('There are ~ %s resources with a size of %s Mb.', result.length, size);
  });

  var totalSize = 0;

  resources.forEach(function(relative) {
    var resourceUrl = url.resolve(URL, relative);

    request({ url: resourceUrl, gzip: true }, function(err, res, body) {
      if (err) { return next(err); }

      if (res.statusCode !== 200) {
        return next(new Error(resourceUrl + ' responded with a bad code ' + res.statusCode));
      }

      if (res.headers['content-length']) {
        totalSize += parseInt(res.headers['content-length'], 10);
      } else {
        totalSize += Buffer.byteLength(body, 'utf8');
      }

      if (!--counter) {
        next(null, {
          length: resources.length,
          size: totalSize
        });
      }
    });
  });
});
