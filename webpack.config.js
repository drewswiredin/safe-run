var webpack = require("webpack");

module.exports = {
  mode: "development",
  entry: __dirname + "/src/main.js",
  output: {
    path: __dirname + "/dist/",
    filename: "index.js",
    publicPath: "dist"
  },
  devServer: {
    inline: true,
    contentBase: __dirname + "/dist",
    port: 3000
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: ["babel-loader"]
      }
    ]
  }
};
