/** Port of kinoko's EventType. */
export enum EventType {
  CM_VICTORIA = 'CM_VICTORIA',
  CM_LUDIBRIUM = 'CM_LUDIBRIUM',
  CM_LEAFRE = 'CM_LEAFRE',
  CM_ARIANT = 'CM_ARIANT',
  CM_ELEVATOR = 'CM_ELEVATOR',
  CM_SUBWAY = 'CM_SUBWAY',
  CM_AIRPORT = 'CM_AIRPORT',
}

export namespace EventType {
  export function getByName(name: string): EventType | undefined {
    return (Object.values(EventType) as string[]).includes(name) ? (name as EventType) : undefined;
  }
}
