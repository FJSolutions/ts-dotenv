import test from 'japa'
import dotEnv, { env } from './boolean.test.env'

test.group('Testing boolean property decorators', () => {
  test('Test all default options', assert => {
    // console.log(dotEnv)

    assert.exists(env)
    assert.isTrue(env.ENV_BINARY_1)
    assert.isTrue(env.ENV_ON)
    assert.isTrue(env.ENV_TRUE)
    assert.isTrue(env.ENV_TRUE_ANSWER)
    assert.isFalse(env.ENV_FALSE)
    assert.isFalse(env.ENV_FAlSE_ANSWER)
    assert.isFalse(env.ENV_BINARY_0)
    assert.isFalse(env.ENV_OFF)
  })
})
