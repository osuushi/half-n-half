require('./init');
var tokens = require('./tokens');
var H = module.exports = {
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
};
