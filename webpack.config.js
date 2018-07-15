const webpack = require('webpack');

module.exports = {
  entry: './src/GameDemo',

  output: {
    filename: 'bundle.js'
  },
    plugins: [
        new webpack.LoaderOptionsPlugin({
            debug: true
        })
    ],
    optimization: {
        // We no not want to minimize our code.
        minimize: false
    },
    watch: true
};