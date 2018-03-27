'use strict';

module.exports = function (grunt) {
    require('time-grunt')(grunt);
    require('jit-grunt')(grunt);

    const webpackConfig = require('./webpack.config.js');

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
                    'partials/**/*'
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
                    allowEmptyInput: true,
                    fix: true
                },
                src: [
                    'styles/*'
                ]
            }
        },
        postcss: {
            options: {
                map: false,
                processors: [
                    require('postcss-nested')(),
                    require('autoprefixer')(),
                    require('cssnano')()
                ]
            },
            styles: {
                src: 'tmp/styles/styles.css'
            }
        },
        template: {
            html: {
                files: {
                    'index.html': [
                        'templates/index.html'
                    ]
                },
                options: {
                    data: {
                        sidenav: grunt.file.read('./partials/sidenav.html', {
                            encoding: 'utf8'
                        }),
                        projectsPage: grunt.file.read('./partials/projects-page.html', {
                            encoding: 'utf8'
                        }),
                        resumePage: grunt.file.read('./partials/resume-page.html', {
                            encoding: 'utf8'
                        })
                    }
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
            assets: {
                files: [{
                        expand: true,
                        cwd: 'node_modules/materialize-css/dist/',
                        src: ['fonts/**'],
                        dest: 'dist/',
                        filter: 'isFile'
                    },
                    {
                        expand: true,
                        src: ['images/**'],
                        dest: 'dist/',
                        filter: 'isFile'
                    }
                ]
            },
        },
        webpack: {
            options: {
                stats: true
            },
            development: Object.assign({
                devtool: true
            }, webpackConfig),
            production: webpackConfig
        },
        concat: {
            options: {
                sourceMap: true
            },
            unminified: {
                src: [
                    'node_modules/normalize.css/normalize.css',
                    'styles/*'
                ],
                dest: 'tmp/styles/styles.css'
            },
            css: {
                src: [
                    'tmp/styles/styles.css',
                    'node_modules/materialize-css/dist/css/materialize.min.css'
                ],
                dest: 'dist/styles/styles.css'
            }
        },
        watch: {
            dist: {
                files: [
                    '*.js',
                    '*.json',
                    'styles/**',
                    'lib/**',
                    'images/**',
                    'templates/**',
                    'partials/**'
                ],
                tasks: ['build-dev'],
                reload: true,
                atBegin: true,
                options: {
                    spawn: false
                }
            }
        }
    });

    grunt.registerTask('validateManifest', function () {
        const validate = require('web-app-manifest-validator');
        const manifest = require('./manifest.json');

        const errors = validate(manifest);

        if (errors && errors.length) {
            grunt.fail.warn(errors[0]);
        }
    });

    grunt.registerTask('pre-webpack', [
        'clean:dist',
        'template:html',
        'jsbeautifier:full',
        'jsonlint:format',
        'validateManifest',
        'eslint:full',
        'stylelint:full',
        'concat:unminified',
        'postcss:styles',
        'concat:css',
        'htmlmin:dist',
        'copy:assets'
    ]);

    grunt.registerTask('build-dev', 'Run the full build flow.', [
        'pre-webpack',
        'webpack:development'
    ]);

    grunt.registerTask('build', 'Run the full build flow.', [
        'pre-webpack',
        'webpack:production'
    ]);
};
