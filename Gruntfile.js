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
        babel: {
            options: {
                sourceMap: true,
                minified: true,
                presets: ['env']
            },
            dist: {
                files: {
                    'dist/lib/app.js': [
                        'lib/*.js',
                        '!lib/service-worker.js'
                    ],
                    'dist/lib/service-worker.js': 'lib/service-worker.js'
                }
            }
        }
    });

    grunt.registerTask('build', 'Run the full build flow.', [
        'clean:dist',
        'cssmin:dist',
        'htmlmin:dist',
        'babel:dist'
    ]);
};
