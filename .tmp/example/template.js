'use strict'

//api( 'file' )
//api( 'stack' )

after('bundle', function() {
  remove( 'template.js' )
})