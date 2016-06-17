# Install

```sh
npm install declaration-syntax-tester --save-dev
```

# Using with [tape](https://github.com/substack/tape)

```js
const test = require('tape');
const {accept, reject} = require('declaration-syntax-tester')();

test('sample...', t => {
  // Write test case for accepted syntax of declaration files
  t.error(accept(`
    import sample from '../sample';
    const x:number = sample.getNumber();
  `), 'should getNumber() return number.');

  // Write test case for rejected syntax of declaration files
  t.error(reject(`
    import sample from '../sample';
    const x:string = sample.getNumber();
  `), 'should return value of getNumber() can not assign to string.');
})
```

# A sample project

- [typings-d3](https://github.com/iamssen/typings-d3/tree/master/tests)