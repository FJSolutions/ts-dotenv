import path from 'path'
import { EnvBoolean, EnvOptions, initialize } from '../src/index'

class Env {
  @EnvBoolean()
  public ENV_TRUE = true
  @EnvBoolean()
  public ENV_ON = true
  @EnvBoolean()
  public ENV_BINARY_1 = true
  @EnvBoolean()
  public ENV_TRUE_ANSWER = true

  @EnvBoolean()
  public ENV_FALSE = false
  @EnvBoolean()
  public ENV_OFF = false
  @EnvBoolean()
  public ENV_BINARY_0 = false
  @EnvBoolean()
  public ENV_FAlSE_ANSWER = false
}

const dotEnv = initialize(Env, undefined, path.join(__dirname, 'boolean-test.env'))

export const env = dotEnv.environment

export default dotEnv
