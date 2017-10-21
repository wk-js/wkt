'use strict'

let GENERATOR_CONSTRUCTOR = function() {}

const GENERATOR_SUPPORT = (function() {
  try {
    GENERATOR_CONSTRUCTOR = eval('(function*() { yield 1; })').constructor
    return true
  } catch (e) {
    console.log(e)
    return false;
  }
})()

function isGenerator( generator ) {
  return generator instanceof GENERATOR_CONSTRUCTOR
  && {}.toString.call(generator) === '[object GeneratorFunction]'
}

function GeneratorSupported() {
  return GENERATOR_SUPPORT
}

module.exports = {
  isGenerator:        isGenerator,
  GeneratorSupported: GeneratorSupported
}