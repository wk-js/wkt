'use strict'

class Configure {

  constructor() {
    const bound = [ 'add', 'before', 'after', 'reorder' ]
    bound.forEach((k) => this[k] = this[k].bind(this))

    this.order = []

    this.autocreate = true
  }

  add(key) {
    if (this.order.indexOf(key) === -1) this.order.push( key )
  }

  before(bfore, key) {
    let bi = this.order.indexOf( bfore )
    let ci = this.order.indexOf( key   )

    if (this.autocreate) {
      if (bi == -1) this.add( bfore ); bi = this.order.indexOf( bfore )
      if (ci == -1) this.add( key   ); ci = this.order.indexOf( key   )
    }

    const length = Math.max(bi, ci) - Math.min(bi, ci)
    if (!(length == 1 && ci < bi)) this.reorder(bfore, key, false)

    // if (this.order.indexOf(before) == -1 && this.autocreate) this.add(before)
    // this.add( key )
    // this.reorder( key, before, false )
  }

  after(after, key) {
    let ai = this.order.indexOf( after )
    let ci = this.order.indexOf( key   )

    if (this.autocreate) {
      if (ai == -1) this.add( after ); ai = this.order.indexOf( after )
      if (ci == -1) this.add( key   ); ci = this.order.indexOf( key   )
    }

    const length = Math.max(ai, ci) - Math.min(ai, ci)
    if (!(length == 1 && ai > ci)) this.reorder(after, key, true)

    // if (this.order.indexOf(after) == -1 && this.autocreate) this.add(after)
    // this.add( key )
    // this.reorder( key, after, true )
  }

  reorder(fromKey, toKey, after) {
    const fi = this.order.indexOf( fromKey )
    const ti = this.order.indexOf( toKey   )

    this.order.splice( fi, 1 )
    this.order.splice( ti + (after?1:0), 0, fromKey )
  }

}

const c = new Configure

c.before( 'configure:files', 'configure:files:before' )
console.log( c.order )
c.after ( 'configure:files', 'configure:files:after'  )
console.log( c.order )

// c.after ( 'configure:files:before', 'configure:files' )
// console.log( c.order )
// c.before( 'configure:files:after', 'configure:files' )
// console.log( c.order )

// c.before( 'start', 'configure:files' )


module.exports = Configure