import { User } from '../user/User';
import { Field } from '../field/Field';
import { ScriptContext, NpcScript } from './ScriptContext';
import { ScriptMessage } from './ScriptMessage';
import { ScriptMessageType } from './ScriptMessageType';
import { ScriptAnswer } from './ScriptAnswer';
import { NpcPacket } from '../field/npc/NpcPacket';
import { ScriptRegistry } from './ScriptRegistry';

/**
 * Port of kinoko's ScriptManagerImpl + ScriptMemory + ScriptDialog, adapted
 * to drive a JS generator (NpcScript) instead of a blocking Java thread.
 *
 * ScriptDispatcher (kinoko's entry point that resolves the script by name and
 * spawns it on a thread) is replaced by NpcScriptRegistry (JSON/registry
 * lookup by NPC template ID) - see NpcScriptRegistry.ts.
 */
export class ScriptManager {
  private readonly ctx: ScriptContext;
  private readonly generator: Generator<ScriptMessage, void, any>;

  // ScriptMemory: recorded SAY messages for prev/next navigation.
  private readonly messageMemory: ScriptMessage[] = [];
  private messageIndex = -1;

  constructor(
    public readonly user: User,
    public readonly field: Field,
    script: NpcScript,
    speakerId: number,
  ) {
    this.ctx = new ScriptContext(user, field, speakerId);
    this.generator = script(this.ctx);
  }

  /** Starts the script - sends the first message, if any. */
  start(): void {
    this.advance(this.generator.next());
  }

  /** Port of kinoko's ScriptManagerImpl::submitAnswer (via ScriptDialog). */
  submitAnswer(answer: ScriptAnswer): void {
    const current = this.messageMemory[this.messageIndex];
    if (!current) return;

    // Termination: action -1 (close/X) or 5.
    if (answer.action === -1 || answer.action === 5) {
      this.terminate();
      return;
    }

    // Prev navigation for SAY messages with hasPrev.
    if (answer.action === 0 && current.isPrevPossible()) {
      this.messageIndex--;
      this.sendMessage(this.messageMemory[this.messageIndex], false);
      return;
    }

    // Next-in-memory replay (player pressed "next" on a previously-visited message).
    if (this.messageIndex < this.messageMemory.length - 1) {
      this.messageIndex++;
      this.sendMessage(this.messageMemory[this.messageIndex], false);
      return;
    }

    // Resume the generator with the resolved answer value.
    const resumeValue = resolveAnswer(current.messageType, answer);
    this.advance(this.generator.next(resumeValue));
  }

  /** Port of kinoko's ScriptDialog::close. */
  close(): void {
    this.terminate();
  }

  static startNpcScript(user: User, field: Field, scriptName: string, speakerId: number): boolean {
    const script = ScriptRegistry.npc.get(scriptName);
    if (!script || user.hasDialog()) return false;
    new ScriptManager(user, field, script, speakerId).start();
    return true;
  }

  static startPortalScript(user: User, field: Field, scriptName: string): boolean {
    const script = ScriptRegistry.portal.get(scriptName);
    if (!script || user.hasDialog()) return false;
    new ScriptManager(user, field, script, 0).start();
    return true;
  }

  static startItemScript(user: User, field: Field, scriptName: string, itemId: number): boolean {
    const script = ScriptRegistry.item.get(scriptName);
    if (!script || user.hasDialog()) return false;
    new ScriptManager(user, field, script, itemId).start();
    return true;
  }

  /** Field enter scripts (onUserEnter / onFirstUserEnter) — non-blocking, log on miss. */
  static startFieldEnterScript(user: User, field: Field, scriptName: string): void {
    const script = ScriptRegistry.fieldEnter.get(scriptName);
    if (!script) {
      console.warn(`[Script] Field enter script not found: ${scriptName} on field ${field.getFieldId()}`);
      return;
    }
    if (user.hasDialog()) return;
    new ScriptManager(user, field, script, 0).start();
  }

  private advance(result: IteratorResult<ScriptMessage, void>): void {
    if (result.done) {
      this.terminate();
      return;
    }
    const message = result.value as ScriptMessage;
    this.recordMessage(message);
    this.sendMessage(message, true);
  }

  private recordMessage(message: ScriptMessage): void {
    // assert current position is the end of memory
    this.messageMemory.push(message);
    this.messageIndex++;
  }

  private sendMessage(message: ScriptMessage, setDialog: boolean): void {
    if (setDialog) {
      this.user.setDialog(this);
    }
    this.user.write(NpcPacket.scriptMessage(message));
  }

  private terminate(): void {
    this.user.setDialog(null);
    this.generator.return();
  }
}

/**
 * Port of the per-message-type unwrapping in
 * ScriptManagerImpl::askYesNo/askAccept/askMenu/askNumber/askText/etc -
 * converts a raw ScriptAnswer into the value the generator's `yield`
 * expression resolves to.
 */
function resolveAnswer(messageType: ScriptMessageType, answer: ScriptAnswer): any {
  switch (messageType) {
    case ScriptMessageType.ASKYESNO:
    case ScriptMessageType.ASKACCEPT:
      return answer.action !== 0;
    case ScriptMessageType.ASKMENU:
    case ScriptMessageType.ASKSLIDEMENU:
    case ScriptMessageType.ASKAVATAR:
    case ScriptMessageType.ASKMEMBERSHOPAVATAR:
    case ScriptMessageType.ASKNUMBER:
      return answer.answer;
    case ScriptMessageType.ASKTEXT:
    case ScriptMessageType.ASKBOXTEXT:
      return answer.textAnswer;
    default:
      return undefined;
  }
}
