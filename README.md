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
import { EnvNumber, EnvString, EnvBoolean, initialize } from '../src/index'

export class Env {
  @EnvNumber({ name: 'TEST_INT', optional: false })
  public age!: Number

  @EnvString()
  public TEST_STRING!: string

  @EnvString({ name: 'FIRST_NAME' })
  public firstName!= string

  @EnvString({ name: 'SURNAME' })
  public surname!: string

  @EnvBoolean({ default: () => true })
  public TEST_BOOL!: boolean

  @EnvBoolean({ optional: true })
  public TEST_BOOL_TOO!: boolean

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

### Sub-Object Property Mapping

For organizational purposes a property can be of a type that also has mapped properties.

```js
import { EnvNumber, EnvObject, EnvString, initialize } from '../src/'

class Credentials {
  @EnvString({ name: 'SMTP_USER' })
  public userName = ''

  @EnvString({ name: 'SMTP_PASSWORD' })
  public password = ''
}

class Smtp {
  @EnvString({ name: 'SMTP_HOST' })
  public host = ''

  @EnvNumber({ name: 'SMTP_PORT' })
  public port = 0

  @EnvObject(Credentials)
  public credentials!: Credentials
}

class Env {
  @EnvString({ name: 'BCC_EMAIL' })
  public bccAddress = ''

  @EnvObject(Smtp)
  public smtp = new Smtp()
}

const dotEnv = initialize(Env)

export const env = dotEnv.environment

export default dotEnv

```

- Note that the entry point class (or root class) is passed to the `initialize()` method, and the property types are
  passed to the `@EnvObject()` attribute.
- When defining these properties, always initialize them by creating an instance of the mapped type.
- These properties can be nested arbitrarily deep, but as they are only for organizational purposes deep nesting is
  discouraged.
- Teh `credentials` property of the `Smtp` type is initialised by the framework if not done in the class declaration.

The result of executing this code against a valid `.env` file will produce something like the following:

```js
Env {
  bccAddress: 'bcc.sales@example.com',
  smtp: Smtp {
    host: 'smtp.example.com',
    port: 2525,
    credentials: Credentials {
      userName: 'someone',
      password: '$p@ssw0rd'
    }
  }
}
```

## Usage

Import the module in the main entry point of the application and check if there are errors. If there are then log them
and terminate the application, otherwise the application can continue and access the values read from the `.env` file.

```js
import { exit } from 'node:process'
import Env from './environment' // The class file name with the mapping definitions in it

if (Env.hasErrors) {
  console.log(Env.errors)
  exit(1)
}

console.log(Env.environment.TEST_STRING)
```

**N.B.** `Env.environment` will be an empty object if `Env.hasErrors` is true!
