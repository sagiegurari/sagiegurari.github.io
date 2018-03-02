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
                src: [
                    'dist/**',
                    'tmp/**'
                ]
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
                    'tmp/styles/styles.css': [
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
        copy: {
            dist: {
                files: [{
                    expand: true,
                    cwd: 'node_modules/materialize-css/dist/',
                    src: ['fonts/**'],
                    dest: 'dist/',
                    filter: 'isFile'
                }]
            },
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
            },
            css: {
                src: [
                    'tmp/styles/styles.css',
                    'node_modules/materialize-css/dist/css/materialize.min.css'
                ],
                dest: 'dist/styles/styles.css'
            },
            dist: {
                src: [
                    'node_modules/jquery/dist/jquery.min.js',
                    'tmp/lib/app-min.js',
                    'node_modules/materialize-css/dist/js/materialize.min.js'
                ],
                dest: 'dist/lib/app.js'
            },
        },
        babel: {
            options: {
                sourceMap: true,
                minified: true,
                presets: ['env']
            },
            dist: {
                files: {
                    'tmp/lib/app-min.js': 'tmp/lib/app.js',
                    'dist/lib/service-worker.js': 'lib/service-worker.js'
                }
            }
        },
        watch: {
            dist: {
                files: [
                    '*.js',
                    'index.html',
                    'styles/**',
                    'lib/**'
                ],
                tasks: ['build'],
                reload: true,
                options: {
                    spawn: false
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
        'concat:css',
        'htmlmin:dist',
        'concat:js',
        'babel:dist',
        'concat:dist',
        'copy:dist'
    ]);
};
