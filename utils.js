'use strict';

/**
 * Module dependencies
 */

var utils = require('lazy-cache')(require);

/**
 * Lazily required module dependencies
 */

var fn = require;
require = utils;
require('archy');
require('base-tree', 'tree');
require('ansi-colors', 'colors');
require('union-value', 'union');
require('question-cache', 'Questions');
require = fn;

/**
 * Expose `utils` module
 */

module.exports = utils;
