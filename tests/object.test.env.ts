import path from 'path'
import { EnvObject, EnvString, initialize } from '../src/'

class Smtp {
  @EnvString({ name: 'SMTP_HOST' })
  public host = ''
}

class Env {
  @EnvString({ name: 'BCC_EMAIL' })
  public bccAddress = ''

  @EnvObject()
  public smtp = new Smtp()
}

const dotEnv = initialize(Env, path.join(__dirname, 'object-test.env'))

export const env = dotEnv.environment

export default dotEnv
