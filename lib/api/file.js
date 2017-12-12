'use strict'

module.exports = function(glob, parameters) {
  // Defaults
  parameters = Object.assign({
    glob:    glob,
    action:  'copy',
    exclude: false
  }, parameters || {})

  this.config('files', parameters)
}