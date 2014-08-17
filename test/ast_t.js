require('./init');

exports['AST'] = {
  'templating': function (test) {
    var template = AST.fixture('template-before');
    var context = {
      bar: AST.fixture('simple'),
    };
    var expected = AST.fixture('template-after');
    template.template(context);
    test.expect(template.isEqual(expected), 'tree should template correctly');
    test.done();
  }
};
