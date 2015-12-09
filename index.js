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
  var options = options || {};

  return function(app) {

    var appColor = options.appColor || 'cyan';
    var depColor = options.depColor || 'gray';
    var taskColor = options.taskColor || 'green';

    var treeOpts = {
      name: prop,
      method: 'hierarchy',
      tree: buildTree,
      getLabel: function(app) {
        return app.name || app.options.name;
      }
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
      var list = renderApp(tree, ' ', 0);
      var output = list.map(function(item) {
        return item.name;
      }).join('\n');
      console.log(output);
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
     *
     * @param {Object} `app` Application instance containing "apps" and tasks.
     * @param {Object} `options` Additional options controlling output.
     * @return {Object} Tree of "apps" and their tasks.
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
        }

        for (var task in app.tasks) {
          if (task === 'default') continue;
          node.addTask(app.tasks[task]);
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
     * Transform tree into a list of choices.
     * Prefix choices with special characters based on their position in the tree.
     * Color lines based on their type (app or task)
     *
     * @param  {Object} `tree` Tree object generated from buildTree function.
     * @return {Array} List of choices to pass to questions
     */

    function toChoices(tree) {
      var choices = renderApp(tree, ' ', 0);
      return choices.map(function(choice) {
        if (choice.name && Separator.exclude(choice.name)) {
          return choice;
        }
        choice.name.line = '  ' + choice.name.line;
        return choice.name;
      });
    }

    function renderTasks(tasks, prefix, more, lastApp) {
      var list = [];
      var len = tasks.length, i = 0;
      while(len--) {
        list = list.concat(renderTask(tasks[i++],
          (prefix + (lastApp
            ? (more === false ? ' ': '')
            : (more === false ? '  ':'| '))),
          len === 0));
      }
      return list;
    }

    function renderTask(task, prefix, last) {
      var item = {};
      var label = prefix + '';
      if (last === true) label += '└─';
      else if (typeof last !== 'undefined') label += '├─';
      label += ' ' + utils.colors[taskColor](task.label);

      if (task.metadata.dependencies && task.metadata.dependencies.length) {
        label += utils.colors[depColor](' [' + task.metadata.dependencies.join(', ') + ']');
      }
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
      }
      return list;
    }

    function renderApp(app, prefix, depth, last) {
      var item = {};
      var hasChildren = !!(app.nodes && app.nodes.length);
      var label = prefix + '';
      if (last === true) {
        label += '└─' + (hasChildren ? '┬' : '') + ' ';
      } else if (typeof last !== 'undefined') {
        label += '├─' + (hasChildren ? '┬' : '') + ' ';
      }
      label += utils.colors[appColor](app.label) + utils.colors[taskColor](app.hasDefault ? ' (default)' : '');

      item.name = app.hasDefault ? label : new Separator(label);
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
        list = list.concat(renderTasks(app.tasks, (typeof last === 'undefined' ? ' ' : prefix + pad + (more ? '|' : ' ') + ' '), more, last));
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
      var self = this;
      this.type = 'app';
      this.label = name;
      this.parent = null;
      this.metadata = {};

      define(this, 'name', {
        enumerable: true,
        get: function() {
          if (!this.parent) return name;
          if (this.parent.root) return name;
          return this.parent.name + '\\.' + name;
        },
        set: function(val) {
          name = val;
        }
      });

      define(this, 'root', {
        enumerable: false,
        get: function() {
          return this.parent == null;
        }
      });

      define(this.metadata, 'value', {
        enumerable: true,
        get: function() {
          return self.name + (self.hasDefault ? ':default' : '');
        }
      });

      define(this.metadata, 'short', {
        enumerable: true,
        get: function() {
          return self.name + (self.hasDefault ? ':default' : '');
        }
      });
      this.tasks = [];
      this.nodes = [];
    }

    AppNode.prototype.addTask = function(task) {
      this.tasks.push(new TaskNode(task, this));
      return this;
    };

    AppNode.prototype.addApp = function(node) {
      node.parent = this;
      this.nodes.push(node);
      return this;
    };

    function TaskNode(task, parent) {
      if (!(this instanceof TaskNode)) {
        return new TaskNode(task, parent);
      }
      var self = this;
      var name = task.name
      var value = name;
      var short = name;
      this.type = 'task';
      this.label = name;
      this.metadata = {
        dependencies: task.deps
      };

      define(this, 'name', {
        enumerable: true,
        get: function() {
          return parent.name + ':' + name
        },
        set: function(val) {
          name = val;
        }
      });

      define(this.metadata, 'value', {
        enumerable: true,
        get: function() {
          return parent.name + ':' + value;
        },
        set: function(val) {
          value = val;
        }
      });

      define(this.metadata, 'short', {
        enumerable: true,
        get: function() {
          return parent.name + ':' + short;
        },
        set: function(val) {
          short = val;
        }
      });
    }

    /**
     * Separator class is an implementation from inquirer.
     */

    function Separator(line) {
      this.type = 'separator';
      this.line = line;
    }

    Separator.prototype.toString = function() {
      return this.line;
    };

    Separator.exclude = function(obj) {
      return obj.type !== 'separator';
    };
  }
};

function define(obj, key, value) {
  Object.defineProperty(obj, key, value);
}
