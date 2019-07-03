import crypto from 'crypto';

function sha1Encrypt(str: string) {
  if (typeof str != 'string') {
    str = String(str);
  }

  var md5sum = crypto.createHash('sha1');
  md5sum.update(str);
  str = md5sum.digest('hex');
  return str;
}

export default sha1Encrypt;
