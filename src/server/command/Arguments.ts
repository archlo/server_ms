/**
 * Port of kinoko's `Arguments` annotation + argument parsing helpers.
 * kinoko uses a Java annotation to declare required argument names; the TS
 * port stores the same metadata on each `CommandEntry` (see
 * CommandProcessor) and exposes small parsing utilities used by command
 * implementations.
 */
export class Arguments {
  /** Optional argument names used for `!help` / syntax messages. */
  static of(...names: string[]): string[] {
    return names;
  }

  /** Parse a 1-based argument as an integer, returning `fallback` when missing. */
  static parseInt(args: string[], index: number, fallback = 0): number {
    const v = args[index];
    if (v === undefined || v.length === 0) return fallback;
    const n = Number.parseInt(v, 10);
    return Number.isFinite(n) ? n : fallback;
  }

  /** Joins every argument from `index` onward with spaces (for free-text queries). */
  static joinRest(args: string[], index: number): string {
    return args.slice(index).join(' ');
  }

  /** True when the given argument slot is present. */
  static has(args: string[], index: number): boolean {
    return args[index] !== undefined;
  }
}
