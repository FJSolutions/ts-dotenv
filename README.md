# ts-dotenv

Is a strongly `TypeScript` module for accessing values from a .env file and process.env and providing a strongly typed
interface to those properties using decorators.

## Configuration

Create a file (e.g. `environment.ts`) that will define a class to contain the properties defined in the `.env` file, and
annotate them with the `@Prop` decorator.

```js
import 'reflect-metadata'
import { Prop, initialize } from '../src/index'

export class Env {
  @Prop({ name: 'TEST_INT', type: Number, optional: false })
  public age = 0

  @Prop()
  public TEST_STRING = ''

  @Prop({ name: 'FIRST_NAME' })
  public firstName = ''

  @Prop({ name: 'SURNAME' })
  public surname = ''

  @Prop({ type: Boolean, default: () => true })
  public TEST_BOOL = false

  @Prop({ type: Boolean, optional: true })
  public TEST_BOOL_TOO = false

  @Prop({ name: 'TEMP' })
  public TempFolder = ''

  @Prop()
  public NODE_ENV = 'development'

  fullName() {
    return `${this.firstName} ${this.surname}`.trim()
  }
}

export const env = initialize(Env)

export default env
```

**NB**

- The first import in this file is `reflect-metadata`. This must be first in order to ensure that the decorators work
  properly.
- Initializing the properties in this class is safe, because these values will be overwritten if the module is
  initialized successfully, or used as a default value if no `default` function is provided.

### @Prop properties and defaults

The simplest form of decoration of a property is `@Prop()`. This accepts all the configuration defaults:

- `name`: The make of the property in the `.env` file, or property name on `process.env`. Defaults to the name of the
  property it is decorating.
- `type`: The `javascript` type to coerce the string value read from `.env` or retrieved from `process.env`. Options are
  `String`, `Number`, and `Boolean`. Defaults to `String`.
- `optional`: A boolean flag indicating whether the property is optional or not; `optional = false` properties that
  cannot be found in the `.env` file or `process.env` will generate errors. Defaults to `false` (= required).
- `default`: A argument-less function that returns a default value if nothing is found in the `.env` file or
  `process.env`.

**NB** This class is constructed in the `initialize()` function, so it must have a default, parameter-less constructor;
but, any function defined on this class which accesses local variables will be available on the result.

## Usage

Import the module in the main entry point of the application and check if there are errors. If there are then log them
and terminate the application, otherwise the application can continue and access the values read from the `.env` file.

```js
import Env from './environment'

if (Env.hasErrors) {
  console.log(Env.errors)
  exit(1)
}

console.log(Env.environment.TEST_STRING)
```

**NB** `Env.environment` will be an empty object if `Env.hasErrors` is true!
