var templates = require('../gen/templates');
var AST = require('./ast');

module.exports = {
  get: function (name) {
    return templates[name];
  },
  ast: function (name, context) {
    var ast = AST(this.get(name));
    if (context) {
      ast.template(context);
    }
    return ast;
  },
}
