# breadboard

## Push code to GitHub

```
module.exports = function(req, res, next) {
  res.send('Hello World!');
};
```

[github]: http://github.com/

## Replace a file's **github.com** url by **github.run**

```bash
# github.com
     https://github.com/a7medkamel/taskmill-help/blob/master/intro/helloworld.js
# becomes github.run
curl https://github.run/a7medkamel/taskmill-help/blob/master/intro/helloworld.js
#            ~~~~~~~~~~
```


> Public repositories are runnable by anyone.

## Input

Your script is an [express] endpoint. The function's signature is `(req, req, next)`. All data posted or streamed to the script is available on your req object. Same goes for `query` parameters.

### Request Body
```
module.exports = function(req, res, next) {
  res.send(req.body);
};
```
> Express req.body [express:req.body]

### Request Query String
```
module.exports = function(req, res, next) {
  res.send(req.query);
};
```
> Express req.query [express:req.query]

[express]: http://expressjs.com/
[express:req.body]: http://expressjs.com/4x/api.html#req.body
[express:req.query]: http://expressjs.com/4x/api.html#req.query

# Services

We provide built in services that you can make use of. Such services include Email, SMS, and Automated Phone Calls.

## Email

You can send emails directly from our servers.

```
module.exports = function(req, res, next){
  req
    .app
    .email
    .send({
        to      : 'hello@breadboard.io'
      , from    : 'hello@breadboard.io'
      , subject : 'subject: ' + req.body
      , text    : req.body
    })
    .then((result) => res.send(result))
    .catch((err) => res.status(err.statusCode || 500).send(err.error || err));
};
```

## SMS

You can send sms directly from our servers.

```
module.exports = function(req, res, next){
  req
    .app
    .sms
    .send({
      'to' : '+12532143749',
      'body' : req.body
    })
    .then((result) => res.send(result))
    .catch((err) => res.status(err.statusCode || 500).send(err.error || err));
};
```

## MongoDB

Each repository gets a 16mb MongoDB

```
var MongoClient = require('mongodb').MongoClient;

module.exports = function(req, res, next){
  req
    .app
    .mongodb
    .creds()
    .then((cred) => {
      MongoClient.connect(cred.connection_string, function(err, db) {
        if (err) {
          return res.status(500).send(err);
        }

        var collection = db.collection('people');
        collection.insert({ name : 'john smith' }, (err, result) => {
          if (err) {
            return res.status(500).send(err);
          }

          res.send(result);

          db.close();
        });
      });
    })
    .catch((err) => res.status(err.statusCode || 500).send(err.error || err));
};
```

## Cron

You can schedule your scripts to automaticaly run using our cron infrastructure.

Add a `.crontab` file to the root of your repository.

The `.crontab` file in https://github.com/a7medkamel/taskmill-help/blob/master/.crontab will run the helloworld.js script every minute.

The cron format is standard, but is limited to `curl` commands.

```bash
*/1 * * * * curl 'https://github.run/a7medkamel/taskmill-help/blob/master/helloworld.js'
```

```bash
* * * * *  command to execute
┬ ┬ ┬ ┬ ┬
│ │ │ │ │
│ │ │ │ │
│ │ │ │ └───── day of week (0 - 7) (0 to 6 are Sunday to Saturday, 7 is Sunday, the same as 0)
│ │ │ └────────── month (1 - 12)
│ │ └─────────────── day of month (1 - 31)
│ └──────────────────── hour (0 - 23)
└───────────────────────── min (0 - 59)
```
> [cron - wikipedia][1]
[1]: http://en.wikipedia.org/wiki/Cron

### Five minutes after midnight, every day
```bash
5 0 * * *
```
### At 2:15pm on the first of every month
```bash
15 14 1 * *
```
### At 10 pm on weekdays
```bash
0 22 * * 1-5
```

# Auth Tokens

Authentication is required for some of our services. For example you will receive an `unauthorized` error if you try to send emails without being logged in or using a token.

## Authentication
If you are logged in and run code from the playground editor, we will generate a token for you.

## JWT
If you have a JWT, you can put it in the `Authorization` header with the value `bearer [YOUR_JWT]`. Note that any JWT we issue will have a set expiry date.

## Token
You can create long lived `Tokens` using the User Interface. When logged in, select your profile picture on the top right corner, then select settings.

On the settings page click `Create New Key`.

> We do not store keys in our backend. If you forgot a key, you must create a new one.

Send your token in the `Authorization` header with the value `bearer [YOUR_TOKEN]`.

# Advanced

## Manual
Each script *can* define a usage manual as a comment block. The manual is used to describe variouse aspects of the script's execution.

```javascript
/*
@title Hello World!
@input
{
  "content-type" : "text/plain",
  "example" : "Hello from TaskMill"
}
*/
```

You can define input and output contrainsts as well as additional metadata.

| attribute           | usage                                                                                 |
|----------------     |---------------------------------------------------------------------------------------|
| @title              | Human readable title                                                                  |
| @description        | Detailed description of this endpoint                                                 |
| @readme             | URL to a readme                                                                       |
| @input              | JSON with input `content-type` and `example`                                          |
| ↳ content-type      | `text/plain` or `application/json` ...                                                |
| ↳ example           | "Example input to assist new users"                                                   |
| @output             | JSON object                                                                           |
| ↳ content-type      | `text/plain` or `image/png` ...                                                       |
| @pragma             | Add hints to script execution and response                                            |
| ↳ editor append     | `@pragma editor replace` instructs editor plugin to replace selection with result     |
| ↳ editor replace    | `@pragma editor append` instructs editor plugin to append result                      |
| ↳ stream            | `@pragma stream` disables body parser leaving req as stream                           |


## Content Type

You can set the content-type header either programaticaly or through the scripts manual.

### Programaticaly

```
module.exports = function(req, res, next) {
  res.set('Content-Type', 'text/plain');
  res.send('Hello World!');
};
```

### Manual
```
/*
@title Set output schema
@output
{
  "content-type" : "application/json"
}
*/

module.exports = function(req, res, next) {
  res.send(req.headers);
};
```
