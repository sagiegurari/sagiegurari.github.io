'use strict';

module.exports = function(grunt) {
    require('time-grunt')(grunt);
    require('jit-grunt')(grunt);

    grunt.config.init({
        clean: {
            options: {
                force: true
            },
            dot: 'true',
            dist: {
                src: ['dist/**']
            }
        },
        cssmin: {
            options: {},
            dist: {
                files: {
                    'dist/styles/styles.css': [
                        'node_modules/normalize.css/normalize.css',
                        'styles/*.css'
                    ]
                }
            }
        },
        htmlmin: {
            dist: {
                options: {
                    removeComments: true,
                    collapseWhitespace: true
                },
                files: {
                    'dist/index.html': 'index.html'
                }
            }
        },
        concat: {
            options: {
                sourceMap: true
            },
            js: {
                src: [
                    'lib/*.js',
                    '!lib/service-worker.js'
                ],
                dest: 'tmp/lib/app.js'
            }
        },
        babel: {
            options: {
                sourceMap: true,
                minified: true,
                presets: ['env']
            },
            dist: {
                files: {
                    'dist/lib/app.js': 'tmp/lib/app.js',
                    'dist/lib/service-worker.js': 'lib/service-worker.js'
                }
            }
        },
        watch: {
            dist: {
                files: [
                    'index.html',
                    'styles/**',
                    'lib/**'
                ],
                tasks: ['build'],
                options: {
                    spawn: false,
                }
            }
        }
    });

    grunt.registerTask('build', 'Run the full build flow.', [
        'clean:dist',
        'cssmin:dist',
        'htmlmin:dist',
        'concat:js',
        'babel:dist'
    ]);
};
