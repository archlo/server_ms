/** Port of kinoko's ScriptMessageType. */
export enum ScriptMessageType {
  SAY = 0,
  SAYIMAGE = 1,
  ASKYESNO = 2,
  ASKTEXT = 3,
  ASKNUMBER = 4,
  ASKMENU = 5,
  ASKQUIZ = 6,
  ASKSPEEDQUIZ = 7,
  ASKAVATAR = 8,
  ASKMEMBERSHOPAVATAR = 9,
  ASKPET = 10,
  ASKPETALL = 11,
  SCRIPT = 12,
  ASKACCEPT = 13,
  ASKBOXTEXT = 14,
  ASKSLIDEMENU = 15,
  ASKCENTER = 16,
}

/** Port of kinoko's ScriptMessageParam. */
export const ScriptMessageParam = {
  NONE: 0x0,
  NOT_CANCELLABLE: 0x1,
  PLAYER_AS_SPEAKER: 0x2,
  SPEAKER_ON_RIGHT: 0x4,
  FLIP_SPEAKER: 0x8,
} as const;
