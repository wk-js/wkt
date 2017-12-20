# TODO

```js
//api="file"
//api="macro"
//api="template"
//api="stack"
//source=""

template('file.js', { data: {}, interpreter: new RegExp })

before('bundle', function() {
  console.log('before bundle')

  ask('What is your name ?', 'name')
})

after('bundle', function() {
  console.log('after bundle', answer('name'))
  rename('lol.js', 'mdr.js')
})
```