'use strict'

const when = require('when')

function prompt( message ) {

  return when.promise(function(resolve) {

    process.stdin.resume()
    process.stdin.setEncoding( 'utf8' )

    process.stdout.write( message )

    process.stdin.once("data", function (data) {
      resolve( data.toString() )
      process.stdin.pause()
    })

  })

}

function ask( message, callback ) {
  return prompt(message).then(function(response) {
    const matches = response.match(/^(y|yes|\n)$/i)
    if (matches) return callback()
    return !!matches
  })
}

module.exports = {
  prompt,
  ask
}