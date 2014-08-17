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
    if (childKey === 'loc') { return; }
    if (childKey.slice(0,1) === '_') { return; }

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
    if (key === 'loc') { return; }
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
  // swap locations
  var tmp = a.range;
  a.range = b.range;
  b.range = tmp;
}

// get an array of all matching nodes in a tree
function find (tree, predicate) {
  var nodes = [];
  walk(tree, function (node) {
    if (predicate(node)) {
      nodes.push(node);
    }
  });
  return nodes;
}

// Find some node matching the criteria (order not defined)
function findOne(tree, predicate) {
  var node;
  walk(tree, function (child) {
    if (predicate(child)) {
      predicate = function () {};
      node = child;
    }
  });
  return node;
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

function sortedNodes (tree) {
  // Get actual nodes
  var nodes = find(tree, function (node) { return node.type != null; });
  // Sort by start, then by end so that children come after parents
  nodes.sort(function (a, b) { return b.range[1] - a.range[1]; })
  nodes.sort(function (a, b) { return a.range[0] - b.range[0]; })
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
  findOne: findOne,
};
