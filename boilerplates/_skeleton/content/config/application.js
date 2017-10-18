'use strict'

module.exports = function Application() {

  this.configure.add('application:initialize', function() {

    {{ chunk('application:setup') }}

  })

  {{ chunk('application:module') }}

}