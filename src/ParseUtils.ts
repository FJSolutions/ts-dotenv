import { isJsxFragment } from 'typescript'
import DotEnvError from './typeEnvError'
import { EnvOptions } from './typeEnvOptions'

export const parseNumber = (value: string, errors: string[]): Number => {
  if (!value || value.length == 0) {
    throw new DotEnvError('You must supply a string representation of a number to parse, it cannot be blank!')
  }

  let result = ''
  let dotCount = 0
  // let symbolCount = 0
  // let expCount = 0

  for (let i = 0; i < value.length; i += 1) {
    switch (value[i]) {
      case '0':
      case '1':
      case '2':
      case '3':
      case '4':
      case '5':
      case '6':
      case '7':
      case '8':
      case '9':
        result += value[i]
        break
      case '.':
        dotCount += 1
        result += value[i]
        break
      case '-':
      case '+':
        // symbolCount += 1
        result += value[i]
        break
      case 'E':
      case 'e':
        // expCount += 1
        result += value[i]
        break
    }
  }

  if (dotCount > 1) {
    errors.push(`A number cannot have more than one decimal dot int it! (${value})`)
  } else if (value.length === 0) {
    errors.push('There were no digits in the string passed in!')
  } else {
    const no = parseFloat(result)
    if (isNaN(no)) {
      errors.push(`'${value}' cannot be parsed as a valid number.`)
    }
    return no
  }

  return NaN
}

export const parseBoolean = (value: string, errors: string[], options: EnvOptions): boolean => {
  if (!value || value.length == 0) {
    errors.push('You must supply a string representation of a boolean to parse, it cannot be blank!')
    return false
  }

  const boolString = value.trim()
  let comparisonOptions = { sensitivity: 'variant' }
  if (!options.caseSensitive) {
    comparisonOptions.sensitivity = 'base'
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
