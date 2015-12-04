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
require('union-value', 'union');
require('question-cache', 'Questions');
require('ansi-cyan', 'cyan');
require = fn;

/**
 * Expose `utils` module
 */

module.exports = utils;
