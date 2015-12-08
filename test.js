/*!
 * base-list <https://github.com/jonschlinkert/base-list>
 *
 * Copyright (c) 2015 .
 * Licensed under the MIT license.
 */

'use strict';

/* deps:mocha */
var Base = require('base-methods');
var assert = require('assert');
var list = require('./');

describe('baseList', function () {
  it('should add a displayTasks method to `app`', function () {
    var app = new Base();
    app.use(list());
    assert(typeof app.displayTasks === 'function');
  });

  it('should add a chooseTasks method to `app`', function () {
    var app = new Base();
    app.use(list());
    assert(typeof app.chooseTasks === 'function');
  });
});
