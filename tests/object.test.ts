import test from 'japa'
import Env from './object.test.env'

test.group('Tests for EnvObject', () => {
  test('Accessing an object property', assert => {
    // console.log(Env)

    assert.isNotNull(Env)
  })
})
