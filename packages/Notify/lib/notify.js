module.exports = function NotifyComponent(app) {
  initFunction.call(app);

  return {
    name: 'NotifyComponent',
    require: ['PlayerComponent'],
  };
};

function initFunction() {
  const app = this;
  const db = app.storage.db;

  app.notify = {
    // sendNotifyMsg(userUUID, msg) {}
  };
}
