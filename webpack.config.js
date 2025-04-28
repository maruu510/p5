import { join, resolve } from "node:path";
import process from "node:process";

export default {
  entry: './src/index.jsx',
  output: {
    path: resolve(process.cwd(), 'dist'),
    filename: 'bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  devServer: {
    static: {
      directory: join(process.cwd(), 'public'),
    },
    port: 3000,
  },
};