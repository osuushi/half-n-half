var tree = require('../lib/tree.js');
var esprima = require('esprima');
var escodegen = require('escodegen');
var fixtures = require('./fixtures');
/*
  ======== A Handy Little Nodeunit Reference ========
  https://github.com/caolan/nodeunit

  Test methods:
    test.expect(numAssertions)
    test.done()
  Test assertions:
    test.ok(value, [message])
    test.equal(actual, expected, [message])
    test.notEqual(actual, expected, [message])
    test.deepEqual(actual, expected, [message])
    test.notDeepEqual(actual, expected, [message])
    test.strictEqual(actual, expected, [message])
    test.notStrictEqual(actual, expected, [message])
    test.throws(block, [error], [message])
    test.doesNotThrow(block, [error], [message])
    test.ifError(value)
*/

function testTreesEqual(test, a, b, message) {
  test.equal(escodegen.generate(a), escodegen.generate(b), message);
}

function loadTree(name) {
  return tree.decorate(esprima.parse(fixtures(name)));
}

exports['Tree utilities'] = {
  'decorate tree': function (test) {
    var src = fixtures('basic');
    var ast = esprima.parse(src);
    tree.decorate(ast);
    tree.walk(ast, function (node) {
      if (!node.parentage) { return; }

      var actualNode = tree.getNodeAt(node.parentage);
      test.equal(actualNode, node, 'should be able to find every node');
    });
    test.done();
  },

  'swap nodes': function (test) {
    var orig = loadTree('swap-before');
    var before = loadTree('swap-before');
    var after = loadTree('swap-after');

    // Find the conditional
    var conditional = tree.find(before, function (node) {
      return node.type === 'IfStatement';
    })[0];
    tree.swapNodes(conditional.consequent, conditional.alternate);
    testTreesEqual(test, before, after, 'should swap the conditional blocks');
    tree.swapNodes(conditional.consequent, conditional.alternate);
    testTreesEqual(test, before, orig, 'should swap them back');
    test.done();
  },
};
