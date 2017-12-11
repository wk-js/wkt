const { Print2, Plugins }
= require('wk-print')

const P = new Print2
P.config.plugin('tag'  , Plugins.tag)
P.config.plugin('style', Plugins.style)

P.config.level('ask', {
  style: 'green',
  tag: {
    tag: '?',
    style: 'green'
  }
})

P.config.level('debug', {
  style: 'grey',
  tag: {
    tag: '.',
    style: 'white'
  }
})

P.config.level('exec', {
  style: 'white',
  tag: {
    tag: '>',
    style: 'cyan'
  }
})

P.config.level('warn', {
  style: 'yellow',
  tag: {
    tag: '!',
    style: 'yellow'
  }
})

module.exports = P