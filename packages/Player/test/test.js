const player = require('../');
// let app = require('trpg-core')();
let app = require('../../Core/')();
app.load(player);
app.run();

// app.reset();

// app.player.getPlayer(1, function(err, user) {
//   user.getSelectedActor(function(err, actor) {
//     console.log(actor.uuid);
//   });
// });
// app.close();
