'use strict';

var assemble = require('./app');
assemble.chooseTasks(function(err, answers) {
  if (err) return console.error(err);
  assemble.buildAll(answers.apps, function(err) {
    if (err) return console.error(err);
    console.log('done!');
  });
});
