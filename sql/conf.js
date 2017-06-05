const conf = require('./conf.json')

export function mysqlConf(options) {
  return Object.assign(conf, options)
}