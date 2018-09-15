var Promise       = require('bluebird')
  , express       = require('express')
  , winston       = require('winston')
  , _             = require('lodash')
  , config        = require('config-url')
  , urljoin       = require('url-join')
  , http_proxy    = require('http-proxy')
  , chalk         = require('chalk')
  , Session       = require('cookie-session')
  , marked        = require('marked')
  , viz           = require('viz.js')
  , morgan        = require('morgan')
  , git           = require('./git')
  , auth          = require('./auth')
  , http          = require('./http')
  ;

process.on('uncaughtException', (err) => {
  winston.error(err);
});

process.on('unhandledRejection', (err, p) => {
  winston.error(err, p);
});

// Synchronous highlighting with highlight.js
marked.setOptions({
  highlight: function (code, lang) {
    switch(lang) {
      case 'dot':
      return viz(code);
      break;
      default:
      return require('highlight.js').highlightAuto(code).value;
    }
  }
});

var proxy = http_proxy.createProxyServer({
  secure : false
})

var app = express();

app.set('view engine', 'pug');

app.use(morgan('combined'));
app.use(express.static('public'));
app.use(Session({
  keys: config.get('session.keys'),
  // Cookie Options
  name: 'session',
  maxAge: config.get('session.maxAge'),
  sameSite: 'strict',
  rolling: true,
  // saveUninitialized: true,
  resave: true,
}))

// app.all('*', (req, res, next) => { console.log(req.url); next(); })
app.get('/', http.home);

app.get(/api\/ls\/(.*\.git)$/, git.ls);
app.get(/api\/pull\/(.*\.git)$/, git.pull);

app.get('/api/key', auth.key);

app.get('/playground', http.playground);

app.get('/auth/callback', auth.callback);

// app.get(/\/(.*\.git)$/, http.ls);
// app.get(/\/(.+?)\/(.*)$/, http.blob);

// todo [akamel] use proxy instead of request js
app.get('*', http.route)

proxy.on('proxyReq', function(proxyReq, req, res, options) {
  let bearer = auth.bearer(req);

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

app.use(function(err, req, res, next) {
  res.status(500).send({ message : err.message });
})

function listen() {
  // note: this needs to be a function and not lambda
  let port = config.get('breadboard.port');
  app.listen(port, function() {
    let port = this.address().port;

    console.log(chalk.inverse.bold('****                        Breadboard                        ****'))
    console.log(chalk.bgGreen.bold('   \u2192 open http://localhost:8040/                                  '))
  });
}

module.exports = {
    listen
};
