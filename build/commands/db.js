exports.command = 'db <command>'
exports.desc = 'DB manager'
exports.builder = function (yargs) {
  return yargs.commandDir('./db')
}
exports.handler = function (argv) {}
