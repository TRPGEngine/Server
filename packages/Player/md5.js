const crypto = require('crypto');

module.exports = function(str) {
  if(typeof str != 'string') {
    str = String(str);
  }

  var md5sum = crypto.createHash('md5');
  md5sum.update(str);
  str = md5sum.digest('hex');
  return str;
}
