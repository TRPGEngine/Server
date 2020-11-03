exports.command = 'docker <command>'
exports.desc = 'Docker manager'
exports.builder = function (yargs) {
  return yargs.commandDir('./docker')
}
exports.handler = function (argv) {}
