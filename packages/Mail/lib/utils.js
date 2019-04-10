const crypto = require('crypto');

/**
 * aes加密
 * @param data 待加密内容
 * @param key 必须为32位私钥
 * @returns {string}
 */
exports.encryption = function (data, key, iv = '') {
  iv = iv || "";
  var clearEncoding = 'utf8';
  var cipherEncoding = 'base64';
  var cipherChunks = [];
  var cipher = crypto.createCipheriv('aes-256-ecb', key, iv);
  cipher.setAutoPadding(true);
  cipherChunks.push(cipher.update(data, clearEncoding, cipherEncoding));
  cipherChunks.push(cipher.final(cipherEncoding));
  return cipherChunks.join('');
}

/**
 * aes解密
 * @param data 待解密内容
 * @param key 必须为32位私钥
 * @returns {string}
 */
exports.decryption = function (data, key = aeskey, iv = '') {
  if (!data) {
      return "";
  }
  iv = iv || "";
  var clearEncoding = 'utf8';
  var cipherEncoding = 'base64';
  var cipherChunks = [];
  var decipher = crypto.createDecipheriv('aes-256-ecb', key, iv);
  decipher.setAutoPadding(true);
  cipherChunks.push(decipher.update(data, cipherEncoding, clearEncoding));
  cipherChunks.push(decipher.final(clearEncoding));
  return cipherChunks.join('');
}
