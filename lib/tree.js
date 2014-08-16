// AST manipulation functions

// Add parent references to all nodes
function decorateTree (tree, parent) {
  tree.parent = parent;
  Object.keys(tree).forEach(function (key) {
    var attr = tree[key];
    if (Array.isArray(attr)) {
      attr.forEach(function (child) {
        decorateTree(child, tree);
      });
    } else if (typeof attr === 'object') {
      decorateTree(attr, parent);
    }
  });
}

// Apply callback to every node in the tree
function walkTree (tree, callback) {
  Object.keys(tree).forEach(function (key) {
    var attr = tree[key];
    callback(attr);
    if (Array.isArray(attr)) {
      attr.forEach(callback);
    } else {
      callback(attr);
    }
  });
}

// get an array of all matching nodes in a tree
function findInTree (tree, callback) {
  var nodes = [];
  walkTree(function (node) {
    if (callback(node)) {
      nodes.push(node);
    }
  });
  return nodes;
}

module.exports = {
  // Preprocess the tree to mark every child with its parent
  decorateTree: decorateTree,
  walkTree: walkTree,
  findInTree: findInTree,
};
