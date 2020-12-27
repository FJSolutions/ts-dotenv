import DotEnvError from './dotEnvError'

export const parseNumber = (value: string, errors: string[]): Number => {
  if (!value || value.length == 0) {
    throw new DotEnvError('You must supply a string representation of a number to parse, it cannot be blank!')
  }

  let result = ''
  let dotCount = 0
  let symbolCount = 0
  let expCount = 0

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
        symbolCount += 1
        result += value[i]
        break
      case 'E':
      case 'e':
        expCount += 1
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

export const parseBoolean = (value: string, errors: string[]): boolean => {
  if (!value || value.length == 0) {
    errors.push('You must supply a string representation of a boolean to parse, it cannot be blank!')
    return false
  }

  switch (value.trim().toLocaleLowerCase()) {
    case 'true':
    case 'on':
    case 'yes':
    case '1':
      return true
    case 'false':
    case 'off':
    case 'no':
    case '0':
      return false
    default:
      errors.push(`The value '${value}' cannot be parsed as a boolean`)
      return false
  }
}
