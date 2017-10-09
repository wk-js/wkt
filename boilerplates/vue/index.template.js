'use strict'

module.exports = function() {

  this.boilerplate('webpack')
  this.boilerplate('git')
  this.boilerplate('i18n')
  this.boilerplate('environments')
  this.boilerplate('package')
  this.boilerplate('templates')

  this.file('package.json', function(content) {
    const pkg = JSON.parse(content)

    pkg.dependencies = Object.assign(pkg.dependencies, {
      "gsap": "1.19.1",
      "vue": "2.1.8"
    })

    pkg.browser = pkg.browser || {}
    pkg.browser = Object.assign(pkg.browser, {
      "vue": "vue/dist/vue.common"
    })

    return JSON.stringify(pkg)
  })

}