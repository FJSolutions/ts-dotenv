import { isJsxFragment } from 'typescript'
import DotEnvError from './typeEnvError'
import { EnvOptions } from './typeEnvOptions'

export const parseNumber = (value: string, errors: string[], options: Required<EnvOptions>): Number => {
  if (!value || value.length == 0) {
    throw new DotEnvError('You must supply a string representation of a number to parse, it cannot be blank!')
  }

  let result = ''
  let decimalPointCount = 0
  let expCount = 0

  for (let i = 0; i < value.length; i += 1) {
    const c = value[i]

    if (c >= '0' && c <= '9') {
      result += c
    } else if (c === options.numeric.decimalPoint) {
      decimalPointCount += 1
      result += c
    } else if (c === '-' || c === '+') {
      result += c
    } else if (c === 'e' || c === 'E') {
      expCount += 1
      result += c
    } else if (!options.numeric.thousandsSeparators.some(sep => sep === c)) {
      errors.push(
        `The number '${value}' contains characters that are not valid, and have not been identified as thousands separators (['${options.numeric.thousandsSeparators.join(
          "','",
        )}'])`,
      )
      result = ''
      break
    }
  }

  if (result.length === 0) {
    return NaN
  }

  if (!/^(-|\+)?(\d+)([\.|,]\d+)?(e(-|\+)?\d+)?$/m) {
    errors.push(`"${value}" doesn't appear to be a valid number`)
  }

  if (decimalPointCount > 1) {
    errors.push(`A number cannot have more than one decimal point in a number (${value})`)
  } else if (expCount > 1) {
    errors.push(`There cannot be more than a single 'e' as an exponent indicator in the number (${value})`)
  } else if (value.length === 0) {
    errors.push('There were no digits in the string passed in!')
  } else {
    const num = parseFloat(result)
    if (isNaN(num)) {
      errors.push(`'${value}' cannot be parsed as a valid number.`)
    }
    return num
  }

  return NaN
}

export const parseBoolean = (value: string, errors: string[], options: Required<EnvOptions>): boolean => {
  if (!value || value.length == 0) {
    errors.push('You must supply a string representation of a boolean to parse, it cannot be blank!')
    return false
  }

  const boolString = value.trim()
  /**
   * "base": Only strings that differ in base letters compare as unequal. Examples: a ≠ b, a = á, a = A (case insensitive).
   *
   * "variant": Strings that differ in base letters, accents and other diacritic marks, or case compare as
   * unequal. Other differences may also be taken into consideration. Examples: a ≠ b, a ≠ á, a ≠ A (case sensitive).
   *
   * *NB* The default should be case-sensitive unless either `option` overrides it.
   */
  let comparisonOptions = { sensitivity: 'variant' } // = Sensitive
  if (!options.caseSensitive || !options.boolean.caseSensitive) {
    comparisonOptions.sensitivity = 'base' // = Insensitive
  }

  if (boolString.localeCompare('true', 'en', comparisonOptions) === 0) return true
  if (boolString.localeCompare('false', 'en', comparisonOptions) === 0) return false

  if (options?.boolean?.extended && options?.boolean?.matches) {
    const [trues, falses] = options.boolean.matches

    for (let i = 0; i < trues.length; i++) {
      const trueOption = trues[i]
      if (boolString.localeCompare(trueOption, 'en', comparisonOptions) === 0) {
        // console.log(trueOption)
        return true
      }
    }

    for (let i = 0; i < falses.length; i++) {
      const falseOption = falses[i]
      if (boolString.localeCompare(falseOption, 'en', comparisonOptions) === 0) {
        // console.log(falseOption)
        return false
      }
    }
  }

  errors.push(`The value '${value}' cannot be parsed as a boolean`)
  return false
}
