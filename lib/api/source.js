'use strict'

module.exports = function(src) {
  this.config('sources', { parent: this, path: src })
}