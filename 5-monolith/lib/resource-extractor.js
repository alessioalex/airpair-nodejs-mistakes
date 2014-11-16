"use strict";

var cheerio = require('cheerio');

module.exports = function extractResources(html) {
  var $ = cheerio.load(html);
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

  return resources;
};
