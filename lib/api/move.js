'use strict'

module.exports = function(glob) {
  this.$api.file(glob, { action: 'move' })
}