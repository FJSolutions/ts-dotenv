import { PropertyMetadata } from './propertyMetadata'
import { EnvResult } from './typeEnvResult'
import { parseBoolean, parseNumber } from './parseUtils'
import { StringPropertyMapper, NumberPropertyMapper, BooleanPropertyMapper } from './types'
import { readEnvFile } from './typeEnvInitialize'

/** Private module-level property that holds the property metadata */
const _propertyMetadata = new Map<string, PropertyMetadata>()

/**
 * A decorator for a string property in the `.env` file or `process.env`
 *
 * @param prop The property mapping definition object
 */
export const EnvString = (prop?: StringPropertyMapper): any => {
  return (objectTarget: any, propertyName: string) => {
    const key = `${objectTarget.constructor.name}.${propertyName}`
    const meta = new PropertyMetadata(prop || {}, String, propertyName, prop?.choices, prop?.regex)
    _propertyMetadata.set(key, meta)

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
    const key = `${objectTarget.constructor.name}.${propertyName}`
    const meta = new PropertyMetadata(prop || {}, Number, propertyName, [], undefined, prop?.min, prop?.max)
    _propertyMetadata.set(key, meta)

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
    const key = `${objectTarget.constructor.name}.${propertyName}`
    const meta = new PropertyMetadata(prop || {}, Boolean, propertyName)

    _propertyMetadata.set(key, meta)

    return null
  }
}

/**
 * A decorator for a numeric property in the `.env` file or `process.env`
 *
 * @param prop The property mapping definition object
 */
export const EnvObject = (): any => {
  return (objectTarget: any, propertyName: string) => {
    // console.log('Property Name: %s.%s', objectTarget.constructor.name, propertyName)

    // const meta = new PropertyMetadata(prop || {}, Boolean, propertyName)

    // _propertyMetadata.set(propertyName, meta)

    return null
  }
}

/**
 * Loads the `.env` file and reads its values, overriding them with those found in  `process.env`, and validating that all required values are present.
 *
 * @param envClass The class decorated declaration
 * @param dotEnvFilePath The full file name and path to the `.env` file (Optional, default = process.pwd() + '/.env')
 */
export const initialize = <T extends Object>(
  envClass: { new (): T; [key: string]: any },
  dotEnvFilePath: string = '',
): EnvResult<T> => {
  // Setup the error list
  const errors = new Array<string>()

  // Read the `.env` file and get its values
  const result = readEnvFile(errors, dotEnvFilePath)
  if (result === false) {
    return EnvResult.createFailure(errors)
  }
  const envValues = result as Map<string, string>

  // Create an instance of the passed in class and populate its values
  const obj: { [key: string]: any } = new envClass()

  _propertyMetadata.forEach((meta: PropertyMetadata, propertyName: string) => {
    const propertyPath = propertyName.split('.')
    console.log(propertyPath)

    let value: any = envValues.get(meta.name)
    if (process.env[meta.name]) {
      value = process.env[meta.name]
    }

    // Check the value retrieved from the `.env` file and `process.env`
    if (!value) {
      if (meta.default) {
        value = meta.default()
      } else {
        value = obj[meta.propertyName]
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
        // console.log(`Testing '${value}' with '${meta.regex.source}': '${meta.regex.test(value)}' `)

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

    // console.log(meta.propertyName + ' = ' + value)
    obj[meta.propertyName] = value
    // console.log(obj)
  })

  // TODO: Validate the created object against the meta-data rules

  // Clear the metadata cache for reuse
  _propertyMetadata.clear()

  // If there are errors return a failure result
  if (errors.length > 0) {
    return EnvResult.createFailure<T>(errors)
  }

  // Otherwise, return a success result
  return EnvResult.createSuccess<T>(obj as T)
}
