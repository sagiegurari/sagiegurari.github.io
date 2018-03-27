'use strict';

const path = require('path');
const webpack = require('webpack');

module.exports = {
    entry: './lib/app.js',
    output: {
        path: path.resolve(__dirname, 'dist/lib'),
        filename: 'app.js'
    },
    devtool: false,
    module: {
        rules: [{
            test: /\.js$/,
            exclude: /node_modules/,
            use: {
                loader: 'babel-loader',
                options: {
                    minified: false,
                    presets: ['env']
                }
            }
        }]
    },
    plugins: [
        new webpack.ProvidePlugin({
            $: "jquery",
            jQuery: "jquery"
        })
    ]
};
