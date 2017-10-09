'use strict'

module.exports = function() {

  this.after('Wkfile', 'Wkfile:templates', function() {
    wk.require('template', true)
  })

}