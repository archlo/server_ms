import { NXNode } from '../../wz-utils/NXNode';
import { ReactorState } from './ReactorState';
import { ReactorEvent } from './ReactorEvent';
import { ReactorEventType } from './ReactorEventType';

export class ReactorTemplate {
  constructor(
    public readonly id:              number,
    public readonly notHitable:      boolean,
    public readonly activateByTouch: boolean,
    public readonly action:          string,
    public readonly states:          Map<number, ReactorState>,
  ) {}

  getLastState(): number {
    let max = 0;
    for (const k of this.states.keys()) if (k > max) max = k;
    return max;
  }

  getHitEvent(state: number, skillId: number): ReactorEvent | null {
    const rs = this.states.get(state);
    if (!rs) return null;
    for (const ev of rs.events) {
      if ((ev.type === ReactorEventType.HIT   && skillId === 0) ||
          (ev.type === ReactorEventType.SKILL  && ev.skills.has(skillId))) return ev;
    }
    return null;
  }

  getDropEvent(state: number, itemId: number): ReactorEvent | null {
    const rs = this.states.get(state);
    if (!rs) return null;
    for (const ev of rs.events) {
      if (ev.type === ReactorEventType.DROP && ev.itemId === itemId) return ev;
    }
    return null;
  }

  static from(id: number, notHitable: boolean, activateByTouch: boolean, action: string, reactorNode: NXNode): ReactorTemplate {
    const states = new Map<number, ReactorState>();
    for (let i = 0; ; i++) {
      const stateNode = reactorNode.nGet(String(i)) as NXNode | undefined;
      if (!stateNode) break;
      const events: ReactorEvent[] = [];
      let timeOut = 0;
      const eventList = stateNode.nGet('event') as NXNode | undefined;
      if (eventList) {
        timeOut = eventList.nGet('timeOut', 0) as number;
        for (let j = 0; ; j++) {
          const evNode = eventList.nGet(String(j)) as NXNode | undefined;
          if (!evNode) break;
          const ev = ReactorEvent.from(evNode);
          if (ev) events.push(ev);
        }
      }
      states.set(i, new ReactorState(events, timeOut));
    }
    return new ReactorTemplate(id, notHitable, activateByTouch, action, states);
  }
}
