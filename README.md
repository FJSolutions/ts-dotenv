# type-env

Is a strongly `TypeScript` module for accessing values from a .env file and process.env and providing a strongly typed
interface to those properties using decorators.

I really liked [Leo Baker Hytch's `ts-dotenv`](https://github.com/LeoBakerHytch/ts-dotenv) project but wanted it to use
decorators instead of a configuration object.

## Configuration

Create a file (eg. `environment.ts`) that will define a class to contain the properties defined in the `.env` file, and
annotate them with the `@Prop` decorator.

```js
// `environment.ts` file
import { Prop, initialize } from '../src/index'

export class Env {
  @EnvNumber({ name: 'TEST_INT', optional: false })
  public age: 0

  @EnvString()
  public TEST_STRING: ''

  @EnvString({ name: 'FIRST_NAME' })
  public firstName: ''

  @EnvString({ name: 'SURNAME' })
  public surname: ''

  @EnvBoolean({ default: () => true })
  public TEST_BOOL?: boolean

  @EnvBoolean({ optional: true })
  public TEST_BOOL_TOO = false

  @EnvString({ name: 'TEMP' })
  public TempFolder?: string

  @EnvString({ choices: ['development', 'production'] })
  public NODE_ENV = 'development'

  fullName() {
    return `${this.firstName} ${this.surname}`.trim()
  }
}

const dotEnv = initialize(Env)

// Be aware that this export will be `undefined` if there were errors
export const env = dotEnv.environment

export default dotEnv
```

**NB**

- The first import in this file is `reflect-metadata`. This must be first in order to ensure that the decorators work
  properly.
- Initializing the properties in this class is safe, because these values will be overwritten if the module is
  initialized successfully, or used as a default value if no `default` function is provided.

### @Prop properties and defaults

The simplest form of decoration of a property is to us an decorator for the property type, such as `@EnvString()`.
Called without a configuration object, all the configuration defaults are used:

- `name`: The make of the property in the `.env` file, or property name on `process.env`. Defaults to the name of the
  property it is decorating.
- `optional`: A Boolean flag indicating whether the property is optional or not; `optional = false` properties that
  cannot be found in the `.env` file or `process.env` will generate errors. Defaults to `false` (= required).
- `default`: A argument-less function that returns a default value if nothing is found in the `.env` file or
  `process.env`. If this is not supplied the value of the class property is used as a default

**NB** This class is constructed in the `initialize()` function, so it must have a default, parameter-less constructor;
but, any function defined on this class which accesses local variables will be available on the result.

### String Property Mapping

- `choices`: An optional array of valid choices; one of which must be the value of the property (By default the check is
  case sensitive).
- `regex`: A `RegExp` instance to test the property value against.

### Number Property Mapping

- `min`: A minimum (inclusive) value that the property can be
- `max`: A maximum (inclusive) value that the property can be.

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

## ToDo

- Add a @EnvObject decorator to mark a property as a sub-object with @Env attributed properties
  - Modularize the setting of property values
  - Extract the validation logic from the property setting logic
- Add a new validation step after setting the created object's properties
  - Ensure that all properties have been set on the object (not just the values in the `.env` file)
  - Freeze the object (but not it's prototype)
- Add an attribute base-option for making a `.env` value optional based on another property
  - A single property with a function that has access to the newly created (but un-validated) `dotEnv` object
- Add an options object:
  - To prevent `process.env` overwriting a value
  - To throw errors on processing
  - Case insensitive value matching/comparison
  - Extended matching of Booleans
    - Supply own list of options to evaluate to `true` and `false`
