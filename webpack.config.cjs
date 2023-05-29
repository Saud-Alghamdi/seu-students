const path = require("path");
const Dotenv = require('dotenv-webpack');

module.exports = {
  mode: "production",
  entry: "./client/js/entry.js",
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "client/js/dist"),
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        resolve: {
          fullySpecified: false,
        },
      },
    ],
  },
  plugins: [
    new Dotenv()
  ]
};
