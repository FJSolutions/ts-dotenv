import Path from 'path'
import { initialize, EnvString, EnvNumber, EnvBoolean } from '../src/index'

export class Env {
  @EnvNumber({ name: 'TEST_INT', optional: false })
  public age?: number

  @EnvString()
  public TEST_STRING?: string

  @EnvString({ name: 'FIRST_NAME' })
  public firstName?: string

  @EnvString({ name: 'SURNAME' })
  public surname?: string

  @EnvBoolean({ default: () => true })
  public TEST_BOOL?: boolean

  @EnvBoolean({ optional: true })
  public TEST_BOOL_TOO = false

  @EnvString({ name: 'TEMP' })
  public TempFolder?: string

  @EnvString({ choices: ['development', 'production'], default: () => 'development' })
  public NODE_ENV = ''

  fullName() {
    return `${this.firstName} ${this.surname}`.trim()
  }
}

export const env = initialize(Env, undefined, Path.join(__dirname, 'default-test.env'))

export default env
