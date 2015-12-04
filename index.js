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

    var treeOpts = {
      name: prop,
      method: 'hierarchy',
      tree: buildTree,
      getLabel: function(app) {
        return app.name || app.options.name;
      }
    };

    app.use(utils.tree(treeOpts));
    app.define('taskList', function(cb) {
      var questions = new Questions(this.options);
      var tree = this.hierarchy();
      var choices = toChoices(tree);

      var results = {};
      results[prop] = {};


      if (!choices.length) {
        // politely inform...
        console.log(utils.colors.cyan('no tasks found.'));
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
          utils.union(results[prop], segs[0], (segs[1] || 'default').split(','));
        });
        return cb(null, results);
      });
    });

    /**
     * Return a tree of "apps" (generators, updaters, etc) and
     * their tasks
     */

    function buildTree(app, options) {
      var opts = utils.extend({}, options);
      var name = options.getLabel(app, opts);
      var node = {
        label: name,
        metadata: {
          type: 'app',
          value: name,
          short: name
        }
      };

      // add tasks to the node
      if (app.tasks) {
        var tasks = [];
        var hasDefault = app.tasks['default'];
        if (hasDefault) {
          node.label += ' (default)';
          node.metadata.value = name + ':default';
          node.metadata.short = name + ':default';
        }

        for (var task in app.tasks) {
          if (task === 'default') continue;
          tasks.push({
            label: task,
            metadata: {
              type: 'task',
              value: name + ':' + task,
              short: name + ':' + task
            }
          });
        }

        if (tasks.length) {
          node.tasks = tasks;
        }
      }

      // get the children to lookup
      var children = app[prop];
      if (typeof children === 'object') {
        // build a tree for each child node
        var nodes = [];
        for (var key in children) {
          var child = children[key];
          if (typeof child[opts.method] === 'function') {
            nodes.push(child[opts.method](opts));
          } else {
            nodes.push(buildTree(child, opts));
          }
        }
        if (nodes.length) {
          node.nodes = nodes;
        }
      }
      return node;
    }

    /**
     * Transform tree nodes into a list of choices.
     * Prefix choices with special characters based on their position in the tree.
     * Color lines based on their type (app or task)
     *
     * @param  {Object} `tree` Tree object generated from buildTree function.
     * @param  {String} `prefix` prepend a prefix to the label
     * @param  {Boolean} `last` true if last item in an array.
     * @return {Array} List of choices to pass to questions
     */

    function toChoices(tree, prefix, last) {
      prefix = prefix || '';
      var list = [];
      var type = tree.metadata.type;

      // pick a color to use based on type
      var color = utils.colors[(type === 'task' ? 'green' : 'gray')];

      // prefix the label with special characters.
      var label = (type === 'task' ? prefix : '')
        + (last === true ? '└─': (typeof last === 'undefined'? '': '├─')) + '' + color(tree.label);

      // create item to add to list of choices
      var item = {
        name: label,
        value: tree.metadata.value,
        short: tree.metadata.short
      };
      list.push(item);

      var len = 0, i = 0;

      // add tasks as choices
      if (tree.tasks && tree.tasks.length) {
        var moreApps = tree.nodes && tree.nodes.length && last !== true;
        len = tree.tasks.length, i = 0;
        while(len--) {
          list = list.concat(toChoices(tree.tasks[i++], (prefix + (moreApps ? '|' : ' ') + ' '), (len === 0)));
        }
      }

      // add nodes (child apps) as choices
      if (tree.nodes && tree.nodes.length) {
        len = tree.nodes.length, i = 0;
        while(len--) {
          list = list.concat(toChoices(tree.nodes[i++], (prefix + (len === 0 ? ' ' : '|') + ' '), (len === 0)));
        }
      }
      return list;
    }
  }
};
