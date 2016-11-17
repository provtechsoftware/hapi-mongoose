'use strict';

module.exports = function (grunt) {
  if (process.env.TEST_FILE && !grunt.option('file')) {
    grunt.option('file', process.env.TEST_FILE);
  }
  if (process.env.TEST_DIR && !grunt.option('dir')) {
    grunt.option('dir', process.env.TEST_DIR);
  }

  grunt.initConfig({
    tsd: {
      refresh: {
        options: {
          command: 'reinstall',
          config: './tsd.json'
        }
      }
    },
    ts: {
      default: grunt.file.readJSON('tsconfig.json')['compilerOptions']
    },
    tslint: {
      options: {
        configuration: grunt.file.readJSON('.tslint')
      },
      files: {
        src: ['src/**/*.ts']
      }
    },
    mochaTest: {
      test: {
        options: {
          reporter: 'spec'
        },
        src: ['dist/test/**/*.js']
      }
    }
  });

  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-ts');
  grunt.loadNpmTasks('grunt-tslint');
  grunt.loadNpmTasks('grunt-tsd');

  grunt.registerTask('default', ['tslint', 'tsd', 'ts']);
  grunt.registerTask('test',    ['tslint', 'tsd', 'ts', 'mochaTest']);
};
