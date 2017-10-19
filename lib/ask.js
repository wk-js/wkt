'use strict'

const when = require('when')

function prompt( message ) {

  return when.promise(function(resolve) {

    process.stdin.resume()
    process.stdin.setEncoding( 'utf-8' )

    process.stdout.write( message )

    process.stdin.once("data", function (data) {
      resolve( data.toString().trim() )
      process.stdin.pause()
    })

  })

}

function ask( message, callback ) {
  return prompt(message).then(function(r) {
    const matches = (r.length==0?'y':r).match(/^(y|yes|\n)$/i)
    if (matches) return callback()
    return !!matches
  })
}

function input( message ) {
  return when.promise(function(resolve) {

    process.stdin.resume()
    process.stdin.setEncoding( 'utf-8' )

    process.stdout.write( message )

    process.stdin.once("data", function (data) {
      resolve( data.toString().trim() )
      process.stdin.pause()
    })

  })
}

module.exports = {
  prompt,
  input,
  ask
}