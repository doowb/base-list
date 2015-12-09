'use strict';

var list = require('../');
var Assemble = require('assemble-core');
var assemble = new Assemble({name: 'simple'});
assemble.define('apps', {});
assemble.use(function fn() {
  if (!this.apps) this.define('apps', {});
  this.define('addApp', function(name, app) {
    this.apps[name] = app;
    this.run(app);
    return app;
  });
  return fn;
});

assemble.use(list('apps', {
  method: 'app',
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

console.log('-------------------------');
console.log();

assemble.displayTasks();

console.log();
console.log('-------------------------');
console.log();

var app1 = assemble.addApp('app-1', new Assemble({name: 'app-1'}));
assemble.displayTasks();

console.log();
console.log('-------------------------');
console.log();

app1.task('foo', function(cb) {
  cb();
});
assemble.displayTasks();

console.log();
console.log('-------------------------');
console.log();
