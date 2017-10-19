'use strict'

const Manager = require('./manager')

const manager = new Manager()

manager.add( `${__dirname}/renderer` )
manager.add( './boilerplates/_skeleton' )

manager.execute()