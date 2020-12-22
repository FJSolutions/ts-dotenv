import test from 'japa'
import Env from './test-env'

test.group('Load ts-dotenv', () => {
  // test('This should work, even now', assert => {
  //   assert.equal(1, 1, 'obvious!')
  // })

  test('Test errors', assert => {
    console.log(Env.errors)
  })

  test('Test Reading config file', assert => {
    assert.isDefined(Env)
    assert.isFalse(Env.hasErrors)
    console.log(Env)
  })

  test('Test executing a method works', assert => {
    assert.isFalse(Env.hasErrors)
    assert.equal(Env.environment.fullName(), 'Francis Judge')
  })

  test('Test that a default is set when a property value is supplied', assert => {
    assert.equal(Env.environment.NODE_ENV, 'development')
  })
})
