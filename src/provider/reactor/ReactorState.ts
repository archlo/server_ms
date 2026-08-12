import { ReactorEvent } from './ReactorEvent';

export class ReactorState {
  constructor(
    public readonly events:  ReactorEvent[],
    public readonly timeOut: number,
  ) {}
}
