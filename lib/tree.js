require('./init');
// AST manipulation functions

// Add parent references to all nodes
function decorate (tree, parent, key, index) {
  if (tree == null || typeof tree !== 'object') {
    return;
  }
  tree._relation = {
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

function getNodeAt (_relation) {
  var child = _relation.node[_relation.key];
  if (_relation.key == null) {
    return _relation.node;
  }
  if (_relation.index == null) {
    return child;
  }
  return child[_relation.index];
}

// Swap two nodes; they do not have to be part of the same tree
function swapNodes (a, b) {
  var bPar = _.clone(b._relation);
  b._relation = a._relation;
  if (a._relation.key) {
    if (a._relation.index == null) {
      a._relation.node[a._relation.key] = b;
    } else {
      a._relation.node[a._relation.key][a._relation.index] = b;
    }
  } else {
    b._relation.node = b;
  }

  a._relation = bPar;
  if (bPar.key) {
    if (bPar.index == null) {
      bPar.node[bPar.key] = a;
    } else {
      bPar.node[bPar.key][bPar.index] = a;
    }
  } else {
    a._relation.node = a;
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
    node = node._relation.node;
    if (callback(node)) { return node; }
  } while (node._relation.key != null);
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

// Insert a node (or nodes) for a given node and key, and update parentage accordingly
function insert(parent, key, index, nodes) {
  nodes = Array.isArray(nodes) ? nodes : [nodes];
  var array = parent[key];
  nodes.forEach(function (node, i) {
    var nodeIndex = index + i;
    array.splice(nodeIndex, node);
    node._relation = {
      node: parent,
      key: key,
      index: nodeIndex,
    }
  })
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
  insert: insert,
};
