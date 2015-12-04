'use strict';

var list = require('./');
var Assemble = require('assemble-core');
var assemble = new Assemble({name: 'base'});
assemble.define('apps', {});
assemble.use(function() {
  this.define('addApp', function(name, app) {
    this.apps[name] = app;
    this.run(app);
    return app;
  });
});

assemble.use(list('apps', {method: 'app'}));

assemble.task('foo', function(cb) {
  console.log('this is the foo task');
  cb();
});

assemble.task('bar', function(cb) {
  console.log('this is the bar task');
  cb();
});

assemble.task('baz', function(cb) {
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


assemble.taskList(function(err, answers) {
  if (err) return console.error(err);
  console.log(answers);
});
