import test from 'japa'
import env from './numbers.test.env'

test.group('Testing number property decorators', () => {
  test('errors when loading violates constraints', assert => {
    assert.isNotNull(env)
    assert.isNotNull(env.environment)
    assert.isTrue(env.hasErrors)

    // console.log(env)
  })
})
