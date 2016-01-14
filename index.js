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
 * @param {String} `options` Additional options to control output styling
 * @param {String} `options.appColor` Color to use when displaying the app names.
 * @param {String} `options.taskColor` Color to use when displaying task names.
 * @param {String} `options.depColor` Color to use when displaying task dependencies.
 * @param {String} `options.appMsg` Message to display for the app name. This is a template that may contain `:name` where the app name should be. (defaults to ":name")
 * @param {String} `options.taskMsg` Message to display for the task name. This is a template that may contain `:name` and `:deps` where the task name and the task depdencies should be. (defaults to ":name :deps")
 * @api public
 * @name baseListPlugin
 */

module.exports = function(prop, options) {
  var Questions = utils.Questions;
  var options = options || {};

  return function(app) {

    var appColor = options.appColor || 'cyan';
    var depColor = options.depColor || 'gray';
    var taskColor = options.taskColor || 'green';
    var appTmpl = options.appMsg || ':name';
    var taskTmpl = options.taskMsg || ':name :deps';

    var treeOpts = {
      names: [prop, 'tasks'],
      method: 'hierarchy',
      getLabel: getLabel,
      getMetadata: getMetadata
    };

    app.use(utils.tree(treeOpts));

    /**
     * Display the application hierarchy of apps and tasks in a formatted tree.
     *
     * ```js
     * app.displayTasks()
     * ```
     * @api public
     * @name  displayTasks
     */

    app.define('displayTasks', function() {
      var tree = this.hierarchy();
      console.log(utils.archy(tree));
    });

    /**
     * Present a multiple choice list of apps and tasks to run.
     * Return results from a user making choices.
     *
     * ```js
     * app.chooseTasks(function(err, results) {
     *   if (err) return console.error(err);
     *   console.log(results);
     * });
     * ```
     *
     * @param  {Function} `cb` Callback function that will return any errors or the results of the user choices.
     * @api public
     * @name  chooseTasks
     */

    app.define('chooseTasks', function(cb) {
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
        pageSize: 40,
        choices: choices
      };

      questions.ask(question, function(err, answers) {
        if (err) return cb(err);

        answers[prop].forEach(function(answer) {
          var segs = answer.split(':');
          if (segs.length === 1) return;
          utils.union(results[prop], segs[0].split('.').join('\\.'), (segs[1] || 'default').split(','));
        });
        return cb(null, results);
      });
    });

    /**
     * Transform tree into a list of choices.
     * Prefix choices with special characters based on their position in the tree.
     * Color lines based on their type (app or task)
     *
     * @param  {Object} `tree` Tree object generated from buildTree function.
     * @return {Array} List of choices to pass to questions
     */

    function toChoices(tree, lines) {
      lines = lines || utils.archy(tree).split('\n');

      var item = {};
      item.name = (tree.metadata.type === 'app' ? '\x1b[2D  ' : '') + lines.shift();
      // item.disabled = !!(tree.metadata.type === 'app');
      item.value = tree.metadata.value;
      item.short = tree.metadata.short;

      var list = [item];
      if (tree.nodes && tree.nodes.length) {
        tree.nodes.forEach(function(node) {
          list = list.concat(toChoices(node, lines));
        });
      }
      return list;
    }

    function getLabel(app) {
      var name = app.name || app.options.name;
      if (app.isApp) {
        return utils.colors[appColor](render(appTmpl, {name: name}));
      }
      var deps = '';
      if (app.deps.length) {
        deps = utils.colors[depColor]('[' + app.deps.join(', ') + ']');
      }
      name = utils.colors[taskColor](name);
      return render(taskTmpl, {name: name, deps: deps});
    }

    function getMetadata(app, opts) {
      var data = {};
      var name = app.isApp ? buildAppName(app) : buildTaskName(app);
      data.type = app.isApp ? 'app' : 'task';
      data.value = name;
      data.short = name;
      return data;
    }

    function buildAppName(app) {
      var names = [app.name || app.options.name];
      while(app = app.parent) {
        names.unshift(app.name || app.options.name);
      }
      return names.join('.');
    }

    function buildTaskName(task) {
      return buildAppName(task.app) + ':' + task.name;
    }

    function render(msg, ctx) {
      return Object.keys(ctx).reduce(function(str, prop) {
        return str.split(':' + prop).join(ctx[prop]);
      }, msg);
    }
  }
};
