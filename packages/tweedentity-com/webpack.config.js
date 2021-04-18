const NodePolyfillPlugin = require("node-polyfill-webpack-plugin")

var config = {
  entry: './src/index.js',
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
        use: ['babel-loader', 'eslint-loader']
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
    'react-router-dom': 'ReactRouterDOM'
  }
};

module.exports = (env, argv) => {
  if (argv.mode === 'development') {
    config.devtool = 'inline-source-map'
  }

  if (argv.mode === 'production') {
    //...
  }

  return config;
};

