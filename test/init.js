global._ = require('lodash');
global.AST = require('../lib/ast');
global.fixtures = require('./fixtures');

AST.fixture = function (name) {
  return new AST(fixtures(name));
};
