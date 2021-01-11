import test from 'japa'
import env from './error.test.env'

test.group('Error tests', () => {
  test('basic error test', assert => {
    assert.exists(env)
    assert.isNotNull(env)
    assert.isNotNull(env.environment)
    assert.isTrue(env.hasErrors)

    // console.log(env)
  })
})
