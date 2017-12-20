'use strict'

//api('stack')
//api('file')

after('bundle', function() {
  rename( 'example.js', 'test.js' )
})