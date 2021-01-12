import Path from 'path'
import { initialize, EnvNumber } from '../src/index'

export class Env {
  @EnvNumber({ name: 'TOO_SMALL_NUMBER', min: 0 })
  public smallAge = 0

  @EnvNumber({ name: 'TOO_LARGE_NUMBER', max: 100 })
  public largeAge = 0

  @EnvNumber({ name: 'EXPONENT_NUMBER' })
  public pi = 0
}

export const env = initialize(Env, undefined, Path.join(__dirname, 'numbers-test.env'))

export default env
