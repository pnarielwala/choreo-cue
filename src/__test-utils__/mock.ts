/**
 * A convenience wrapper for using jest mocking with TypeScript.
 *
 * While this wrapper is not required for using jest mocking with TypeScript, it helps cut down on the boilerplate and reduces noise in the test.
 *
 * Usage:

```js
import { fetchName } from './api/usersClient'
import { anApiResponse } from '__test-utils__/builders/apiResponseBuilder'

jest.mock('./api/usersClient')

mock(fetchName).mockResolvedValue(
  anApiResponse({
    data: {
      name: 'Jonny'
    }
  })
)
```
*/
const mock = <T extends (...args: any[]) => any>(
  mockFn: T,
): jest.MockedFunction<typeof mockFn> => {
  return mockFn as jest.MockedFunction<typeof mockFn>
}

export default mock
