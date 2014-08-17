require('./init');
// AST manipulation functions

// Add parent references to all nodes
function decorate (tree, parent, key, index) {
  if (tree == null || typeof tree !== 'object') {
    return;
  }
  tree._parentage = {
    node: parent || tree,
    key: key,
    index: index,
  };

  Object.keys(tree).forEach(function (childKey) {
    if (key == null || key.slice(0,1) === '_') { return; }

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
    // ignored attributes
    if (key.slice(0,1) === '_') { return; }

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

function getNodeAt (_parentage) {
  var child = _parentage.node[_parentage.key];
  if (_parentage.key == null) {
    return _parentage.node;
  }
  if (_parentage.index == null) {
    return child;
  }
  return child[_parentage.index];
}

// Swap two nodes; they do not have to be part of the same tree
function swapNodes (a, b) {
  var bPar = _.clone(b._parentage);
  
  b._parentage = a._parentage;
  if (a._parentage.key) {
    if (a._parentage.index == null) {
      a._parentage.node[a._parentage.key] = b;
    } else {
      a._parentage.node[a._parentage.key][a._parentage.index] = b;
    }
  } else {
    b._parentage.node = b;
  }

  a._parentage = bPar;
  if (bPar.key) {
    if (bPar.index == null) {
      bPar.node[bPar.key] = a;
    } else {
      bPar.node[bPar.key][bPar.index] = a;
    }
  } else {
    a._parentage.node = a;
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

function findAncestor(node, callback) {
  if (node.key == null) { return null; }
  do {
    node = node._parentage.node;
    if (callback(node)) { return node; }
  } while (node._parentage.key != null);
}

function get(node, keyPath) {
  var keys = keyPath.split('.');
  keys.forEach(function (key) {
    node = node[key];
  });
  return node;
}

module.exports = {
  // Preprocess the tree to mark every child with its parent
  decorate: decorate,
  get: get,
  walk: walk,
  find: find,
  getNodeAt: getNodeAt,
  swapNodes: swapNodes,
  findAncestor: findAncestor,
};
