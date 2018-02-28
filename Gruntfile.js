'use strict';

module.exports = function (grunt) {
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
        jsonlint: {
            format: {
                src: [
                    '*.json',
                    '.*.json'
                ],
                options: {
                    format: true,
                    indent: 2
                }
            }
        },
        jsbeautifier: {
            full: {
                options: {
                    config: '.jsbeautifyrc'
                },
                src: [
                    'index.html',
                    '*.js',
                    'lib/**/*',
                    'styles/**/*'
                ]
            }
        },
        eslint: {
            full: {
                options: {
                    configFile: '.eslintrc.json'
                },
                src: ['lib/**/*.js']
            }
        },
        stylelint: {
            full: {
                options: {
                    configFile: 'stylelint.config.js',
                    formatter: 'string',
                    allowEmptyInput: true
                },
                src: ['styles/*.css']
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
        'jsbeautifier:full',
        'jsonlint:format',
        'eslint:full',
        'stylelint:full',
        'cssmin:dist',
        'htmlmin:dist',
        'concat:js',
        'babel:dist'
    ]);
};
