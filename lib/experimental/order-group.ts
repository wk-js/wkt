import { Order } from '../stack/order'

export interface OrderGroupObject {
  group:string
  path:string
  items: string[],
  root: string
}

export class OrderGroup extends Order {

  constructor() {
    super()
    console.log('[TODO] OrderGroup is still experimental.')
  }

  add( key:string ) : void {
    const path  = key.split(':')
    const group = path[0]
    const items = this.get( group )

    const last_item = items.pop() || group

    super.after( last_item, key )
  }

  before( bfore:string, key:string ) : void{
    const bfoParse = this.parse( bfore )
    const keyParse = this.parse( key )

    if ( bfoParse.root === keyParse.root && this.order.indexOf(bfore) > -1 ) {
      super.before( bfore, key )
      return
    }

    if (this.order.indexOf(bfore) === -1 && keyParse.items[keyParse.items.length-1]) {
      super.after( keyParse.items[keyParse.items.length-1], bfore )
      this.add( key )
      return
    }

    const items = this.get( bfoParse.root )
    // if (items[0]) {
      super.before( items[0] || bfoParse.root, key )
    // }

    // let items = this.get( keyParse.root )
    // bfoParse.path.split(':').reduce((reducer:string[], item:string) => {
    //   reducer.push( item )

    //   const path = reducer.join(':')

    //   if (this.order.indexOf( path ) === -1 && items[items.length-1]) {
    //     super.after( items[items.length-1], path )
    //   }

    //   return reducer
    // }, [])

    // items = this.get( bfoParse.root )
    // keyParse.path.split(':').reduce((reducer:string[], item:string) => {
    //   reducer.push( item )

    //   const path = reducer.join(':')

    //   if (this.order.indexOf( path ) === -1 && items[items.length-1]) {
    //     super.before( items[items.length-1], path )
    //   }

    //   return reducer
    // }, [])
  }

  after( after:string, key:string ) : void {
    const aftParse = this.parse( after )
    const keyParse = this.parse( key )

    if ( aftParse.root === keyParse.root && this.order.indexOf(after) > -1 ) {
      super.after( after, key )
      return
    }

    if (this.order.indexOf(after) === -1 && keyParse.items[0]) {
      super.before( keyParse.items[0], after )
      this.add( key )
      return
    }

    const items = this.get( aftParse.root )
    // if (items[items.length-1]) {
      super.after( items[items.length-1] || aftParse.root, key )
    // }

    // let items = this.get( keyParse.root )
    // aftParse.path.split(':').reduce((reducer:string[], item:string) => {
    //   reducer.push( item )

    //   const path = reducer.join(':')

    //   if (this.order.indexOf( path ) === -1 && items[0]) {
    //     super.after( items[0], path )
    //   }

    //   return reducer
    // }, [])

    // items = this.get( aftParse.root )
    // keyParse.path.split(':').reduce((reducer:string[], item:string) => {
    //   reducer.push( item )

    //   const path = reducer.join(':')

    //   if (this.order.indexOf( path ) === -1 && items[0]) {
    //     super.before( items[0], path )
    //   }

    //   return reducer
    // }, [])
  }

  get(key:string) {
    const regex = new RegExp(`^${key}`)

    return this.order

    .filter((k) => {
      return k.match(regex)
    })
  }

  parse(key:string) : OrderGroupObject {
    const path  = key.split(':')
    const group = path.length > 1 ? path.slice(0, -1).join(':') : path[0]
    const items = this.get( group )
    const root  = path[0]
    return { group, items, root, path: path.join(':') }
  }

}

// const o = new OrderGroup


// o.add('message')
// o.add('message:hello')
// o.add('world')
// // o.add('yolo')
// // o.add('atchoum')
// o.add('message:plouf')
// // o.after('yolo', 'message:lol')
// // o.after('message', 'yolo')
// // o.before('message', 'message:yyyyyaaa')
// o.before('message', 'yolo')
// // o.before('atchoum', 'message:yal')
// // o.before('message', 'atchoum:lol')

// console.log('------------')
// console.log( o.order )
// // console.log( o.get('message') )

const c = new OrderGroup
c.add('message')
c.after('message', 'message:after')
c.before('message:after', 'message:after:yolsdsd')
// c.before('message:after')
c.after('message', 'lol')
c.before('yolo', 'message:plouf')
c.after('message:cool', 'cool')
c.before('message:polo', 'polo')

c.after('message:polo', 'message:coco')

// c.before('message:popo', 'popo')

console.log( c.order )