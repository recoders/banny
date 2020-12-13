require('dotenv-load')();

module.exports = {
  apps: [{
    name: process.env.APP_NAME,
    script: 'src/main.ts',
    watch: ['src/**/*.{js,ts}']
  }, {
    name: process.env.APP_NAME + '-sheduler',
    script: 'src/tasks.ts',
    watch: ['src/**/*.{js,ts}']
  }],
};
