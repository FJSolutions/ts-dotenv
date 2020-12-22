import 'reflect-metadata'
import { Prop, initialize } from '../src/index'

export class Env {
  @Prop({ name: 'TEST_INT', type: Number, optional: false })
  public age?: number

  @Prop()
  public TEST_STRING?: string

  @Prop({ name: 'FIRST_NAME' })
  public firstName?: string

  @Prop({ name: 'SURNAME' })
  public surname?: string

  @Prop({ type: Boolean, default: () => true })
  public TEST_BOOL?: boolean

  @Prop({ type: Boolean, optional: true })
  public TEST_BOOL_TOO?: boolean

  @Prop({ name: 'TEMP' })
  public TempFolder?: string

  @Prop({ default: () => 'development' })
  public NODE_ENV?: string

  fullName() {
    return `${this.firstName} ${this.surname}`.trim()
  }
}

export const env = initialize(Env)

export default env

// export let env: Env

// export const loadEnv = () => {
//   return (env = initialize(Env))
// }

// export default Environment.initialize(Env)
