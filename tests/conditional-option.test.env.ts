import path from 'path'
import { EnvString, EnvBoolean, initialize, EnvNumber } from '../src'

class Env {
  @EnvBoolean()
  public IS_MALE = false

  @EnvString()
  public NAME = ''

  @EnvNumber({ min: 16, optionalCondition: (obj: Env) => !obj.IS_MALE })
  public AGE = 0
}

const dotEnv = initialize(Env, undefined, path.join(__dirname, 'conditional-option-test.env'))

export const env = dotEnv.environment

export default dotEnv
