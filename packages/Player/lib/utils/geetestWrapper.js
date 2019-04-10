module.exports = function(geetestObj, funcName, ...args) {
  return new Promise((resolve, reject) => {
    geetestObj[funcName](...args, (err, data) => {
      if(err) {
        reject(err);
      }else {
        resolve(data);
      }
    })
  })
}
