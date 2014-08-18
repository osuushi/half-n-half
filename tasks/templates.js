var fs = require('fs');
var _ = require('lodash');

module.exports = function (grunt) {
  grunt.registerTask('templates', function () {
    var templates = fs.readdirSync('templates').map(function (fileName) {
      var name = fileName.split('.')[0];
      return [name, fs.readFileSync('templates/' + fileName, 'utf8')];
    });
    fs.writeFileSync('gen/templates.json', JSON.stringify(_.zipObject(templates)));
  });
};
