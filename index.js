var Promise     = require('bluebird')
  , winston     = require('winston')
  , pm2         = require('pm2')
  , pm2_config  = require('./breadboard.json')
  ;


// let 
    // redis     = child_process.spawn('docker', ['run', 'redis'])

require('./lib/rest').listen();

Promise
  .fromCallback((cb) => pm2.connect(cb))
  .then(() => {
    return Promise
            .fromCallback((cb) => pm2.start(pm2_config, cb));
  })
  .then(() => {
    // pm2.launchBus((err, bus) => {
    //   bus.on('log:out', (data) => {
    //   // bus.on('log:PM2', (data) => {
    //     console.log(data);
    //   });
    // });
  })
  .catch((err) => {
    winston.error(err);
  })
  .finally(() => {
    pm2.disconnect();
  });