# wk-boilerplate

Boilerplate generator

# Install

```
npm i -g github:wk-js/boilerplate
```

# Example

```
boilerplate github:wk-js/starter-vue#boilerplate
```

# CLI

```
boilerplate <path_or_repo...>

   --output -o <string>      Add output (default: ".")
   --list -l                 List boilerplates (default: false)
   --workflow -w <string>    Set a boilerplate workflow path (default: "boilerplate/lib/renderer/index.js")
```

# Create a boilerplate

File structure

`content/**/*` — Files to fetch
`index.js` — Configuration file

Example

```js
// index.js

'use strict'

module.exports = {

  name: 'boilerplate_example',

  // Called at setup task
  initialize() {
    // Add boilerplate
    this.manager.add('./boilerplates/skeleton')

    // Add boilerplate before mine
    this.manager.before('boilerplate_example', './boilerplates/git')

    // Add boilerplate after mine
    this.manager.after('boilerplate_example', './boilerplates/i18n')

    // Add boilerplate from repository (package.json like syntax)
    this.manager.add('github:wk-js/starter-vue#boilerplate')

    // Add optional boilerplate
    this.manager.add('./boilerplates/bump', true)

    // Add sources (preregistered path)
    this.manager.source({
      "webpack": "./boilerplates/webpack",
      "environments": "./boilerplates/environments"
    })

    // Add preregistered path
    this.manager.add('webpack')
  },

  // Methods to the boilerplate component (Vue.js like)
  methods: {

    configure() {
      // Add chunk
      this.chunks.add('application:setup', function() {
        console.log('setup')
      })

      // Add chunk before one
      this.chunks.before('application:setup', 'application:setup:before_setup', function() {
        console.log('before_setup')
      })

      // Add chunk after one
      this.chunks.after('application:setup', 'application:setup:after_setup', function() {
        console.log('after_setup')
      })

      // Edit or rewrite an existing file (a promise can be returned)
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

      // Add a step to the current workflow
      this.manager.stack.after('make', 'install', function() {
        const { spawnSync } = require('child_process')

        spawnSync('npm', [ 'install' ], {
          stdio: 'inherit',
          shell: true,
          cwd: this.parameters.output
        })
      })
    }

  }

}
```

# Add chunks

```js
// index.js

module.exports = {

  name: 'custom_boilerplate',

  initialize() {},

  methods: {
    configure() {
      this.chunks.add('application:setup', function() {
        console.log('setup')
      })

      this.chunks.add('application:modules:module1', function() {
        console.log('module1')
      })

      this.chunks.add('application:modules:module2', function() {
        console.log('module2')
      })

      this.chunks.before('application:modules', 'application:modules:module0', function() {
        console.log('module0')
      })

      this.chunks.after('application:modules', 'application:modules:module3', function() {
        console.log('module3')
      })

      this.chunks.add('application:modules:hello', function() {
        console.log('hello')
      })
    }
  }

}
```

```js
// content/file.js

// Add every 'application:setup*' chunks
{{ chunk('application:setup')    }}

// Add every 'application:modules:module*' chunks
{{ chunk('application:modules:module')  }}

// Add every 'application:modules*' chunks
{{ chunk('application:modules')  }}
```

Result

```js

// Add every 'application:setup*' chunks
console.log('setup')

// Add every 'application:modules:module*' chunks
console.log('module0')
console.log('module1')
console.log('module2')
console.log('module3')

// Add every 'application:modules*' chunks
console.log('module0')
console.log('module1')
console.log('module2')
console.log('module3')
console.log('hello')
```



# Create a workflow

A boilerplate component can also be used as workflow. You can write your own workflow and steps.

```js
// custom_workflow.js

module.exports = {

  name: 'custom_workflow',

  initialize() {
    // That component is a workflow
    this.manager.workflow( this )

    // Share configuration between all boilerplates
    this.files = []
    this.manager.config('files', this.files)
    // => Now every boilerplate can do "this.files"

    // Mixin
    this.manager.mixin({
      who() {
        console.log(this.name)
      },

      files() {
        console.log('no file')
      }
    })
    // => Now every boilerplate can do "this.who(), this.files()" or override these methods

    // Add more step to the workflow
    this.manager.stack.add   ( 'who', this.t_who                     )
    this.manager.stack.before( 'who', 'something' , this.t_something )
    this.manager.stack.after ( 'who', 'list_files', this.t_list_files)

    // Get workflow list
    console.log( this.manager.stack.order )
  }

  methods: {

    t_something() {
      console.log('Do something')
    },

    t_who() {
      return this.manager.boilerplates.execute( this, (bp) => {
        bp.call( 'who' )
      })
    },

    t_list_files() {
      return this.manager.boilerplates.execute( this, (bp) => {
        bp.call( 'files' )
      })
    }

  }
}
```

```js
// custom_boilerplate.js
'use strict'

module.exports = {

  name: 'custom_boilerplate',

  initialize() {},

  methods: {

    // Override message mixin
    files() {
      this.files.push( `${this.name}.js` )
    }

  }

}
```