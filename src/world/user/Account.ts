import { Trunk } from '../item/Trunk';
import { CharacterData } from './CharacterData';

export class Account {
  slotCount  = 3;
  nxCredit   = 0;
  nxPrepaid  = 0;
  maplePoint = 0;
  trunk:    Trunk | null = null;
  wishlist: number[]     = [];
  acceptApspEvent = false;
  dragonBallPieces: number[] = [];

  // GM/admin flag (loaded from `accounts.web_admin`). Transient — not
  // persisted by Account itself; set via AccountDB.loadAccount.
  gm                    = false;

  // transient (not persisted)
  channelId            = -1;
  hasSecondaryPassword = false;
  characterList: CharacterData[] | null = null;

  constructor(
    public readonly id: number,
    public readonly username: string,
  ) {}

  canSelectCharacter(characterId: number): boolean {
    return this.characterList !== null &&
      this.characterList.some(cd => cd.getCharacterId() === characterId);
  }
}
