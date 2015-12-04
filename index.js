/*!
 * base-list <https://github.com/jonschlinkert/base-list>
 *
 * Copyright (c) 2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

var utils = require('./utils');

/**
 * Build grouped lists of tasks.
 *
 * @param {String} `prop` e.g. `generators`
 * @param {String} `options`
 */

module.exports = function(prop, options) {
  var Questions = utils.Questions;

  return function(app) {
    app.define('list', function(cb) {
      var questions = new Questions(this.options);
      var choices = buildList(this[prop]);
      var results = {};
      results[prop] = {};


      if (!choices.length) {
        // politely inform...
        console.log(utils.cyan('no tasks found.'));
        return cb(null, results);
      }

      var question = {};
      question[prop] = {
        message: 'Pick the ' + options.method + ' and tasks to run',
        type: 'checkbox',
        choices: choices
      };

      questions.ask(question, function(err, answers) {
        if (err) return cb(err);

        answers[prop].forEach(function(answer) {
          var segs = answer.split(':');
          if (segs.length === 1) return;
          union(results[prop], segs[0], (segs[1] || 'default').split(','));
        });
        return cb(null, results);
      });
    });

    /**
     * Return a list of "apps" (generators, updaters, etc) and
     * their tasks
     */

    function buildList(apps) {
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
    }
  }
};
