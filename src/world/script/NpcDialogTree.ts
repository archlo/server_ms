import { ScriptContext, NpcScript } from './ScriptContext';
import { ScriptMessage } from './ScriptMessage';

/**
 * JSON dialog tree format for simple "talk-only" NPCs - covers the common
 * case of kinoko NPC scripts that are just a chain of `sayNext`/`sayPrev`
 * lines with optional yes/no or menu branches. NPCs whose script does
 * something kinoko's Java scripts do beyond dialog (give items, start
 * quests, open shops, etc.) should be hand-written generator scripts
 * registered in NpcScriptRegistry.ts instead - this format has no side
 * effects, it can only navigate between nodes.
 *
 * Each node is keyed by an arbitrary string id. The tree starts at "start".
 *
 * Node shapes:
 *   { "type": "say", "text": "...", "next": "nodeId" }
 *     - sayNext if `next` is set, sayOk if omitted (ends dialog).
 *   { "type": "askYesNo", "text": "...", "yes": "nodeId", "no": "nodeId" }
 *   { "type": "askMenu", "text": "...", "options": { "0": ["label", "nodeId"], "1": [...] } }
 *
 * Missing/invalid `next`/`yes`/`no`/option targets end the dialog (sayOk
 * behavior - the message is sent without a "next" link).
 */
export interface NpcDialogNode {
  type: 'say' | 'askYesNo' | 'askMenu';
  text: string;
  next?: string;
  yes?: string;
  no?: string;
  options?: Record<string, [label: string, next: string]>;
}

export interface NpcDialogTree {
  start: string;
  nodes: Record<string, NpcDialogNode>;
}

/** Builds an NpcScript generator that walks a JSON NpcDialogTree. */
export function fromDialogTree(tree: NpcDialogTree): NpcScript {
  return function* (ctx: ScriptContext): Generator<ScriptMessage, void, any> {
    let nodeId: string | undefined = tree.start;
    let hasPrev = false;

    while (nodeId) {
      const node: NpcDialogNode | undefined = tree.nodes[nodeId];
      if (!node) return;

      switch (node.type) {
        case 'say': {
          const message = node.next
            ? (hasPrev ? ctx.sayBoth(node.text) : ctx.sayNext(node.text))
            : (hasPrev ? ctx.sayPrev(node.text) : ctx.sayOk(node.text));
          yield message;
          if (!node.next) return;
          hasPrev = true;
          nodeId = node.next;
          break;
        }
        case 'askYesNo': {
          const yes: boolean = yield ctx.askYesNo(node.text);
          nodeId = yes ? node.yes : node.no;
          hasPrev = false;
          break;
        }
        case 'askMenu': {
          const options = new Map<number, string>();
          const targets = new Map<number, string>();
          for (const [key, [label, next]] of Object.entries(node.options ?? {})) {
            const k = Number(key);
            options.set(k, label);
            targets.set(k, next);
          }
          const selected: number = yield ctx.askMenu(node.text, options);
          nodeId = targets.get(selected);
          hasPrev = false;
          break;
        }
      }
    }
  };
}
