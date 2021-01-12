import test from 'japa'
import env from './strings.test.env'

test.group('Testing string property decorators', () => {
  test('Regex fails', assert => {
    // console.log(env)
    assert.isTrue(env.hasErrors)
  })
})
