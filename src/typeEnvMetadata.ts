import { PropertyMetadata } from './propertyMetadata'
import { StringPropertyMapper, NumberPropertyMapper, BooleanPropertyMapper, ctor } from './types'

type ObjectProperty = {
  typeName: string
  propertyName: string
  propertyType: { [key: string]: any; new (): {} }
  propertyTypeName: string
}

export class TypeEnvMetadata {
  private _propertyMetadata = new Map<string, PropertyMetadata>()
  private _objectMetadata = new Array<ObjectProperty>()

  public get PropertyMetadata() {
    return this._propertyMetadata
  }

  public get ObjectMetadata() {
    return this._objectMetadata
  }

  public clear() {
    this._propertyMetadata.clear()
    this._objectMetadata = []
  }

  public addString(objectTarget: any, propertyName: string, prop?: StringPropertyMapper) {
    const key = this.getKeyName(objectTarget, propertyName)

    const meta = new PropertyMetadata(prop || {}, String, propertyName, prop?.choices, prop?.regex)

    this._propertyMetadata.set(key, meta)
  }

  public addNumber(objectTarget: any, propertyName: string, prop?: NumberPropertyMapper) {
    const key = this.getKeyName(objectTarget, propertyName)

    const meta = new PropertyMetadata(prop || {}, Number, propertyName, [], undefined, prop?.min, prop?.max)

    this._propertyMetadata.set(key, meta)
  }

  public addBoolean(objectTarget: any, propertyName: string, prop?: BooleanPropertyMapper) {
    const key = this.getKeyName(objectTarget, propertyName)

    const meta = new PropertyMetadata(prop || {}, Boolean, propertyName)

    this._propertyMetadata.set(key, meta)
  }

  public addObject(objectTarget: any, propertyName: string, propertyType: ctor<any>) {
    const prop: ObjectProperty = {
      propertyName,
      typeName: objectTarget.constructor.name,
      propertyType: new propertyType().constructor,
      propertyTypeName: new propertyType().constructor.name,
    }

    this._objectMetadata.push(prop)
  }

  public setPropertyPaths<T>(envClass: ctor<T>) {
    const rootClassType = envClass.name

    this._propertyMetadata.forEach((meta: PropertyMetadata, propertyName: string) => {
      let path = propertyName.split('.')
      if (path.length > 0) {
        if (path[0] === rootClassType) {
          path.shift()
        }
      }

      if (path.length > 1) {
        const newPath = new Array<string>()
        let propertyType = path[0]
        while (true) {
          const parentObjectMetadata = this._objectMetadata.find(o => o.propertyTypeName === propertyType)
          if (parentObjectMetadata) {
            newPath.unshift(parentObjectMetadata.propertyName)

            if (parentObjectMetadata.typeName !== rootClassType) {
              propertyType = parentObjectMetadata.typeName
              continue
            }
          }

          break
        }

        newPath.push(path[path.length - 1])
        path = newPath
      }

      meta.propertyPath = path
    })
  }

  private getKeyName(objectType: ctor<any>, propertyName: string) {
    return `${objectType.constructor.name}.${propertyName}`
  }
}
