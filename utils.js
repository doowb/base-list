'use strict';

/**
 * Module dependencies
 */

var utils = require('lazy-cache')(require);

/**
 * Temporarily re-assign `require` to trick browserify and
 * webpack into reconizing lazy dependencies.
 *
 * This tiny bit of ugliness has the huge dual advantage of
 * only loading modules that are actually called at some
 * point in the lifecycle of the application, whilst also
 * allowing browserify and webpack to find modules that
 * are depended on but never actually called.
 */

var fn = require;
require = utils;

/**
 * Lazily required module dependencies
 */

require('question-cache', 'Questions');
require('arr-union', 'union');
require('ansi-cyan', 'cyan');

/**
 * Restore `require`
 */

require = fn;

/**
 * Return a list of "apps" (generators, updaters, etc) and
 * their tasks
 *
 * ```js
 * utils.list(apps);
 * ```
 */

utils.list = function(apps) {
  var list = [];
  for (var key in apps) {
    var app = apps[key];
    if (!Object.keys(app.tasks).length) {
      continue;
    }

    var hasDefault = app.tasks['default'];
    var name = app.name || app.options.name;
    var item = {
      name: name + (hasDefault ? ' (default)' : ''),
      value: key,
      short: name + (hasDefault ? ':default' : '')
    };

    list.push(item);
    for (var task in app.tasks) {
      if (task === 'default') continue;
      list.push({
        name: ' - ' + task,
        value: key + ':' + task,
        short: key + ':' + task
      });
    }
  }
  return list;
};

/**
 * Expose `utils` module
 */

module.exports = utils;
