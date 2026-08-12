import { FieldObject } from '../FieldObject';
import { ReactorTemplate } from '../../../provider/reactor/ReactorTemplate';
import { ReactorInfo } from '../../../provider/map/ReactorInfo';
import { GameConstants } from '../../GameConstants';

export class Reactor extends FieldObject {
  private _state = 0;

  constructor(
    public readonly template:    ReactorTemplate,
    public readonly reactorInfo: ReactorInfo,
  ) {
    super();
    this.reset(reactorInfo.x, reactorInfo.y, 0);
  }

  getTemplateId():       number  { return this.template.id; }
  isNotHitable():        boolean { return this.template.notHitable; }
  isActivateByTouch():   boolean { return this.template.activateByTouch; }
  getAction():           string  { return this.template.action; }
  getName():             string  { return this.reactorInfo.name; }
  getReactorTime():      number  { return this.reactorInfo.reactorTime; }
  isFlip():              boolean { return this.reactorInfo.flip; }

  getState():  number { return this._state; }
  setState(s: number): void { this._state = s; }

  getTimeOut(): number {
    const rs = this.template.states.get(this._state);
    return rs?.timeOut ?? 0;
  }

  hasAction(): boolean { return !!this.template.action; }
  isLastState(): boolean { return this._state === this.template.getLastState(); }

  tryHit(skillId: number): boolean {
    const ev = this.template.getHitEvent(this._state, skillId);
    if (!ev) return false;
    this._state = ev.nextState;
    return true;
  }

  reset(x: number, y: number, state: number): void {
    this.setX(x);
    this.setY(y);
    this._state = state;
  }
}
