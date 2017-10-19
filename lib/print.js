const { Print2, Plugins }
= require('wk-print')

const P = new Print2
P.config.plugin('tag'  , Plugins.tag)
P.config.plugin('style', Plugins.style)

P.config.level('ask', {
  style: 'grey',
  tag: {
    tag: '?',
    style: 'green'
  }
})

P.config.level('debug', {
  style: 'grey',
  tag: {
    tag: '.',
    style: 'blue'
  }
})

module.exports = P