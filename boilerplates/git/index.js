'use strict'

module.exports = {

  name: 'git',

  methods: {
    configure() {
      this.chunks.add('application:module:git', function() {
        this.module( require('../workflow/modules/git.js') )
      })
    }
  }

}