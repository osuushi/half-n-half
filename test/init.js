global._ = require('underscore');
global.AST = require('../lib/ast');
global.fixtures = require('./fixtures');

AST.fixture = function (name) {
  return new AST(fixtures(name));
};
