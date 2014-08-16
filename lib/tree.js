var _ = require('underscore');
// AST manipulation functions

// Add parent references to all nodes
function decorate (tree, parent, key, index) {
  if (tree == null || typeof tree !== 'object') {
    return;
  }
  tree.parentage = {
    node: parent || tree,
    key: key,
    index: index,
  };

  Object.keys(tree).forEach(function (childKey) {
    if (key === 'parentage') {
      return;
    }

    var attr = tree[childKey];
    if (Array.isArray(attr)) {
      attr.forEach(function (child, childIndex) {
        decorate(child, tree, childKey, childIndex);
      });
    } else if (typeof attr === 'object') {
      decorate(attr, tree, childKey);
    }
  });
  return tree;
}

// Apply callback to every node in the tree
function walk (tree, callback) {
  if (tree == null || typeof tree !== 'object') { return; }
  callback(tree);
  Object.keys(tree).forEach(function (key) {
    if (key === 'parentage') {
      return;
    }
    var attr = tree[key];
    if (Array.isArray(attr)) {
      attr.forEach(function (child) {
        walk(child, callback);
      });
    } else {
      walk(attr, callback);
    }
  });
}

function getNodeAt (parentage) {
  var child = parentage.node[parentage.key];
  if (parentage.key == null) {
    return parentage.node;
  }
  if (parentage.index == null) {
    return child;
  }
  return child[parentage.index];
}

// Swap two nodes; they do not have to be part of the same tree
function swapNodes (a, b) {
  var bPar = _.clone(b.parentage);

  b.parentage = a.parentage;
  if (a.parentage.key) {
    if (a.parentage.index == null) {
      a.parentage.node[a.parentage.key] = b;
    } else {
      a.parentage.node[a.parentage.key][a.parentage.index] = b;
    }
  } else {
    b.parentage.node = b;
  }

  a.parentage = bPar;
  if (bPar.key) {
    if (bPar.index == null) {
      bPar.node[bPar.key] = a;
    } else {
      bPar.node[bPar.key][bPar.index] = a;
    }
  } else {
    a.parentage.node = a;
  }
}

// get an array of all matching nodes in a tree
function find (tree, callback) {
  var nodes = [];
  walk(tree, function (node) {
    if (callback(node)) {
      nodes.push(node);
    }
  });
  return nodes;
}

module.exports = {
  // Preprocess the tree to mark every child with its parent
  decorate: decorate,
  walk: walk,
  find: find,
  getNodeAt: getNodeAt,
  swapNodes: swapNodes,
};
