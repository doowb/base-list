/*!
 * base-list <https://github.com/jonschlinkert/base-list>
 *
 * Copyright (c) 2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

var utils = require('./utils');
var union = require('union-value');

module.exports = function(options) {
  var Questions = utils.Questions;
  return function(app) {
    app.define('list', function(cb) {
      var questions = new Questions(this.options);
      var choices = utils.list(this[options.plural]);
      var results = {};
      results[options.plural] = {};


      if (!choices.length) {
        // politely inform...
        console.log(utils.cyan('no tasks found.'));
        return cb(null, results);
      }

      var question = {};
      question[options.plural] = {
        message: 'Pick the ' + options.method + ' and tasks to run',
        type: 'checkbox',
        choices: choices
      };

      questions.ask(question, function(err, answers) {
        if (err) return cb(err);

        answers[options.plural].forEach(function(answer) {
          var segs = answer.split(':');
          if (segs.length === 1) return;
          union(results[options.plural], segs[0], (segs[1] || 'default').split(','));
        });
        return cb(null, results);
      });
    });
  }
};
