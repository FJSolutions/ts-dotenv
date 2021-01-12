import path from 'path'
import fs from 'fs'

export const readEnvFile = <T>(errors: string[], dotEnvFilePath?: string): Map<string, string> | boolean => {
  // Find the .env file and read it into a Map
  const fileName = dotEnvFilePath || path.join(process.cwd(), '.env')

  try {
    fs.accessSync(fileName)
  } catch (e) {
    errors.push(`The .env file (${fileName}) does not exist`)
    return false
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
    return false
  }

  return envValues
}
