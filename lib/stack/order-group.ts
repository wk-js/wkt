import { Order } from './order'

export class OrderGroup extends Order {

  groups: { [key:string]: OrderGroup } = {}

  group(key:string) {
    let group

    const keys    = key.split(':')
    const rootKey = keys.shift() as string

    if (!this.groups[rootKey]) {
      this.groups[rootKey] = new OrderGroup
      this.add( rootKey )
      group = this.groups[rootKey]
    }

    group = this.groups[rootKey]

    if (keys.length > 0) {
      let _g = group

      for (let i = 0, ilen = keys.length; i < ilen; i++) {
        _g = _g.group(keys[i])
      }

      group = _g
    }

    return group
  }

  getFullOrder() {
    let order: string[] = []

    for (let i = 0, ilen = this.order.length; i < ilen; i++) {
      if (this.groups.hasOwnProperty(this.order[i])) {
        order.push( this.order[i] )
        order = order.concat(this.groups[this.order[i]].getFullOrder().map((o:string) => this.order[i] + ':' + o))
      } else {
        order.push( this.order[i] )
      }
    }

    return order
  }

}