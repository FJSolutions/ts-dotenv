import test from 'japa'
import Env, { env } from './conditional-option.test.env'

test.group('Testing conditionally optional function', () => {
  test('Ensure it changes optionality', assert => {
    // console.log(Env)

    assert.isFalse(Env.hasErrors)
    assert.exists(env)
  })
})
