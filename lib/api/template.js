'use strict'

module.exports = function(glob, parameters) {
  // Defaults
  parameters = Object.assign({
    glob: glob,
    interpolate: /\/\/@=([\s\S]+?)@\/\//g,
    exclude: false
  }, parameters || {})

  this.config('templates', parameters)
}