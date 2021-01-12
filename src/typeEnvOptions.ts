export type EnvOptions = {
  /**
   * Indicates whether to parse values from the `.env` file in a case-sensitive way (default = true)
   */
  caseSensitive?: boolean

  /**
   * Gets a value indicating whether if a property value is found in `process.env` it overwrites a value in the `.env` file (default = true)
   */
  processEnvOverwrites?: boolean

  /**
   * Gets a value indicating whether to throw an exception when an error is encountered, or to add the errors to the result (default = false)
   */
  throwErrors?: boolean

  boolean?: {
    /**
     * Whether to use an extended set of string matches (default = true)
     */
    extended?: boolean

    /**
     * The extended list of matches to use (default = [[on, yes, 1][off, no, 0]])
     */
    matches?: [string[], string[]]
  }
}
