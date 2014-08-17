require('./init');

exports['AST'] = {
  'templating': function (test) {
    var template = AST.fixture('template-before');
    var context = {
      bar: AST.fixture('simple'),
    };
    var expected = AST.fixture('template-after');
    template.template(context);
    template.normalize();
    expected.normalize();
    test.equal(template.toString(), expected.toString(), 'tree should template correctly');
    test.done();
  }
};
