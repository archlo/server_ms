import { PacketReader } from '../../../protocol/packets/packetReader';
import { User } from '../../user/User';
import { MovePath } from '../life/MovePath';
import { NpcPacket } from './NpcPacket';
import { ScriptManager } from '../../script/ScriptManager';
import { NpcScriptRegistry } from '../../script/NpcScriptRegistry';
import { ShopProvider } from '../../../provider/ShopProvider';
import { openShopDialog } from '../../../server/dialog/shop/ShopDialog';
import { openTrunkDialog } from '../../../server/dialog/trunk/TrunkDialog';

export class NpcHandler {
  static handleNpcSpecialAction(user: User, r: PacketReader): void {
    const objectId = r.readInt();
    const action = r.readInt();
    const delay = r.readInt();
    const field = user.getField();
    const npc = field?.getNpcPool().getById(objectId);
    if (!npc) return;
    field?.broadcastPacket(NpcPacket.npcSpecialAction(npc, action, delay));
  }

  static handleNpcMove(user: User, r: PacketReader): void {
    const objectId = r.readInt(); // dwNpcId
    const oneTimeAction = r.readByte(); // nOneTimeAction
    const chatIndex = r.readByte(); // nChatIdx

    const field = user.getField();
    const npc = field?.getNpcPool().getById(objectId);
    if (!npc) return;

    const movePath = npc.isMove() ? MovePath.decode(r) : null;
    if (movePath) {
      movePath.applyTo(npc);
    }
    field?.broadcastPacket(NpcPacket.npcMove(npc, oneTimeAction, chatIndex, movePath));
  }

  static handleUserSelectNpcItemUseRequest(user: User, r: PacketReader): void {
    const objectId = r.readInt();

    const field = user.getField();
    const npc = field?.getNpcPool().getById(objectId);
    if (!npc) { user.dispose(); return; }

    if (user.hasDialog()) { user.dispose(); return; }

    if (npc.hasScript()) {
      const script = NpcScriptRegistry.get(npc.getScript());
      if (!script) { user.dispose(); return; }
      new ScriptManager(user, field, script, npc.getTemplateId()).start();
      return;
    }

    const templateId = npc.getTemplateId();
    if (npc.isTrunk()) {
      const trunk = user.account?.trunk;
      if (!trunk) { user.dispose(); return; }
      openTrunkDialog(user, templateId, npc.template.trunkPut, npc.template.trunkGet, trunk);
    } else if (ShopProvider.isShop(templateId)) {
      const items = ShopProvider.getNpcShopItems(templateId);
      openShopDialog(user, templateId, items);
    } else {
      user.dispose();
    }
  }
}
