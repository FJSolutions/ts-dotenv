import Path from 'path'
import { initialize, EnvString, EnvNumber, EnvBoolean } from '../src/index'

export class Env {
  @EnvNumber({ name: 'TEST_INT', optional: false })
  public age?: number

  @EnvString({ name: 'FIRST_NAME' })
  public firstName?: string

  @EnvString({ name: 'SURNAME' })
  public surname?: string

  @EnvBoolean({ default: () => true })
  public TEST_BOOL?: boolean

  @EnvString({ choices: ['development', 'production'] })
  public NODE_ENV = 'Development'
}

export const env = initialize(Env, undefined, Path.join(__dirname, 'error-test.env'))

export default env
