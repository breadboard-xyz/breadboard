var Promise       = require('bluebird')
  , winston       = require('winston')
  , _             = require('lodash')
  , config        = require('config-url')
  , urljoin       = require('url-join')
  , request       = require('request')
  , account_sdk   = require('taskmill-core-account-sdk')
  , auth          = require('./auth')
  ;

// todo [akamel] use bearer directly with the codedb sdk instead of calling account_sdk first
function ls(req, res) {
  let remote    = 'https://' + req.params[0]
    , branch    = req.query['branch'] || req.query['sha']
    , bearer    = auth.bearer(req)
    ;

  account_sdk
    .findGitToken({ bearer })
    .catch((err) => { })
    .then((result) => {
      let token = _.get(result, 'data.token');
      request({
          url     : urljoin(config.getUrl('codedb'), 'ls')
        , method  : 'POST'
        , json    : true
        , body    : { remote, branch, token }
      }).pipe(res);
    });
}

function pull(req, res) {
  let remote = 'https://' + req.params[0]
    , bearer = auth.bearer(req)
    ;

  account_sdk
    .findGitToken({ bearer })
    .catch((err) => { })
    .then((result) => {
      let token = _.get(result, 'data.token');
      request({
          url     : urljoin(config.getUrl('codedb'), 'pull')
        , method  : 'POST'
        , json    : true
        , body    : { remote, token }
      }).pipe(res);
    });
}

module.exports = {
    ls
  , pull
};
