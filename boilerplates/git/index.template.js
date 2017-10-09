'use strict'

module.exports = function() {

  this.after('application:modules', 'git:module', function() {
    this.module( require('../workflow/modules/git.js') )
  })

}