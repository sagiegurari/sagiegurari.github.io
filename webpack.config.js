'use strict';

const path = require('path');

module.exports = {
    entry: './lib/app.js',
    output: {
        path: path.resolve(__dirname, 'tmp/lib'),
        filename: 'app-pack.js'
    },
    devtool: false,
    mode: 'production',
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        sourceMap: true,
                        minified: true,
                        presets: ['env']
                    }
                }
            },
            {
                test: /\.hbs$/,
                use: 'raw-loader'
              }
        ]
    }
};
