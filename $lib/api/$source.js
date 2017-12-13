'use strict'

const Resolver = require('../resolver')
const when     = require('when')
const path     = require('path')

module.exports = function(key_or_path_or_repo) {
  const scope = this

  return when.promise(function(resolve, reject) {
    Resolver.resolve(key_or_path_or_repo)
            .then(resolve)
            .catch(function() {
              if (scope && scope.path) {
                Resolver.resolve( path.join( path.dirname(scope.path), key_or_path_or_repo ) )
                        .then(resolve)
                        .catch(reject)
              }
            })
  })
}