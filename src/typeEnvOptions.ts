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

    /**
     * Indicates whether to parse boolean values from the `.env` file in a case-sensitive way (default = false, boolean string values are case insensitive)
     *
     * *NB* This property can be set independently of the general case sensitivity option for parting only boolean values
     */
    caseSensitive?: boolean
  }
}

export const normalizeOptions = (options?: EnvOptions): Readonly<Required<EnvOptions>> => {
  const defaults: Required<EnvOptions> = {
    caseSensitive: true,
    processEnvOverwrites: true,
    throwErrors: false,
    boolean: {
      extended: true,
      matches: [
        ['on', 'yes', '1'],
        ['off', 'no', '0'],
      ],
      caseSensitive: false,
    },
  }

  // First one populates the
  const normalized = { ...defaults, ...options }
  // console.log(normalized)

  return normalized
}
