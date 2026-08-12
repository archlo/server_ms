import { QuestAct } from './QuestAct';
import { User } from '../../../world/user/User';
import { questFailedUnknown } from '../../../world/quest/QuestPacket';
import { Pet } from '../../../world/user/Pet';
import { InventoryType } from '../../../world/item/InventoryType';
import { inventoryOperation } from '../../../world/item/ItemPacket';
import { UserLocal } from '../../../world/user/UserLocal';
import { Effect } from '../../../world/user/effect/Effect';
import { GameConstants } from '../../../world/GameConstants';

export class QuestPetAct implements QuestAct {
  constructor(private readonly tameness: number, private readonly speed: boolean) {}

  canAct(user: User, _rewardIndex: number): boolean {
    if (!user.getPet(0)) {
      user.write(questFailedUnknown());
      return false;
    }
    return true;
  }

  doAct(user: User, _rewardIndex: number): boolean {
    const pet = user.getPet(0);
    if (!pet) return false;
    const im = user.getInventoryManager();
    const entry = im.getItemBySn(InventoryType.CASH, pet.getItemSn());
    if (!entry) throw new Error('Could not resolve pet item');
    const [position, item] = entry;
    const petData = item.petData;
    if (!petData) return false;

    let levelUp = false;
    if (this.tameness > 0) {
      const newTameness = Math.min(petData.tameness + this.tameness, GameConstants.PET_TAMENESS_MAX);
      petData.tameness = newTameness;
      while (petData.level < GameConstants.PET_LEVEL_MAX &&
             newTameness > GameConstants.getNextLevelPetCloseness(petData.level)) {
        petData.level += 1;
        levelUp = true;
      }
    }
    if (this.speed) {
      petData.petAttribute = petData.petAttribute | 1;
    }

    const updateOp = im.updateItem(position, item);
    if (!updateOp) throw new Error('Could not update pet item');
    user.write(inventoryOperation(updateOp, false));
    if (levelUp) {
      user.write(UserLocal.effect(Effect.petLevelUp(pet.getPetIndex())));
    }
    return true;
  }
}
