import test from 'japa'
import { env } from './object.test.env'

test.group('Testing object property decoratorsEnvObject', () => {
  test('Accessing an EnvObject property', assert => {
    assert.exists(env)
    assert.equal(env.bccAddress, 'bcc.sales@eample.com')
    assert.exists(env.smtp)
    assert.equal(env.smtp.host, 'smtp.example.com')
    assert.equal(env.smtp.port, 2525)
    assert.exists(env.smtp.credentials)
    assert.equal(env.smtp.credentials.userName, 'someone')
    assert.equal(env.smtp.credentials.password, '$p@ssw0rd')

    // console.log(env)
  })
})
