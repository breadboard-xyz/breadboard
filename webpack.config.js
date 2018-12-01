const path = require('path');

const CopyWebpackPlugin = require('copy-webpack-plugin');

const config = {
  entry: './public/entry.js',
  output: {
    path: path.resolve('')
  },
  plugins: [
    new CopyWebpackPlugin([
      { from: './node_modules/breadboard-sdk-web/dist/sdk.js', to: 'public/js/bundle.js' },
    ], {})
  ]
}

module.exports = [config];