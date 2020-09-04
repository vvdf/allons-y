const path = require('path');

const ENTRY_FILE = path.join(__dirname, 'client', 'src', 'index.jsx');
const OUT_DIR = path.join(__dirname, 'client', 'dist');
// const SRC_DIR = path.join(__dirname, 'client', 'src');

module.exports = {
  mode: 'development',
  entry: ENTRY_FILE,
  output: {
    path: OUT_DIR,
    filename: 'bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'],
          },
        },
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
};
