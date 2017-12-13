function NOOP() {}

export class Order {

  public order: string[] = []

  constructor() {}

  exists( key:string ) : boolean {
    return this.order.indexOf(key) !== -1
  }

  index( key:string ) : number {
    return this.order.indexOf( key )
  }

  add( key:string ) {
    if (!this.exists(key)) this.order.push( key )
  }

  before( bfore:string, key:string ) {
    if (!this.exists(bfore)) {
      console.log(`[WARN] ${bfore} does not exist.`)
      return
    }
    this.add( key )
    this.reorder( bfore, key )
  }

  after( after:string, key:string ) {
    if (!this.exists(after)) {
      console.log(`[WARN] ${after} does not exist.`)
      return
    }
    this.add( key )
    this.reorder( key, after )
  }

  reorder( fk:string, tk:string ) {
    const fi:number = this.index( fk )
    const ti:number = this.index( tk )

    if (!(fi !== -1 && ti !== -1)) return;

    this.order.splice(fi, 1)
    this.order.splice(ti+1, 0, fk)
  }

  execute( reducer?:Function ) {
    // this.order.reduce((key) => {
    //   reducer = reducer || NOOP
    //   reducer( key )
    //   return key
    // }, [])
  }

}

export interface ConfigureTasks {
  [key: string]: Function
}

export class Configure extends Order {

  public tasks: ConfigureTasks = {}

  add( key:string, action?:Function ) {
    super.add( key )
    this.tasks[ key ] = action || NOOP
  }

}

const o = new Order

o.add( 'start' )
o.add( 'configure' )
o.before( 'configure', 'configure:before' )
o.after ( 'configure', 'configure:after'  )

export default Order