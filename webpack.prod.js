const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = merge(common, {
  mode: 'production', // Production mode
  module: {
    rules: [
      // Rule for CSS files in production
      {
        test: /\.css$/i,
        use: [MiniCssExtractPlugin.loader, "css-loader"], // Extract CSS into separate files
      },
    ],
  },
  plugins: [
    // Plugin to extract CSS into separate files
    new MiniCssExtractPlugin({
      filename: "[name].css", // Output CSS files (app.css, weatherData.css)
    }),
  ],
});