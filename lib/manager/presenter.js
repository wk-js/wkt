'use strict'

module.exports = function( manager ) {
  const presenter = {
    get manager() {
      return manager
    }
  }

  manager._mixins.forEach((mixin) => {
    Object.keys(mixin).forEach((key) => {
      Object.defineProperty(presenter, key, {
        enumerable: true,
        get() { return mixin[key] }
      })
    })
  })

  for (const key in manager._config) {
    Object.defineProperty(presenter, key, {
      enumerable: true,
      get() {
        return manager._config[key]
      }
    })
  }

  return presenter
}