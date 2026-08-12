import { PacketReader } from "../../../protocol/packets/packetReader";
import { PacketHandler } from "../../baseHandler";
import { Session } from "../../session";
import { CenterServer } from "../centerServer";
import { CenterPackets } from "../centerPackets";
import { CharacterDB } from "../../channel/db/CharacterDB";
import { CharacterData } from "../../../world/user/CharacterData";
import { CharacterStat } from "../../../world/user/stat/CharacterStat";
import { ExtendSp } from "../../../world/user/stat/ExtendSp";
import { InventoryManager } from "../../../world/item/InventoryManager";
import { SkillManager } from "../../../world/skill/SkillManager";
import { QuestManager } from "../../../world/quest/QuestManager";
import { ItemProvider } from "../../../provider/ItemProvider";
import { SkillProvider } from "../../../provider/SkillProvider";
import { getJobByRace } from "../../../world/job/RaceSelect";
import { GameConstants } from "../../../world/GameConstants";
import { StatConstants } from "../../../world/user/stat/StatConstants";
import { SkillRecord } from "../../../world/skill/SkillRecord";

export class CreateCharacterHandler implements PacketHandler {
    async handlePacket(packet: PacketReader, session: Session): Promise<void> {
        const sessionId = packet.readInt();
        const accountId = packet.readInt();
        const charId = packet.readInt();
        const name = packet.readMapleAsciiString();
        const jobType = packet.readInt();
        const face = packet.readInt();
        const hairRaw = packet.readInt();
        const hairColor = packet.readInt();
        const skin = packet.readInt();
        const topId = packet.readInt();
        const bottomId = packet.readInt();
        const shoesId = packet.readInt();
        const weaponId = packet.readInt();
        const gender = packet.readByte();

        const available = await CharacterDB.checkNameAvailable(name);
        if (!available) {
            const response = CenterPackets.getCreateCharacterAck(sessionId, null, false);
            session.socket.write(response);
            return;
        }

        const hair = hairRaw + hairColor;

        const job = getJobByRace(jobType) ?? 0;

        const cd = new CharacterData(accountId);
        const cs = new CharacterStat();
        cs.id = charId;
        cs.name = name;
        cs.gender = gender;
        cs.skin = skin;
        cs.face = face;
        cs.hair = hair;
        cs.level = 1;
        cs.job = job;
        cs.baseStr = 12;
        cs.baseDex = 5;
        cs.baseInt = 4;
        cs.baseLuk = 4;
        const minHp = StatConstants.getMinHp(1, job);
        const minMp = StatConstants.getMinMp(1, job);
        cs.maxHp = minHp;
        cs.hp = minHp;
        cs.maxMp = minMp;
        cs.mp = minMp;
        cs.ap = 0;
        cs.exp = 0;
        cs.pop = 0;
        cs.posMap = GameConstants.getStartingMap(job, 0) || 100000000;
        cs.portal = 0;
        cs.sp = ExtendSp.from(new Map());
        cd.characterStat = cs;

        cd.inventoryManager = new InventoryManager();
        cd.skillManager = new SkillManager();
        cd.questManager = new QuestManager();
        cd.friendMax = 30;

        // Initialize starter skills for the job (level 0, masterLevel from data)
        const sm = cd.skillManager;
        for (const skillInfo of SkillProvider.getAllSkillInfos()) {
          const skillId = skillInfo.skillId;
          if (Math.floor(skillId / 10000) !== job) continue;
          if (skillInfo.invisible) continue;
          const sr = new SkillRecord(skillId);
          sr.skillLevel = 0;
          sr.masterLevel = skillInfo.masterLevel;
          sm.addSkill(sr);
        }

        // Give starter equipment — create Equip objects directly with just the
        // itemId (client loads sprites from Character.wz, doesn't need server stats).
        const im = cd.inventoryManager;
        const starterItems: Array<{ itemId: number; pos: number }> = [];
        if (topId > 0) starterItems.push({ itemId: topId, pos: -5 });
        if (bottomId > 0) starterItems.push({ itemId: bottomId, pos: -6 });
        if (shoesId > 0) starterItems.push({ itemId: shoesId, pos: -7 });
        if (weaponId > 0) starterItems.push({ itemId: weaponId, pos: -11 });

        for (const { itemId, pos } of starterItems) {
            const eq = new (await import('../../../world/item/Equip')).Equip();
            eq.itemSn = cd.getNextItemSn();
            eq.itemId = itemId;
            eq.quantity = 1;
            im.equipped.putItem(pos, eq);
        }

        const success = await CharacterDB.newCharacter(cd);
        if (!success) {
            const response = CenterPackets.getCreateCharacterAck(sessionId, null, false);
            session.socket.write(response);
            return;
        }

        const response = CenterPackets.getCreateCharacterAck(sessionId, cd, true);
        session.socket.write(response);
    }
}
