exports.encodeStr2Int = function(str) {
  try {
    return str.split('').map(c => c.charCodeAt()).reduce((a, b) => a + b);
  }catch (err) {
    console.error('encodeStr2Int error:', err);
    return 0;
  }
}
