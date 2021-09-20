import path from 'path'
import { EnvNumber, EnvObject, EnvString, initialize } from '../src/'

class Credentials {
  @EnvString({ name: 'SMTP_USER' })
  public userName!: string

  @EnvString({ name: 'SMTP_PASSWORD' })
  public password!: string
}

class Smtp {
  @EnvString({ name: 'SMTP_HOST' })
  public host = ''

  @EnvNumber({ name: 'SMTP_PORT' })
  public port = 0

  @EnvObject(Credentials)
  // public credentials = new Credentials()
  public credentials!: Credentials
}

class Env {
  @EnvString({ name: 'BCC_EMAIL' })
  public bccAddress = ''

  @EnvObject(Smtp)
  public smtp!: Smtp
}

const dotEnv = initialize(Env, {}, path.join(__dirname, 'object-test.env'))

export const env = dotEnv.environment

export default dotEnv
