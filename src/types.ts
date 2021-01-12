export type Type = StringConstructor | NumberConstructor | BooleanConstructor

export type ConditionallyOptionalFunction = (obj: any) => boolean

export interface CommonPropertyMapper {
  /**
   * The name of the property in the `.env` file, or in `process.env`
   */
  name?: string

  /**
   * Indicates whether the value is optional or not
   */
  optional?: boolean

  /**
   * A function that will create a default value for the property
   */
  default?: () => any

  /**
   * A function that receives the populated root Env object so that it can check whether it is optional or not based on some custom logic.
   */
  optionalCondition?: ConditionallyOptionalFunction
}

export interface StringPropertyMapper extends CommonPropertyMapper {
  /**
   * A function that will create a default value for the property
   */
  default?: () => string

  /**
   * A list of choices, of which the the value must be one
   */
  choices?: string[]

  /**
   * A regular expression to test the value of the property against
   */
  regex?: RegExp
}

export interface NumberPropertyMapper extends CommonPropertyMapper {
  /**
   * A function that will create a default value for the property
   */
  default?: () => Number

  /**
   * A minimum number that the property must not be below (inclusive)
   */
  min?: number

  /**
   * A maximum number that the property must not exceed (inclusive)
   */
  max?: number
}

export interface BooleanPropertyMapper extends CommonPropertyMapper {
  /**
   * A function that will create a default value for the property
   */
  default?: () => Boolean
}

export type ctor<T> = { new (): T; [key: string]: any }
