export type Type = StringConstructor | NumberConstructor | BooleanConstructor

export interface PropertyMapper {
  /**
   * The name of the property in the `.env` file, or in `process.env`
   */
  name?: string

  /**
   * The type of the `.env` value to cast to the property
   */
  type?: Type

  /**
   * Indicates whether the value is optional or not
   */
  optional?: boolean

  /**
   * A function that will create a default value for the value
   */
  default?: () => any
}

interface CommonPropertyMapper {
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
}

export interface NumberPropertyMapper extends CommonPropertyMapper {
  /**
   * A function that will create a default value for the property
   */
  default?: () => Number
}

export interface BooleanPropertyMapper extends CommonPropertyMapper {
  /**
   * A function that will create a default value for the property
   */
  default?: () => Boolean
}
