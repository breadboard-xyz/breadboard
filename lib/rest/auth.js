var Promise       = require('bluebird')
  , winston       = require('winston')
  , _             = require('lodash')
  , account_sdk   = require('taskmill-core-account-sdk')
  ;

function get_token(req) {
  let bearer = req.get('authorization');

  if (bearer) {
    let m = /^\s*(?:\w+)\s+(.+?)\s*$/g.exec(bearer);
    if (m) {
      return m[1]
    }
  }

  if (req.query.token) {
    return req.query.token;
  }

  if (req.session.token) {
    return req.session.token;
  }
}

function get_bearer(req) {
  let bearer = req.get('authorization');

  if (!bearer) {
    let token = get_token(req);
    if (token) {
      bearer = `Bearer ${token}`;
    }
  }

  return bearer;
}

function key(req, res, next) {
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
}

function callback(req, res, next) {
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
    .catch((err) => {
      next(err, req, res);
    })
}

module.exports = {
    bearer  : get_bearer
  , token   : get_token
  , key
  , callback
};
