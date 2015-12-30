'use strict';

var PageResult = function() {
  var result = {};
  result.pages = 0;
  result.currentPage = 0;
  result.count = 0;
  result.list = [];
  return result;
};

module.exports = PageResult;