var fs = require('fs');

module.exports = function (grunt) {
  grunt.registerTask('templates', function () {
    var templates = fs.readdirSync('templates').map(function (fileName) {
      return fs.readFileSync('templates/' + fileName, 'utf8');
    });
    fs.writeFileSync('gen/templates.json', JSON.stringify(templates));
  });
};
