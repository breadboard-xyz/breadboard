var Promise       = require('bluebird')
  , express       = require('express')
  , winston       = require('winston')
  , _             = require('lodash')
  , http_proxy    = require('http-proxy')
  , request       = require('request')
  , chalk         = require('chalk')
  ;

var proxy = http_proxy.createProxyServer({})

var app = express();

app.set('view engine', 'pug');

app.get(/ls\/(.*\.git)$/, (req, res) => {
  let remote    = 'https://' + req.params[0]
    , branch    = req.query['branch'] || req.query['sha']
    , token     = undefined
    ;

  request({
      url     : 'http://localhost:8585/ls'
    , method  : 'POST'
    , json    : true
    , body    : { remote, branch, token }
  }).pipe(res);
});

app.get(/pull\/(.*\.git)$/, (req, res) => {
  let remote    = 'https://' + req.params[0]
    , token     = undefined
    ;

  request({
      url     : 'http://localhost:8585/pull'
    , method  : 'POST'
    , json    : true
    , body    : { remote, token }
  }).pipe(res);
});

app.get('/', (req, res) => {
  res.render('index');
});

app.all('*', (req, res, next) => {
  proxy.web(req, res, { target : 'http://localhost:8070' });
});

function listen() {
  // note: this needs to be a function and not lambda
  app.listen(8040, function() {
    let port = this.address().port;

    console.log(chalk.inverse.bold('****                        Breadboard                        ****'))
    console.log(chalk.bgGreen.bold('   \u2192 open http://localhost:8040/                                  '))
  });
}

module.exports = {
    listen
};