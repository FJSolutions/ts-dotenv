import path from 'path'
import fs from 'fs'
// import DotEnvError from './dotEnvError'
import { parseBoolean, parseNumber } from './parseUtils'
import { Type, StringPropertyMapper, NumberPropertyMapper, BooleanPropertyMapper, CommonPropertyMapper } from './types'

/** Private module-level property that holds the property metadata */
const _propertyMetadata = new Map<string, PropertyMetadata>()

/** Private class that holds the normalized property metadata */
class PropertyMetadata implements CommonPropertyMapper {
  constructor(
    mapper: CommonPropertyMapper,
    type: Type,
    public propertyName: string,
    choices?: string[],
    regex?: RegExp,
    min?: number,
    max?: number,
  ) {
    this.name = mapper.name || propertyName
    this.type = type || String
    this.optional = mapper.optional || false
    this.default = mapper.default || undefined
    this.choices = choices
    this.regex = regex
    this.min = min
    this.max = max
  }

  public readonly name: string

  public readonly type: Type

  public readonly optional: boolean

  public readonly default?: () => any

  public readonly choices?: string[]

  public readonly regex?: RegExp

  public readonly min?: number

  public readonly max?: number
}

class EnvResult<T extends Object> {
  private constructor(private _env: T = {} as T, private _errors: readonly string[]) {}

  /**
   * Gets the populated environment class, or and empty object if there were loading errors.
   */
  public get environment(): T {
    return this._env
  }

  /**
   * Gets the list of errors
   */
  public get errors(): readonly string[] {
    return this._errors
  }

  /**
   * Indicates whether this is an error result or not
   */
  public get hasErrors(): boolean {
    return this._errors && this._errors.length > 0 ? true : false
  }

  public static createSuccess<T extends Object>(env: T) {
    return new EnvResult<T>(env, Object.freeze([]))
  }

  public static createFailure<T extends Object>(errors: string[]) {
    return new EnvResult<T>({} as T, Object.freeze(errors))
  }
}

/**
 * A decorator for a string property in the `.env` file or `process.env`
 *
 * @param prop The property mapping definition object
 */
export const EnvString = (prop?: StringPropertyMapper): any => {
  return (objectTarget: any, propertyName: string) => {
    const meta = new PropertyMetadata(prop || {}, String, propertyName, prop?.choices, prop?.regex)
    _propertyMetadata.set(propertyName, meta)

    return null
  }
}

/**
 * A decorator for a numeric property in the `.env` file or `process.env`
 *
 * @param prop The property mapping definition object
 */
export const EnvNumber = (prop?: NumberPropertyMapper): any => {
  return (objectTarget: any, propertyName: string) => {
    const meta = new PropertyMetadata(prop || {}, Number, propertyName, [], undefined, prop?.min, prop?.max)
    _propertyMetadata.set(propertyName, meta)

    return null
  }
}

/**
 * A decorator for a numeric property in the `.env` file or `process.env`
 *
 * @param prop The property mapping definition object
 */
export const EnvBoolean = (prop?: BooleanPropertyMapper): any => {
  return (objectTarget: any, propertyName: string) => {
    const meta = new PropertyMetadata(prop || {}, Boolean, propertyName)

    _propertyMetadata.set(propertyName, meta)

    return null
  }
}

/**
 * Loads the `.env` file and reads its values, overriding them with those found in  `process.env`, and validating that all required values are present.
 *
 * @param envClass The class decorated declaration
 * @param dotEnvFileName The full path to the `.env` file (Optional, default = process.pwd() + '/.env')
 */
export const initialize = <T extends Object>(
  envClass: { new (): T; [key: string]: any },
  dotEnvFileName: string = '',
): EnvResult<T> => {
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
  const obj: { [key: string]: any } = new envClass()

  _propertyMetadata.forEach((meta: PropertyMetadata, propertyName: string) => {
    let value: any = envValues.get(meta.name)
    if (process.env[meta.name]) {
      value = process.env[meta.name]
    }

    // Check the value retrieved from `.env` and `process.env`
    if (!value) {
      if (meta.default) {
        value = meta.default()
      } else {
        value = obj[propertyName]
      }
    } else if (meta.type === Number) {
      value = parseNumber(value, errors)
    } else if (meta.type === Boolean) {
      value = parseBoolean(value, errors)
    }

    // Check if the property is optional
    if (!value) {
      if (!meta.optional) {
        errors.push(
          `The property '${propertyName}' was not marked as optional but has no value in the .env file or process.env, and no default was supplied.`,
        )
      } else if (meta.type === Number) {
        value = 0
      } else if (meta.type === Boolean) {
        value = false
      } else {
        value = ''
      }
    } else if (meta.type === String && !meta.optional) {
      if (meta.choices && meta.choices.length > 0) {
        if (!meta.choices.some(c => c === value)) {
          errors.push(`'${value}' is not a choice from [${meta.choices.join(', ')}]`)
        }
      }

      if (meta.regex) {
        console.log(`Testing '${value}' with '${meta.regex.source}': '${meta.regex.test(value)}' `)

        if (!meta.regex.test(value)) {
          errors.push(
            `The value '${value}' for '${propertyName}' does not match the RegEx '${meta.regex.source}' on property '${propertyName}' ('${meta.name}')`,
          )
        }
      }
    } else if (meta.type === Number) {
      if (typeof meta.min !== 'undefined' && value < meta.min) {
        errors.push(
          `The value '${value}' is less than the minimum value of '${meta.min}' specified for the property '${propertyName}' ('${meta.name}').`,
        )
      }

      if (typeof meta.max !== 'undefined' && value > meta.max) {
        errors.push(
          `The value '${value}' is greater than the maximum value of '${meta.max}' specified for the property'${propertyName}' ('${meta.name}').`,
        )
      }
    }

    obj[propertyName] = value
  })

  // Clear the metadata cache for reuse
  _propertyMetadata.clear()

  // If there are errors return a failure result
  if (errors.length > 0) {
    return EnvResult.createFailure<T>(errors)
  }

  // Otherwise, return a success result
  return EnvResult.createSuccess<T>(obj as T)
}
