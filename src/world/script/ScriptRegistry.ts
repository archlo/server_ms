import { NpcScript } from './ScriptContext';

class NamedScriptRegistry {
  private readonly registry = new Map<string, NpcScript>();

  register(scriptName: string, script: NpcScript): void {
    this.registry.set(scriptName, script);
  }

  get(scriptName: string): NpcScript | undefined {
    return this.registry.get(scriptName);
  }
}

export const ScriptRegistry = {
  npc: new NamedScriptRegistry(),
  portal: new NamedScriptRegistry(),
  item: new NamedScriptRegistry(),
};
