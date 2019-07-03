import crypto from 'crypto';

function md5Encrypt(str: string) {
  if (typeof str != 'string') {
    str = String(str);
  }

  var md5sum = crypto.createHash('md5');
  md5sum.update(str);
  str = md5sum.digest('hex');
  return str;
}

export default md5Encrypt;
