import { FieldObjectPool } from '../FieldObjectPool';
import { Reactor } from './Reactor';
import { ReactorPacket } from './ReactorPacket';
import { GameConstants } from '../../GameConstants';
import { User } from '../../user/User';

export class ReactorPool extends FieldObjectPool<Reactor> {
  private idCounter = 1;
  private readonly hitReactors = new Map<Reactor, Date>(); // reactor -> next reset time

  constructor(private readonly field: any) { super(); }

  addReactor(reactor: Reactor): void {
    reactor.setField(this.field);
    reactor.setId(this.idCounter++);
    this.addObject(reactor);
  }

  removeReactor(reactor: Reactor): boolean { return this.removeObject(reactor); }

  getByTemplateId(templateId: number): Reactor | undefined {
    return this.getBy((r) => r.getTemplateId() === templateId);
  }

  /**
   * Port of kinoko's ReactorPool::hitReactor.
   * ScriptDispatcher.startReactorScript (NPC dialog/script engine, #15) and
   * HenesysPQ.PRIMROSE_REACTORS special-case (party-quest content, unported)
   * are cut - documented in PORT_GAPS.md.
   */
  hitReactor(user: User, reactor: Reactor, delay: number): void {
    if (reactor.getReactorTime() > 0) {
      this.hitReactors.set(reactor, new Date(Date.now() + reactor.getReactorTime() * 1000));
    }
    if (reactor.getTimeOut() > 0) {
      this.hitReactors.set(reactor, new Date(Date.now() + reactor.getTimeOut()));
    }
    this.field.broadcastPacket(ReactorPacket.reactorChangeState(reactor, delay, 0, GameConstants.REACTOR_END_DELAY));
    // ScriptDispatcher.startReactorScript(user, reactor, reactor.getAction()) - cut, needs #15.
  }

  // Reset reactors whose reactorTime has elapsed
  tryReset(now: Date): Reactor[] {
    // Reactor reset is managed by Field.update() using timestamps; pool just holds active reactors.
    return [];
  }
}
