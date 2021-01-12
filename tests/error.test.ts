import test from 'japa'
import env from './error.test.env'

test.group('Testing error conditions', () => {
  test('basic error test', assert => {
    // console.log(env)

    assert.exists(env)
    assert.isNotNull(env)
    assert.isNotNull(env.environment)
    assert.isTrue(env.hasErrors)
  })
})
