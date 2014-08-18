require('./init');
var T = require('./templates');
var tree = require('./tree');
var tokens = require('./tokens');

var H = module.exports = {
  is: function (node, type) {
    return node.type === type;
  },

  isnt: function (node, type) {
    return !H.is(node, type);
  },

  isIdentifier: function (node) {
    return node.type === 'Identifier';
  },

  isLabelIdentifier: function (node) {
    if (!H.isIdentifier(node)) return;
    var relation = node._relation;
    if (relation.node.type !== 'LabeledStatement') return false;
    if (relation.key !== 'label') return false;
    return true;
  },

  isLetNode: function (node) {
    return node.name === tokens.let && H.isLabelIdentifier(node);
  },

  isSyncNode: function (node) {
    return node.name === tokens.sync && H.isIdentifier(node);
  },

  isCompoundNode: function (node) {
    return H.isLetNode(node) && H.isSyncNode(node);
  },

  makeSync: function (nodes) {
    var functionVars = T.ast('functionVars');
    var sync = T.ast('sync', {functionVars: functionVars}).findOne(function (node) {
      return H.is(node, 'ReturnStatement');
    });
    var body = sync.findOne(function (node) {
      return H.is(node, 'Identifier') && node.name === '$body';
    });
    var relation = body._relation;
    // Remove body element
    relation.node[relation.key].pop();
    tree.push(relation.node, relation.key, nodes);
    return sync;
  }
};
