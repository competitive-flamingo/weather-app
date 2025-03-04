const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
  mode: 'development', // Development mode
  devtool: 'inline-source-map', // Source maps for debugging
  devServer: {
    static: './dist', // Serve files from the dist folder
    watchFiles: ["./src/index.html", "./src/weatherData.html"], // Watch HTML files for changes
  },
});