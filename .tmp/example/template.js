'use strict'

//api( 'file' )
//api( 'stack' )
//source( '../example2/template.js' )

after('bundle', function() {
  remove( 'template.js' )
})