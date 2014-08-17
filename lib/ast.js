var _ = require('underscore');
var esprima = require('esprima');
var escodegen = require('escodegen');
var tree = require('./tree');

function AST(stringOrAst) {
  var string;
  if (_.isString(stringOrAst)) {
    string = stringOrAst;
  } else {
    string = escodegen.generate(stringOrAst);
  }
  this.tree = tree.decorate(esprima.parse(string));
}

_.extend(AST.prototype, {
  find: function (callback) {
    return tree.find(this.tree, callback);
  },
  walk: function (callback) {
    return tree.walk(this.tree, callback);
  },
});


module.exports = AST;
