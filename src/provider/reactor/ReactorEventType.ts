export enum ReactorEventType {
  HIT      = 0,
  UNK_1    = 1,
  UNK_2    = 2,
  SKILL    = 5,
  ENTER    = 6,
  LEAVE    = 7,
  DROP     = 100,
  TIME_OUT = 101,
}

export function reactorEventTypeByValue(v: number): ReactorEventType | null {
  return Object.values(ReactorEventType).includes(v as ReactorEventType)
    ? (v as ReactorEventType) : null;
}
