'use strict'

const { scope } = require('lol/utils/function')

const actions = {
  copy:    require('./copy'),
  delete:  require('./delete'),
  file:    require('./file'),
  move:    require('./move'),
  source:  require('./source'),
  stack:   require('./stack'),
  symlink: require('./symlink'),
}

function mixin(obj) {

  // Add config
  obj.configs = {}
  obj.config  = function(key, value) {
    if (arguments.length == 2) {
      obj.configs[key] = obj.configs[key] || []
      obj.configs[key].push( value )
      return obj
    }
    return obj.config[key]
  }

  obj.$api = {}

  // Set actions
  for (const key in actions) {
    obj.$api[key] = scope(actions[key], obj)
  }

  obj.$api.config = scope( obj.config, obj )

}

module.exports = {
  actions: actions,
  mixin:   mixin
}