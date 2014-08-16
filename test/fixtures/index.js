var fs = require('fs');

module.exports = function (name) {
  return fs.readFileSync('./test/fixtures/' + name + '.js', 'utf8');
};
