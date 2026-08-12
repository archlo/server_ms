import { NpcScript } from './ScriptContext';
import { ScriptRegistry } from './ScriptRegistry';

/**
 * Port of kinoko's ScriptDispatcher script-name lookup (NPC portion only).
 * kinoko resolves `@Script("name")`-annotated Java methods via reflection;
 * none of that per-NPC script content is ported (game content, not
 * infrastructure - see PORT_GAPS.md "#15 scope notes"). This registry is the
 * lookup mechanism only - empty until scripts are added.
 */
export const NpcScriptRegistry = {
  register(scriptName: string, script: NpcScript): void {
    ScriptRegistry.npc.register(scriptName, script);
  },
  get(scriptName: string): NpcScript | undefined {
    return ScriptRegistry.npc.get(scriptName);
  },
};
