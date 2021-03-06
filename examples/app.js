'use strict';

var list = require('../');
var async = require('async');
var get = require('get-value');
var Assemble = require('assemble-core');
var assemble = new Assemble({name: 'base'});
assemble.define('apps', {});
assemble.use(function fn() {
  if (!this.apps) this.define('apps', {});
  this.define('addApp', function(name, app) {
    this.apps[name] = app;
    app.define('parent', this);
    this.run(app);
    return app;
  });

  this.define('getApp', function(name) {
    if (name === 'base') return this;
    name = name.replace(/^base\./, '')
      .split('.')
      .join('.apps.');
    return get(this.apps, name);
  });

  return fn;
});

assemble.use(function fn() {
  this.define('buildAll', function(apps, cb) {
    var self = this;
    async.eachOf(apps, function(tasks, name, next) {
      var app = self.getApp(name);
      if (!app) return next();
      app.build(tasks, next);
    }, cb);
  });
});

assemble.use(list('apps', {
  method: 'app',
  // taskColor: 'cyan',
  // appColor: 'green'
}));

assemble.task('foo', function(cb) {
  console.log('this is the foo task');
  cb();
});

assemble.task('bar', ['foo'], function(cb) {
  console.log('this is the bar task');
  cb();
});

assemble.task('baz', ['foo', 'bar'], function(cb) {
  console.log('this is the baz task');
  cb();
});

assemble.task('default', function(cb) {
  console.log('this is the default task');
  cb();
});

var app1 = assemble.addApp('app-1', new Assemble({name: 'app-1'}));
var app2 = assemble.addApp('app-2', new Assemble({name: 'app-2'}));
var app3 = assemble.addApp('app-3', new Assemble({name: 'app-3'}));

app1.task('foo', function(cb) {
  console.log('this is the app-1 foo task');
  cb();
});

app1.task('bar', function(cb) {
  console.log('this is the app-1 bar task');
  cb();
});

app1.task('baz', function(cb) {
  console.log('this is the app-1 baz task');
  cb();
});

app1.task('default', function(cb) {
  console.log('this is the app-1 default task');
  cb();
});

app1.addApp('app-1-A', new Assemble({name: 'app-1-A'}))
    .task('something', function (cb) {
      console.log('this is something from app1-A');
    });

app2.task('foo', function(cb) {
  console.log('this is the app-2 foo task');
  cb();
});

app2.task('bar', function(cb) {
  console.log('this is the app-2 bar task');
  cb();
});

app2.task('baz', function(cb) {
  console.log('this is the app-2 baz task');
  cb();
});

app2.task('default', function(cb) {
  console.log('this is the app-2 default task');
  cb();
});

app2.addApp('app-2-A', new Assemble({name: 'app-2-A'}))
    .task('something', function (cb) {
      console.log('this is something from app2-A');
    });

app3.task('foo', function(cb) {
  console.log('this is the app-3 foo task');
  cb();
});

app3.task('bar', function(cb) {
  console.log('this is the app-3 bar task');
  cb();
});

app3.task('baz', function(cb) {
  console.log('this is the app-3 baz task');
  cb();
});

app3.task('default', function(cb) {
  console.log('this is the app-3 default task');
  cb();
});

app3.addApp('app-3-A', new Assemble({name: 'app-3-A'}))
    .task('something', function (cb) {
      console.log('this is something from app3-A');
    });


module.exports = assemble;
