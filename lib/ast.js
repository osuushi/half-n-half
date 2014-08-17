require('./init');
var esprima = require('esprima');
var escodegen = require('escodegen');
var tree = require('./tree');

function AST(stringOrAst) {
  var string;
  if (_.isString(stringOrAst)) {
    string = stringOrAst;
  } else if (stringOrAst instanceof AST){
    string = stringOrAst.toString();
  } else { //subtree
    this.tree = stringOrAst;
    return;
  }
  this.tree = tree.decorate(esprima.parse(string, {range: true}));
}

_.extend(AST.prototype, {
  find: function (callback) {
    return tree.find(this.tree, callback);
  },
  findOne: function (callback) {
    return tree.findOne(this.tree, callback);
  },
  walk: function (callback) {
    return tree.walk(this.tree, callback);
  },
  clone: function () {
    return new AST(this);
  },

  // Find the templated nodes and replace them with matching items from `context`
  // context should be a hash of AST objects which will be cloned;
  template: function (context) {
    var placeholders = this.find(function (node) {
      return node.type === 'Identifier' && node.name.slice(0,1) === '$';
    });
    placeholders.forEach(function (placeholder) {
      var key = placeholder.name.slice(1);
      if (!context[key]) { return; }
      var replacement = context[key].clone();
      replacement = new AST(replacement.tree.body[0].expression);
      tree.swapNodes(placeholder, replacement.tree);
    });
  },

  isEqual: function (that) {
    return this.toString() === that.toString();
  },

  toString: function () {
    return escodegen.generate(this.tree);
  },

  // Changes made to the AST may cause subtle differences, so normalize is a good idea
  // after modification, especially before equality testing.
  normalize: function () {
    this.tree = tree.decorate(esprima.parse(this.toString()));
  },
});

// static methods
_.extend(AST, {
  findAncestorWithType: function (node, type) {
    return tree.findAncestor(node, function (ancestor) {
      return ancestor.type === type;
    });
  },
});

module.exports = AST;
