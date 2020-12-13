require('dotenv-load')();

module.exports = {
  apps: [{
    name: process.env.APP_NAME,
    script: 'build/main.ts',
    watch: ['build/**/*.js']
  }, {
    name: process.env.APP_NAME + '-sheduler',
    script: 'build/tasks.js',
    watch: ['build/**/*.js']
  }],
};
