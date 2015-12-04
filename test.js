/*!
 * base-list <https://github.com/jonschlinkert/base-list>
 *
 * Copyright (c) 2015 .
 * Licensed under the MIT license.
 */

'use strict';

/* deps:mocha */
var assert = require('assert');
var should = require('should');
var baseList = require('./');

describe('baseList', function () {
  it('should:', function () {
    baseList('a').should.eql({a: 'b'});
    baseList('a').should.equal('a');
  });

  it('should throw an error:', function () {
    (function () {
      baseList();
    }).should.throw('baseList expects valid arguments');
  });
});
