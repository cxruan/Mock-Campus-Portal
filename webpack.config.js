const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

const outputDirectory = 'public';

module.exports = {
  entry: ['./src/client/index.js'],
  output: {
    path: path.join(__dirname, outputDirectory),
    filename: 'bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader'
        }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.less$/,
        use: ['style-loader', 'css-loader', 'less-loader']
      }
    ]
  },
  resolve: {
    extensions: ['*', '.js', '.jsx']
  },
  devServer: {
    port: 3000,
    open: false,
    hot: true,
    proxy: {
      '/api': 'http://localhost:3999',
      '/uploads': 'http://localhost:3999'
    }
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/client/public/index.html',
      filename: 'index.html'
      // favicon: './public/favicon.ico'
    })
  ]
};
