interface ParseDateOptions {

  /** IANA time zone name or numeric UTC offset in minutes */
  // TODO get a union type of time zones rather than just string
  serverTz?: string | number;

  /** Say what to do with tricky timestamps
   *
   * When a time zone's offset changes (e.g. for Daylight Saving Time),
   * some timestamps around the change occur twice, or not at all.
   * 'tzMode' says how timestamps that refer to these times should be
   * handled. The default behavior is 'postgres'.
   *
   * 'strict' mode will throw on all timestamps that do not occur
   * exactly once in the server's time zone.
   *
   * 'javascript' or 'postgres' match the behavior of other systems:
   * - Skipped timestamps are interpreted with the pre-change offset in
   *   both 'postgres' and 'javascript'
   * - Duplicated timestamps are interpreted with the pre-change offset
   *   in 'javascript', and the post-change offset in 'postgres'.
   * */
  tzMode?: 'strict' | 'postgres' | 'javascript';
}

declare function parseDate(isoDate: string): Date | number | null
declare function parseDate(isoDate: string, serverTz: string): Date | number | null
declare function parseDate(isoDate: string, serverOffset: number): Date | number | null
declare function parseDate(isoDate: string, options: ParseDateOptions): Date | number | null
declare function parseDate(isoDate: null | undefined, options?: string | number | ParseDateOptions): null
export default parseDate
