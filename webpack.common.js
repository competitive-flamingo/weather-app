const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  entry: {
    app: './src/script.js', // Entry point for index.html
    weatherData: './src/weatherData.js', // Entry point for weatherData.html
  },
  output: {
    filename: "[name].js", // Output JS files (app.js, weatherData.js)
    path: path.resolve(__dirname, "dist"),
    clean: true, // Clean the dist folder before each build
    publicPath: '/weather-app/', // Base path for assets
  },
  plugins: [
    // Plugin for index.html
    new HtmlWebpackPlugin({
      template: "./src/index.html", // Source HTML file
      filename: "index.html", // Output HTML file
      chunks: ['app'], // Include only the 'app' JS file
    }),
    // Plugin for weatherData.html
    new HtmlWebpackPlugin({
      template: "./src/weatherData.html", // Source HTML file
      filename: "weatherData.html", // Output HTML file
      chunks: ['weatherData'], // Include only the 'weatherData' JS file
    }),
  ],
  module: {
    rules: [
      // Rule for CSS files
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"], // Use style-loader in development
      },
      // Rule for HTML files
      {
        test: /\.html$/i,
        loader: "html-loader",
      },
      // Rule for images
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: "asset/resource",
      },
      // Rule for fonts
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource',
      },
    ],
  },
};