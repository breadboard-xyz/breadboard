var bytes = require('bytes');

module.exports = {
  "codedb" : {
    "file_size_limit"   : bytes('10kb'),
    "git_archive_limit" : bytes('20mb')
  }
};
