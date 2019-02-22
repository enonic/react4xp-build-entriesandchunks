/* eslint-disable */
var path = require('path');
var nodeExternals = require('webpack-node-externals');

module.exports = {
    entry: path.join(__dirname, 'src', 'index.js'),
    output: {
        path: path.join(__dirname, 'lib'),
        filename: 'index.js',
    },
    
    //target: 'node', 
    //externals: [nodeExternals()], // in order to ignore all modules in node_modules folder
    
    module: {
        rules: [
          {
            test: /\.js$/,
            exclude: /(node_modules´)/,
            use: {
              loader: 'babel-loader',
              options: {
                presets: ['babel-preset-env']
              }
            }
          }
        ]
      }
};
