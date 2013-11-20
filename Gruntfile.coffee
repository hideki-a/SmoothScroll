'use strict'

module.exports = (grunt) ->
  grunt.initConfig
    pkg:
      grunt.file.readJSON('package.json')
    
    meta:
      banner: '/*! <%= pkg.name %> -v<%= pkg.version %> <%= pkg.author %> | ' + 
              '<%= pkg.license %> */\n'

    jshint:
      options:
        jshintrc: '.jshintrc'
      all: [
        'src/smoothscroll.js'
      ]

    uglify:
      options:
        preserveComments: 'some'
        banner: '<%= meta.banner %>'
      dist:
        files:
          'dist/smoothscroll.min.js': ['src/smoothscroll.js']

  # Load grunt tasks.
  require('load-grunt-tasks')(grunt);

  # Register tasks.
  grunt.registerTask 'default', [
    'jshint'
    'uglify'
  ]
  
  return;