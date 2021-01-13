import { PropertyMetadata } from './propertyMetadata'
import { EnvResult } from './typeEnvResult'
import { parseBoolean, parseNumber } from './parseUtils'
import { StringPropertyMapper, NumberPropertyMapper, BooleanPropertyMapper, ctor } from './types'
import { readEnvFile } from './typeEnvInitialize'
import { TypeEnvMetadata } from './typeEnvMetadata'
import { EnvOptions, normalizeOptions } from './typeEnvOptions'

export { EnvOptions } from './typeEnvOptions'

/** Private module-level property that holds the property metadata */
const _metadata = new TypeEnvMetadata()

/**
 * A decorator for a string property in the `.env` file or `process.env`
 *
 * @param prop The property mapping definition object
 */
export const EnvString = (prop?: StringPropertyMapper): any => {
  return (objectTarget: any, propertyName: string) => {
    _metadata.addString(objectTarget, propertyName, prop)

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
    _metadata.addNumber(objectTarget, propertyName, prop)

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
    _metadata.addBoolean(objectTarget, propertyName, prop)

    return null
  }
}

/**
 * A decorator for a numeric property in the `.env` file or `process.env`
 *
 * @param prop The property mapping definition object
 */
export const EnvObject = (propertyType: ctor<any>): any => {
  return (objectTarget: any, propertyName: string) => {
    _metadata.addObject(objectTarget, propertyName, propertyType)

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
  envClass: ctor<T>,
  envOptions?: EnvOptions,
  dotEnvFilePath?: string,
): EnvResult<T> => {
  // Setup the error list
  const errors = new Array<string>()

  // Normalize the options object
  const options = normalizeOptions(envOptions)

  // Read the `.env` file and get its result & values
  const result = readEnvFile(errors, dotEnvFilePath)

  if (result === false) {
    return EnvResult.createFailure(errors)
  }
  const envValues = result as Map<string, string>

  // Loop the property metadata
  const obj: { [key: string]: any } = new envClass()
  _metadata.PropertyMetadata.forEach((meta: PropertyMetadata, propertyName: string) => {
    // Get the value from the env file and/or `process.env`
    let value: any = envValues.get(meta.name)
    if (process.env[meta.name] && options.processEnvOverwrites) {
      value = process.env[meta.name]
    }

    // Check the value retrieved from the `.env` file and `process.env`
    if (!value) {
      if (meta.default) {
        value = meta.default()
      }
    } else if (meta.type === Number) {
      value = parseNumber(value, errors, options)
    } else if (meta.type === Boolean) {
      value = parseBoolean(value, errors, options)
    }

    // Assign the value to the metadata object
    meta.value = value
  })

  // Set the object properties
  const env = _createEnvObject(envClass)

  // Validate the created object against the meta-data rules
  _validateMetadata(errors, options, env)

  // Clear the metadata cache for reuse
  _metadata.clear()

  // If there are errors return a failure result
  if (errors.length > 0) {
    if (options.throwErrors) {
      throw new Error(errors.join('\n'))
    } else {
      return EnvResult.createFailure<T>(errors)
    }
  }

  return EnvResult.createSuccess<T>(env)
}

/**********************************************************************
 *
 * Private helper methods for `initialize()`
 *
 ***********************************************************************/

const _validateMetadata = <T>(errors: string[], options: EnvOptions, env: T) => {
  _metadata.PropertyMetadata.forEach((meta: PropertyMetadata, propertyName: string) => {
    if (meta.optionalCondition) {
      meta.optional = meta.optionalCondition(env)
    }

    if (typeof meta.value === 'undefined' || meta.value === null) {
      if (!meta.optional) {
        errors.push(
          `The property '${propertyName}' was not marked as optional but has no value in the .env file or process.env, and no default was supplied.`,
        )
      }
    } else {
      if (meta.type === String && !meta.optional) {
        if (meta.choices && meta.choices.length > 0) {
          let comparisonOptions = { sensitivity: 'base' }
          if (options.caseSensitive) {
            comparisonOptions.sensitivity = 'variant'
          }

          if (!meta.choices.some(c => c.localeCompare(meta.value, 'en', comparisonOptions) === 0)) {
            errors.push(`'${meta.value}' is not a choice from [${meta.choices.join(', ')}]`)
          }
        }

        if (meta.regex) {
          // console.log(`Testing '${value}' with '${meta.regex.source}': '${meta.regex.test(value)}' `)

          if (!meta.regex.test(meta.value)) {
            errors.push(
              `The value '${meta.value}' for '${propertyName}' does not match the RegEx '${meta.regex.source}' on property '${propertyName}' ('${meta.name}')`,
            )
          }
        }
      } else if (meta.type === Number) {
        if (typeof meta.min !== 'undefined' && meta.value < meta.min) {
          errors.push(
            `The value '${meta.value}' is less than the minimum value of '${meta.min}' specified for the property '${propertyName}' ('${meta.name}').`,
          )
        }

        if (typeof meta.max !== 'undefined' && meta.value > meta.max) {
          errors.push(
            `The value '${meta.value}' is greater than the maximum value of '${meta.max}' specified for the property'${propertyName}' ('${meta.name}').`,
          )
        }
      }
    }
  })
}

const _createEnvObject = <T>(envClass: ctor<T>) => {
  // extract the canonical property path
  _metadata.setPropertyPaths(envClass)

  // Create an instance of the passed in class and populate its values
  const env: { [key: string]: any } = new envClass()

  // Loop the
  _metadata.PropertyMetadata.forEach(meta => {
    let obj = env

    if (meta.propertyPath) {
      for (let i = 0; i < meta.propertyPath.length - 1; i++) {
        const propertyName = meta.propertyPath[i]
        obj = obj[propertyName]
      }
    }

    obj[meta.propertyName] = meta.value
  })

  // Otherwise, return a success result
  return env as T
}
