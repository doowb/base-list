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
      var node = new AppNode(name);

      // add tasks to the node
      if (app.tasks) {
        var hasDefault = app.tasks['default'];
        if (hasDefault) {
          node.hasDefault = true;
          node.metadata.value = name + ':default';
        }

        for (var task in app.tasks) {
          if (task === 'default') continue;
          node.addTask(task);
        }
      }

      // get the children to lookup
      var children = app[prop];
      if (typeof children === 'object') {
        // build a tree for each child node
        for (var key in children) {
          var child = children[key];
          if (typeof child[opts.method] === 'function') {
            node.addApp(child[opts.method](opts));
          } else {
            node.addApp(buildTree(child, opts));
          }
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

    function toChoices(tree) {
      return renderApp(tree, ' ', 0);
    }

    function renderTasks(tasks, prefix, more, lastApp) {
      var list = [];
      var len = tasks.length, i = 0;
      while(len--) {
        list = list.concat(renderTask(tasks[i++], (prefix + (lastApp ? (more === false ? ' ' : '') : '|')), len === 0));
      }
      return list;
    }

    function renderTask(task, prefix, last) {
      var item = {};
      var label = prefix + '';
      if (last === true) label += '└─';
      else if (typeof last !== 'undefined') label += '├─';
      label += utils.colors.green(task.label);

      item.name = label;
      item.value = task.metadata.value;
      item.short = task.metadata.short;
      return item;
    }

    function renderApps(apps, prefix, depth, last) {
      var list = [];
      var len = apps.length, i = 0;
      while (len--) {
        list = list.concat(renderApp(apps[i++], (last === true ? prefix.replace('|', ' ') : prefix) + ' ', depth, len === 0));
        '┬';
      }
      return list;
    }

    function renderApp(app, prefix, depth, last) {
      var item = {};
      var label = prefix + '';
      if (last === true) label += '└─';
      else if (typeof last !== 'undefined') label += '├─';
      label += utils.colors.gray(app.label + (app.hasDefault ? ' (default)' : ''));

      item.name = label;
      item.value = app.metadata.value;
      item.short = app.metadata.short;

      var list = [item];
      var more = !!(app.nodes && app.nodes.length);
      var pad = '';
      if (more && depth && last === true) {
        for (var i = 0; i < depth*2; i++) {
          pad = ' ' + pad;
        }
      }
      if (app.tasks && app.tasks.length) {
        list = list.concat(renderTasks(app.tasks, (typeof last === 'undefined' ? ' ' : prefix + (more ? pad + '|' : ' ') + ' '), more, last));
      }

      if (app.nodes && app.nodes.length) {
        list = list.concat(renderApps(app.nodes, (typeof last === 'undefined' ? '' : prefix + (more ? '|' : '')), depth + 1, last));
      }
      return list;
    }

    function AppNode(name) {
      if (!(this instanceof AppNode)) {
        return new AppNode(name);
      }
      this.type = 'app';
      this.label = name;
      this.metadata = {
        value: name,
        short: name
      };
      this.tasks = [];
      this.nodes = [];
    }

    AppNode.prototype.addTask = function(name) {
      this.tasks.push(new TaskNode(name, this));
      return this;
    };

    AppNode.prototype.addApp = function(node) {
      this.nodes.push(node);
      return this;
    };

    function TaskNode(name, parent) {
      if (!(this instanceof TaskNode)) {
        return new TaskNode(name, parent);
      }
      this.type = 'task';
      this.label = name;
      this.metadata = {
        value: parent.label + ':' + name,
        short: parent.label + ':' + name
      };
    }
  }
};
