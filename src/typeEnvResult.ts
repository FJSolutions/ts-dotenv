export class EnvResult<T extends Object> {
  private constructor(private _env: T = {} as T, private _errors: readonly string[]) {}

  /**
   * Gets the populated environment class, or and empty object if there were loading errors.
   */
  public get environment(): T {
    return this._env
  }

  /**
   * Gets the list of errors
   */
  public get errors(): readonly string[] {
    return this._errors
  }

  /**
   * Indicates whether this is an error result or not
   */
  public get hasErrors(): boolean {
    return this._errors && this._errors.length > 0 ? true : false
  }

  public static createSuccess<T extends Object>(env: T) {
    return new EnvResult<T>(env, Object.freeze([]))
  }

  public static createFailure<T extends Object>(errors: string[]) {
    return new EnvResult<T>({} as T, Object.freeze(errors))
  }
}
