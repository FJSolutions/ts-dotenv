import 'reflect-metadata'
import path from 'path'
import fs from 'fs'
import DotEnvError from './DotEnvError'
import { parseBoolean, parseNumber } from './ParseUtils'

/** Private module-level property that holds the property metadata */
const _propertyMetadata = new Map<string, PropertyMetadata>()

type Type = StringConstructor | NumberConstructor | BooleanConstructor

interface PropertyMapper {
  /**
   * The name of the property in the `.env` file, or in `process.env`
   */
  name?: string

  /**
   * The type of the `.env` value to cast to the property
   */
  type?: Type

  /**
   * Indicates whether the value is optional or not
   */
  optional?: boolean

  /**
   * A function that will create a default value for the value
   */
  default?: () => any
}

/** Private class that holds the normalized property metadata */
class PropertyMetadata implements PropertyMapper {
  constructor(mapper: PropertyMapper, public propertyName: string) {
    this.name = mapper.name || propertyName
    this.type = mapper.type || String
    this.optional = mapper.optional || false
    this.default = mapper.default || undefined
  }

  public readonly name: string

  public readonly type: Type

  public readonly optional: boolean

  public readonly default?: () => any
}

class EnvResult<T extends Object> {
  private constructor(private _env: T = {} as T, private _errors: string[]) {}

  public get environment(): T {
    return this._env
  }

  public get errors(): string[] {
    return this._errors
  }

  public get hasErrors(): boolean {
    return this._errors && this._errors.length > 0 ? true : false
  }

  public static createSuccess<T extends Object>(env: T) {
    return new EnvResult<T>(env, [])
  }

  public static createFailure<T extends Object>(errors: string[]) {
    return new EnvResult<T>({} as T, errors)
  }
}

/**
 * A property decorator for a `.env` mapping class property
 *
 * @param prop The property definition object
 */
export const Prop = (prop?: PropertyMapper): any => {
  return (objectTarget: any, propertyName: string) => {
    const meta = new PropertyMetadata(prop || {}, propertyName)
    _propertyMetadata.set(propertyName, meta)

    return null
  }
}

/**
 * Loads the `.env` file and reads its values, overriding them with those found in  `process.env`, and validating that all required values are present.
 * */
export const initialize = <T extends Object>(mapper: { new (): T }, dotEnvFileName: string = ''): EnvResult<T> => {
  const errors = new Array<string>()

  // Find the .env file and read it into a Map
  const fileName = dotEnvFileName || path.join(process.cwd(), '.env')

  try {
    fs.accessSync(fileName)
  } catch (e) {
    errors.push(`The .env file (${fileName}) does not exist`)
    return EnvResult.createFailure<T>(errors)
  }

  let envValues: Map<string, string>
  try {
    envValues = fs
      .readFileSync(fileName, { encoding: 'utf8' })
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 0 && l[0] !== '#')
      .map(l => l.split('='))
      .reduce((acc, l) => {
        acc.set(l[0], l[1])
        return acc
      }, new Map<string, string>())
    // console.log(envValues)
  } catch (e) {
    errors.push(`There was a problem reading the .env file (${e.message})`)
    return EnvResult.createFailure<T>(errors)
  }

  // Create an instance of the passed in class and populate its values
  const obj: { [key: string]: any } = new mapper()

  _propertyMetadata.forEach((meta: PropertyMetadata, propertyName: string) => {
    let value: any = envValues.get(meta.name)
    if (process.env[meta.name]) {
      value = process.env[meta.name]
    }

    if (!value) {
      if (meta.default) {
        value = meta.default()
      }
    } else if (meta.type === Number) {
      value = parseNumber(value, errors)
    } else if (meta.type === Boolean) {
      value = parseBoolean(value, errors)
    }

    if (!value) {
      if (!meta.optional) {
        errors.push(
          `The property '${propertyName}' was not marked optional but has no value in the .env file or process.env, and no default was supplied.`,
        )
      } else if (meta.type === Number) {
        value = 0
      } else if (meta.type === Boolean) {
        value = false
      } else {
        value = ''
      }
    }

    obj[propertyName] = value
  })

  if (errors.length > 0) {
    return EnvResult.createFailure<T>(errors)
  }

  return EnvResult.createSuccess<T>(obj as T)
}
