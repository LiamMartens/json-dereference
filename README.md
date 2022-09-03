# json-deref
This is a very basic library to dereference JSON objects. It supports both local and remote references, but only supports root references (relative referencing is not supported).

## Example
```js
import { dereference } from 'json-deref';

await dereference({
  obj: {
    value: {
      $ref: 'https://example.com/schema#/value',
    },
  },
}, {
  loadSchema: async (url) => ({
    value: 500,
  })
})
```