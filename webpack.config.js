import path from "path";

const __dirname = path.resolve();

export default {
  mode: "production",
  entry: "./client/js/entry.js",
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "client/js/dist"),
  },
};
