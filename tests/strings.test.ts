import test from 'japa'
import env from './strings.test.env'

test.group('Tests for string property decorators', () => {
  test('Regex fails', assert => {
    // console.log(env)
    assert.isTrue(env.hasErrors)
  })
})
