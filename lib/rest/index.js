var Promise       = require('bluebird')
  , express       = require('express')
  , winston       = require('winston')
  , _             = require('lodash')
  , config        = require('config-url')
  , http_proxy    = require('http-proxy')
  , request       = require('request')
  , chalk         = require('chalk')
  , account_sdk   = require('taskmill-core-account-sdk')
  , codedb_sdk    = require('taskmill-core-codedb-sdk')
  , Session       = require('cookie-session')
  ;

var proxy = http_proxy.createProxyServer({})

var app = express();

app.set('view engine', 'pug');

app.use(Session({
  name: 'session',
  keys: config.get('session.keys'),
  // Cookie Options
  maxAge: config.get('session.maxAge'),
  sameSite: 'strict'
}))

function get_bearer(req) {
  let bearer = req.get('authorization');

  if (!bearer && req.query.token) {
    bearer = `Bearer ${req.query.token}`;
  }

  if (!bearer && req.session.token) {
    bearer = `Bearer ${req.session.token}`;
  }

  return bearer;
}

// todo [akamel] use bearer directly with the codedb sdk instead of calling account_sdk first
app.get(/ls\/(.*\.git)$/, (req, res) => {
  let remote    = 'https://' + req.params[0]
    , branch    = req.query['branch'] || req.query['sha']
    , bearer    = get_bearer(req)
    ;

  account_sdk
    .findGitToken({ bearer })
    .catch((err) => { })
    .then((result) => {
      let token = _.get(result, 'data.token');
      request({
        url     : 'http://localhost:8585/ls'
        , method  : 'POST'
        , json    : true
        , body    : { remote, branch, token }
      }).pipe(res);
    });
});

app.get(/pull\/(.*\.git)$/, (req, res) => {
  let remote = 'https://' + req.params[0]
    , bearer = get_bearer(req)
    ;

  account_sdk
    .findGitToken({ bearer })
    .catch((err) => { })
    .then((result) => {
      let token = _.get(result, 'data.token');
      request({
          url     : 'http://localhost:8585/pull'
        , method  : 'POST'
        , json    : true
        , body    : { remote, token }
      }).pipe(res);
    });
});

app.get('/auth/callback', (req, res) => {
  let { token } = req.query
    , bearer    = `Bearer ${token}`
    ;

  account_sdk
    .findAccount({ bearer })
    .then((result) => {
      let id = result._id;
      return account_sdk
              .issueTokenById(id, { bearer, expires_in : 24 * 60 * 60 * 1000 })
              .then((result) => {
                let token = result;

                req.session = { token };
                res.redirect('/');
              });
    })
});

app.get('/', (req, res) => {
  let bearer = get_bearer(req);

  Promise
    .try(() => {
      if (bearer) {
        return account_sdk.findAccount({ bearer });
      }
    })
    .catch(() => {})
    .then((user) => {
      res.render('index', {
          strategies  : config.get('account.oauth.strategy')
        , bearer
        , user
      });
    })
});

app.get('/key', (req, res, next) => {
  let bearer = get_bearer(req);

  Promise
    .try(() => {
      if (bearer) {
        return account_sdk.findAccount({ bearer });
      }
    })
    .then((account = {}) => {
      let sub = account._id;
      
      return account_sdk.issueKeyById(sub, { authorization : bearer });
    })
    .then((result = {}) => {
      let { data : { key }} = result;
      
      res.render('account/key', {
          strategies  : config.get('account.oauth.strategy')
        , key
      });
    })
    .catch(next);
});

proxy.on('proxyReq', function(proxyReq, req, res, options) {
  let bearer = get_bearer(req);

  if (bearer) {
    proxyReq.setHeader('authorization', bearer);
  }
});

app.all('/githook', (req, res) => {
  proxy.web(req, res, { target : config.getUrl('codedb') });
});

app.all('*', (req, res, next) => {
  proxy.web(req, res, { target : config.getUrl('gateway') });
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
