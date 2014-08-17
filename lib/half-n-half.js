require('./init');
var esprima = require('esprima');

module.exports.parse = function(input) {
  var output = esprima.parse(input);
  console.log(JSON.stringify(output));
};
