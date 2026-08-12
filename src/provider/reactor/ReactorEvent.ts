import { ReactorEventType } from './ReactorEventType';
import { NXNode } from '../../wz-utils/NXNode';
import { Rect } from '../../util/Rect';

export class ReactorEvent {
  rect:   Rect | null   = null;
  itemId: number        = 0;
  skills: Set<number>   = new Set();

  constructor(
    public readonly type:      ReactorEventType,
    public readonly nextState: number,
  ) {}

  static from(eventNode: NXNode): ReactorEvent | null {
    const typeVal  = eventNode.nGet('type',  0) as number;
    const type     = Object.values(ReactorEventType).includes(typeVal as ReactorEventType)
      ? (typeVal as ReactorEventType) : null;
    if (type === null) return null;
    const nextState = eventNode.nGet('state', 0) as number;
    const ev = new ReactorEvent(type, nextState);
    if (type === ReactorEventType.SKILL) {
      const skillList = eventNode.nGet('activeSkillID') as NXNode | undefined;
      if (skillList) {
        for (const child of skillList.nChildren) {
          const id = child.nValue as number;
          if (!isNaN(id)) ev.skills.add(id);
        }
      }
      ev.rect = _readRect(eventNode);
    } else if (type === ReactorEventType.DROP) {
      ev.itemId = eventNode.nGet('0', 0) as number;
      ev.rect   = _readRect(eventNode);
    }
    return ev;
  }
}

function _readRect(node: NXNode): Rect | null {
  const lt = node.nGet('lt') as NXNode | undefined;
  const rb = node.nGet('rb') as NXNode | undefined;
  if (!lt || !rb) return null;
  return Rect.of(lt.nX, lt.nY, rb.nX, rb.nY);
}
