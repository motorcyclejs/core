var babel = require('babel-core')

module.exports = function (wallaby) {
  return {
    // set `load: false` to all of the browserified source files and tests,
    // as they should not be loaded in browser,
    // their browserified versions will be loaded instead
    files: [
      {pattern: 'src/**/*.js', load: true}
    ],

    tests: [
      {pattern: 'test/**/*.js', load: true}
    ],

    compilers: {
      "**/*.js": wallaby.compilers.babel({
        babel: babel,
        presets: [
          'es2015'
        ]
      })
    },

    env: {
      type: 'node'
    },

    testFramework: 'mocha',

    debug: true
  };
};
