/**
 * Port of kinoko's `CommandProcessor`.
 *
 * kinoko discovers `@Command`-annotated methods via reflection at startup.
 * The TS port uses an explicit registry: each command implementation
 * registers a `CommandEntry` (aliases + optional argument names + handler)
 * through `CommandProcessor.register`. `AdminCommands.registerAll()` wires
 * up the built-in GM commands.
 *
 * `!`-prefixed chat messages are intercepted in `UserHandler.handleUserChat`
 * and routed here instead of being broadcast as normal chat.
 */
import { User } from '../../world/user/User';
import { MessagePacket } from '../../world/user/MessagePacket';

export const COMMAND_PREFIX = '!';

export interface CommandEntry {
  /** Lower-cased aliases that invoke this command (e.g. ["map", "warp"]). */
  names: string[];
  /** Human-readable argument names, used for syntax/help output. */
  args: string[];
  /** Handler invoked as `(user, args)` where `args[0]` is the command name. */
  handler: (user: User, args: string[]) => void;
}

export class CommandProcessor {
  private static readonly commandMap = new Map<string, CommandEntry>();
  private static initialized = false;

  /** Register a command entry under each of its aliases. */
  static register(entry: CommandEntry): void {
    for (const alias of entry.names) {
      const key = alias.toLowerCase();
      if (CommandProcessor.commandMap.has(key)) {
        throw new Error(`CommandProcessor: duplicate command alias "${key}"`);
      }
      CommandProcessor.commandMap.set(key, entry);
    }
  }

  /** Idempotent bootstrap that registers all built-in command modules. */
  static initialize(): void {
    if (CommandProcessor.initialized) return;
    CommandProcessor.initialized = true;
    // Lazy require to avoid circular import at module load time.
    const { AdminCommands } = require('./AdminCommands');
    AdminCommands.registerAll();
  }

  static getCommand(commandName: string): CommandEntry | undefined {
    return CommandProcessor.commandMap.get(commandName.toLowerCase());
  }

  /** Returns the distinct registered command entries (for `!help`). */
  static getAllEntries(): CommandEntry[] {
    const seen = new Set<CommandEntry>();
    for (const entry of CommandProcessor.commandMap.values()) {
      if (!seen.has(entry)) seen.add(entry);
    }
    return [...seen];
  }

  /** Returns true when `text` should be treated as a command (starts with `!`). */
  static isCommand(text: string): boolean {
    return text.length > 1 && text.startsWith(COMMAND_PREFIX);
  }

  /** Builds the syntax/help string for a command (port of getHelpString). */
  static getHelpString(entry: CommandEntry): string {
    const argString = entry.args.map((a) => `<${a}>`).join(' ');
    return `${COMMAND_PREFIX}${entry.names.join('|')} ${argString}`.trimEnd();
  }

  /**
   * Port of kinoko's `CommandProcessor::tryProcessCommand`. Parses `text`
   * (without the leading prefix), validates required arguments, and invokes
   * the handler. Errors are reported to the user via `MessagePacket.system`.
   */
  static tryProcessCommand(user: User, text: string): void {
    CommandProcessor.initialize();
    const stripped = text.startsWith(COMMAND_PREFIX) ? text.slice(COMMAND_PREFIX.length) : text;
    const args = stripped.split(' ');
    const commandName = (args[0] ?? '').toLowerCase();
    const entry = CommandProcessor.getCommand(commandName);
    if (!entry) {
      user.write(MessagePacket.system(`Unknown command : ${text}`));
      return;
    }
    if (entry.args.length > 0 && args.length < entry.args.length + 1) {
      user.write(MessagePacket.system(`Syntax : ${CommandProcessor.getHelpString(entry)}`));
      return;
    }
    try {
      entry.handler(user, args);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      ChannelLogger.warn(`CommandProcessor: error processing "${text}": ${msg}`);
      user.write(MessagePacket.system(`Failed to process command : ${text}`));
    }
  }
}

/** Thin wrapper around the channel logger to avoid a hard import cycle. */
const ChannelLogger = {
  warn(message: string): void {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { ChannelServer } = require('../channel/channelServer');
      ChannelServer.instance?.logger?.warn(message);
    } catch {
      /* channel not available */
    }
  },
};
