import test from 'japa'
import Env from './default.test.env'

test.group('Basic success tests', () => {
  test('Test Reading config file', assert => {
    // console.log(Env)
    assert.isDefined(Env)
    assert.isFalse(Env.hasErrors)
  })

  test('Test executing a method works', assert => {
    assert.isFalse(Env.hasErrors)
    assert.equal(Env.environment.fullName(), 'Francis Judge')
  })

  test('Test that a default is set when a property value is supplied', assert => {
    assert.equal(Env.environment.NODE_ENV, 'development')
  })
})
