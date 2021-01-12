import { Type, CommonPropertyMapper, ConditionallyOptionalFunction } from './types'

/** Private class that holds the normalized property metadata */
export class PropertyMetadata implements CommonPropertyMapper {
  constructor(
    mapper: CommonPropertyMapper,
    type: Type,
    public propertyName: string,
    choices?: string[],
    regex?: RegExp,
    min?: number,
    max?: number,
  ) {
    this.name = mapper.name || propertyName
    this.type = type || String
    this.optional = mapper.optional || false
    this.default = mapper.default || undefined
    this.optionalCondition = mapper.optionalCondition
    this.choices = choices
    this.regex = regex
    this.min = min
    this.max = max
  }

  public readonly name: string

  public readonly type: Type

  public optional: boolean

  public readonly default?: () => any

  public readonly choices?: string[]

  public readonly regex?: RegExp

  public readonly min?: number

  public readonly max?: number

  public value?: any

  public propertyPath?: string[]

  public readonly optionalCondition?: ConditionallyOptionalFunction
}
