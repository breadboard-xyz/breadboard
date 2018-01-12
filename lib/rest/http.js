var Promise       = require('bluebird')
  , winston       = require('winston')
  , _             = require('lodash')
  , config        = require('config-url')
  , urljoin       = require('url-join')
  , path          = require('path')
  , rp            = require('request-promise')
  , account_sdk   = require('taskmill-core-account-sdk')
  , codedb_sdk    = require('taskmill-core-codedb-sdk')
  , breadboard_git= require('taskmill-core-git')
  , auth          = require('./auth')
  ;

var breadboard_url = config.getUrl('gateway');

function home(req, res) {
  let bearer = auth.bearer(req);

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
}

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
      return rp({
                  url     : urljoin(config.getUrl('codedb'), 'ls')
                , method  : 'POST'
                , json    : true
                , body    : { remote, branch, token }
              })
              .then((model) => {
                let { hostname, username, repo }  = breadboard_git.remote(model.repository.remote)
                  , platform                      = breadboard_git.get_platform(hostname)
                  ;

                _.each(model.data, (item) => {
                  item.href = `/${hostname}` + breadboard_git.stringify(platform, username, repo, item.path, { branch })
                });

                res.render('git/ls', { model });
              })
              .catch((err) => {
                next(err, req, res);
              });
    });
}

function blob(req, res, next) {
  let host      = req.params[0]
    , pathname  = '/' + req.params[1]
    , parsed    = breadboard_git.parse(host, pathname)
    , bearer    = auth.bearer(req)
    ;

  let { remote, filename, branch } = parsed;
  // hostname: "github.com",
  // pathname: "/a7medkamel/taskmill-help/blob/master/helloworld.js",
  // parsed: {
  // remote: "https://github.com/a7medkamel/taskmill-help.git",
  // branch: "master",
  // filename: "helloworld.js",
  // uri: "https://github.com/a7medkamel/taskmill-help.git#master+helloworld.js",
  // platform: "github",
  // owner: "a7medkamel",
  // repository: "taskmill-help"
  // }

  codedb_sdk
    .blob(remote, filename, { branch, bearer })
    .then((model) => {
      res.render('git/blob', { model, parsed, breadboard_url });
    })
    .catch((err) => {
      next(err, req, res);
    });
}

function route(req, res, next) {
  Promise
    .try(() => {
      let pn    = path.normalize(req.url)
        , parts =  _.chain(pn.split(path.sep)).tail().value()
        ;

      let host      = parts[0]
        , pathname  = '/' + _.tail(parts).join(path.sep)
        , bearer    = auth.bearer(req)
        ;

      return { host, pathname, bearer, parts };
    })
    .then(({ host, pathname, bearer, parts }) => {
      return Promise
              .try(() => {
                // 1. is it blob?

                let parsed                        = breadboard_git.parse(host, pathname)
                  , { remote, filename, branch }  = parsed
                  ;

                return codedb_sdk
                        .blob(remote, filename, { branch, bearer })
                        .then((model) => {
                          res.render('git/blob', { model, parsed, breadboard_url });
                        });
              })
              .catch((err) => {
                // 2. is it ls?

                // host/owner/repo
                let size = _.size(_.compact(parts));
                if (size == 3) {
                  let remote    = 'https://' + parts.join(path.sep) + '.git'
                    , branch    = req.query['branch'] || req.query['sha']
                    ;

                  return account_sdk
                          .findGitToken({ bearer })
                          .catch((err) => { })
                          .then((result) => {
                            let token = _.get(result, 'data.token');
                            return rp({
                                        url     : urljoin(config.getUrl('codedb'), 'ls')
                                      , method  : 'POST'
                                      , json    : true
                                      , body    : { remote, branch, token }
                                    })
                                    .then((model) => {
                                      let { hostname, username, repo }  = breadboard_git.remote(model.repository.remote)
                                        , platform                      = breadboard_git.get_platform(hostname)
                                        ;

                                      _.each(model.data, (item) => {
                                        item.href = `/${hostname}` + breadboard_git.stringify(platform, username, repo, item.path, { branch })
                                      });

                                      res.render('git/ls', { model });
                                    });
                          });
                }

                throw new Error(`not repository ${req.url}`);
              });
    })
    // todo [akamel] this tries to read .woff2 files from codedb
    .catch((err) => {
      next(err);
    });
}

module.exports = {
    home
  , ls
  , blob
  , route
};
