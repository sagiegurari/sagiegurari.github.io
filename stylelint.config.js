'use strict';

module.exports = {
    extends: 'stylelint-config-standard',
    defaultSeverity: 'error',
    rules: {
        'comment-whitespace-inside': 'never',
        'font-family-name-quotes': 'always-where-recommended',
        'font-weight-notation': 'named-where-possible',
        'function-blacklist': [],
        'function-comma-newline-before': 'never-multi-line',
        'function-url-quotes': 'always',
        'string-quotes': 'single',
        'value-keyword-case': 'lower',
        'value-no-vendor-prefix': true
    }
};
