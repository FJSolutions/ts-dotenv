import { Type, CommonPropertyMapper } from './types'

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
    this.choices = choices
    this.regex = regex
    this.min = min
    this.max = max
  }

  public readonly name: string

  public readonly type: Type

  public readonly optional: boolean

  public readonly default?: () => any

  public readonly choices?: string[]

  public readonly regex?: RegExp

  public readonly min?: number

  public readonly max?: number
}
