require('./init');
var tree = require('./tree');
var AST = require('./ast');
var H = require('./helpers');

module.exports.parse = function(input) {
  var ast = new AST(input);
  // Process nodes in order of file location
  var nodes = tree.sortedNodes(ast.tree);

  // Filter to nodes that are important.
  nodes = nodes.filter(function (node) {
    return H.isLetNode(node) || H.isSyncNode(node);
  });

  nodes.forEach(processNode);
};

function processNode(node) {
  
}
