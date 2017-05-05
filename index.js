var Promise       = require('bluebird')
  , child_process = require('child_process')
  ;


let 
    // redis     = child_process.spawn('docker', ['run', 'redis'])
  //
    gateway   = child_process.fork('./node_modules/taskmill-core-gateway/index.js')
  , agent     = child_process.fork('./node_modules/taskmill-core-agent/index.js')
  , logs      = child_process.fork('./node_modules/taskmill-core-logs/index.js')
  , account   = child_process.fork('./node_modules/taskmill-core-account/index.js')
  , codedb    = child_process.fork('./node_modules/taskmill-core-codedb/index.js')
  ;

// redis.stdout.pipe(process.stdout);
// redis.stderr.pipe(process.stderr);

require('./lib/rest').listen();

process.on('exit', (code) => {
  // redis.kill();

  gateway.kill();
  agent.kill();
  logs.kill();
  codedb.kill();
  account.kill();
});