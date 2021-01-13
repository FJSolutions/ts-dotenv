import test from 'japa'
import dotEnv, { env } from './numbers.test.env'

test.group('Testing number property decorators', () => {
  test('errors when loading violates constraints', assert => {
    console.log(dotEnv)

    assert.exists(dotEnv)
    assert.exists(env)
    assert.isTrue(dotEnv.hasErrors)

    // assert.equal(env.pi, 31415e-4)
    // assert.equal(env.largeAge, 50)
    // assert.equal(env.smallAge, 1)
  })
})
