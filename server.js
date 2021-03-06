import express from 'express'
import graphQLHTTP from 'express-graphql'
import path from 'path'
import webpack from 'webpack'
import WebpackDevServer from 'webpack-dev-server'
import { sassLoader, cssLoader, vidLoader } from './loaders.js'
import { Schema } from './src/data/schema'
import { CronJob } from 'cron'
import updateMediumDataFrom from './src/apis/scrape-medium/index.js'
import updateReposDataFrom from './src/apis/github/index.js'
import updateGoogleDriveDataFrom from './src/apis/google-drive/index.js'
import chalk from 'chalk'
import * as my from './config/config.js'
// import HtmlWebpackPlugin from 'html-webpack-plugin'

// Runs every minute
var mediumJob = new CronJob('0  * * * * *', () => {
    console.log(chalk.green('Medium just happened'));
    updateMediumDataFrom(my.medium.username)
  }, () => {
    // This function is executed when the job stops
  },
  true, // Start the job right now
  'America/Los_Angeles' // Time zone of this job.
);

// Runs every 30 minutes
var githubJob = new CronJob('0 */30 * * * *', () => {
    console.log(chalk.blue('Github just happened'));
    updateReposDataFrom(my.github.username)
  }, () => {}, true, 'America/Los_Angeles'
);

// Runs every 20 minutes
var googleDriveJob = new CronJob('0 */30 * * * *', () => {
    console.log(chalk.cyan('Google Drive just happened'));
    updateGoogleDriveDataFrom(my.google.drive.folderId)
  }, () => {}, true, 'America/Los_Angeles'
);


const APP_PORT = 3000;
const GRAPHQL_PORT = 8080;

// Expose a GraphQL endpoint
let graphQLServer = express();
graphQLServer.use('/', graphQLHTTP({
  graphiql: true,
  pretty: true,
  schema: Schema,
}));
graphQLServer.listen(GRAPHQL_PORT, () => console.log(
  `GraphQL Server is now running on http://localhost:${GRAPHQL_PORT}`
));


// Serve the Relay app
let compiler = webpack({
  devtool: "eval-source-map",
  context: __dirname + '/',
  entry: path.resolve(__dirname, 'src', 'app.jsx'),
  output: {
    filename: 'app.js',
    path: '/public',            // webpack-dev-server will serve the static files from here. It’ll watch your source files for changes and when changes are made the bundle will be recompiled.
    publicPath: './'            // This modified bundle is served from memory at the relative path specified here.  It will not be written to your configured output directory.
  },
  module: {
    loaders: [
      {
        test: /.js[x]?$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      },
      /* For Loading Images in CSS/SCSS Files */
      {
        test: /\.(png|jpg|jpeg|gif|svg)$/,
        loader: 'url-loader'
      },
      /* Compiles css -> js */
      {
        test: /\.css$/,
        loader: cssLoader
      },
      /* Compiles sass -> css -> js */
      {
        test: /\.scss$/,
        loader: sassLoader
      },
      /* DOESN'T WORK :( */
      {
        test: /\.(webm|mp4|mov|mpeg|avi|m4v|ogg)$/,
        loader: vidLoader
      }
    ]
  },
  resolve: {
    moduleDirectories: ['node_modules', './src', 'public', 'bower_components'],
    extensions: ['', '.js', '.json', '.jsx']
  },
  plugins: [
    new webpack.ProvidePlugin({
        // Makes the keys (i.e. $, _, classNames, etc.) available in any module
        $:          'jquery',
        jQuery:     'jquery',
        _:          'lodash',
        classNames: 'classnames',
        my:         path.resolve(__dirname, 'config/config.js')
    }),
    // new HtmlWebpackPlugin()
  ]
});

let app = new WebpackDevServer(compiler, {
  contentBase: path.resolve(__dirname, 'public'),
  proxy: {'/graphql': `http://localhost:${GRAPHQL_PORT}`},
  publicPath: '/src/',
  stats: {colors: true},
  inline: true,
  historyApiFallback: true
});

// Serve static resources
app.use('/', express.static(path.resolve(__dirname, 'public')));
app.listen(APP_PORT, () => {
  console.log(`App is now running on http://localhost:${APP_PORT}`);
});