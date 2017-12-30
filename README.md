# Wkt

```
wkt <input=string default="./template.js"> <output=string default="./">
```

## Example

See example [here](https://github.com/wk-js/wkt-web/blob/master/skeleton/template.js)

## API

### `file`

```ts
/*
 * Copy a file from source directory to destination directory
 * If an output is defined, the copy is made from destination to destination directory
 */
copy(file: string, output?: string);
```

```ts
// Remove a file in destination directory
remove(file: string);
```

```ts
// Rename a file in destination directory
rename(file: string, output: string);
```

```ts
// Move a file in destination directory
move(file: string, output: string);
```

```ts
// Alias for remove()
ignore(file: string);
```

```ts
file(file: string, parameters: FileAPIItem);
```

Parameters

```
{
  file: "my_filename",
  action: "copy" || "move" || "remove",
  context: "source" || "destination",
  output: "my_output"
}
```

### `macro`

```ts
// Get or create a macro
macro(key: string, ...args: any[]);
```

Example
```js
macro().set('hello', function() {
  console.log('Hello World')
})

macro('hello') // => Hello World

macro().set('hello', function(name) {
  name = name || 'World'
  console.log('Hello ' + name)
})

macro('hello', 'John') // => Hello John
```

### `exec`

```ts
exec(command: string, options?:any);
```

```ts
execSync(command: string, options?:any);
```

Same options as `spawn()`

Plus some shortcuts

```
{
  interactive: true,    // Set stdio to inherit
  printStdout: true,    // Print stdout
  printStderr: true,    // Print stderr
  rejectOnError: false  // Reject the promise on error
}
```


### `stack`

```ts
// Access to the boilerplate stack
stack() => Configure;
```

```ts
// Access to the root boilerplate stack
invocator() => Configure;
```

```ts
// Get or set the root boilerplate destination path
output(str?: string | undefined) => string;
```

Example
```js
stack().add('hello', function() {
  console.log('Hello World')
})

stack().after('bundle', function() {
  console.log('after bundle')
})

stack().before('bundle', function() {
  console.log('before bundle')
})

invocator().before('bundle', function() {
  console.log('before invocator bundle')
})

invocator().after('bundle', function() {
  console.log('after invocator bundle')
})

// => before bundle
// => bundle
// => after bundle
// => Hello World
// => before invocator bundle
// => invocator bundle
// => after invocator bundle
```

More precision [here](https://github.com/wk-js/wkt/blob/master/lib/stack)

### `prompt`

```ts
// Ask a question. Answer yes or no.
ask(message: string, variable: string, options?: any) => void;
```

```ts
// Ask a question. Answer anything.
prompt(message: string, variable: string, options?: any) => void;
```

```ts
// Get the answer
answer(variable: string) => any;
```

Example

```js
stack().before('prompt', function() {
  prompt('Project name:', 'project_name')
})

stack().after('prompt', function() {
  output(output() + '/' + answer('project_name'))
})
```

### template

```ts
// Add a file to be rendered. You can change the interpolate/evaluate/escape regex in options
template(file: string, options?: any) => void;
```

```ts
// Set data to pass to the template renderer
templateData(data: any) => void;
```

```ts
// Works like Configure but for chunk. See https://github.com/wk-js/wkt/blob/master/lib/api/template/chunk_stack.ts
chunkAdd(key: string, chunk: string) => void;
```

```ts
// Works like Configure but for chunk. See https://github.com/wk-js/wkt/blob/master/lib/api/template/chunk_stack.ts
chunkBefore(bfore: string, key: string, chunk: string) => void;
```

```ts
// Works like Configure but for chunk. See https://github.com/wk-js/wkt/blob/master/lib/api/template/chunk_stack.ts
chunkAfter(after: string, key: string, chunk: string) => void;
```

Example

```js
template('config/application.js')
template('Wkfile')
template('README.md')

stack().before('prompt', function() {
  prompt('Project name:', 'project_name')
})

stack().after('prompt', function() {
  output(output() + '/' + answer('project_name'))
})

stack().after('bundle', function() {
  templateData({
    project_name: answer('project_name')
  })

  chunkAdd('application:module:git', "this.module( require('../workflow/modules/git.js') )")
})
```

### `source`

Load another boilerplate

Example

```js
source('wk-js/wkt-web#skeleton') // A repository or repository with a branch/tag
source('./assets/template.js') // Or a file
```

Example
```js
source('../../../boilerplates/skeleton/template.js')
source('../../../boilerplates/assets/template.js')
source('../../../boilerplates/bump/template.js')
source('../../../boilerplates/git/template.js')
source('../../../boilerplates/webpack/template.js')

stack().after('bundle', function() {
  execSync('npm install')
  remove('template.js')
})
```

### `api`

Import custom api function

Example

```js
api('wk-js/wkt-api') // A repository or repository with a branch/tag
api('./my_custom_api.js') // Or a file
```