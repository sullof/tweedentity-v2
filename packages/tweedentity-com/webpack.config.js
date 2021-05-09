const NodePolyfillPlugin = require("node-polyfill-webpack-plugin")
const ESLintPlugin = require('eslint-webpack-plugin')

var config = {
  entry: './src',
  output: {
    path: __dirname + '/public',
    publicPath: '/',
    filename: 'bundle.js'
  },
  devServer: {
    contentBase: './dist',
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: ['babel-loader']
      }
    ]
  },
  plugins: [
    new NodePolyfillPlugin()
  ],
  externals: {
    react: 'React',
    'react-bootstrap': 'ReactBootstrap',
    'react-dom': 'ReactDOM',
    'react-router-dom': 'ReactRouterDOM',
    ethers: 'ethers'
  }
};

module.exports = (env, argv) => {
  if (argv.mode === 'development') {
    config.devtool = 'inline-source-map'
  }

  if (argv.mode === 'production') {
    config.plugins.push(
      new ESLintPlugin({
        files: 'src/**/*.js',
      })
    )
  }

  return config;
};

