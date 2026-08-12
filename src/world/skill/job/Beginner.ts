import { Job } from './Job';
import { Char } from '../../user/Char';
import { Skill } from '../Skill';

export class Beginner implements Job {
  static readonly THREE_SNAILS = 1000;
  static readonly RECOVERY = 1001;
  static readonly NIMBLE_FEET = 1002;
  static readonly LEGENDARY_SPIRIT = 1003;
  static readonly MONSTER_RIDER = 1004;
  static readonly ECHO_OF_HERO = 1005;
  static readonly JUMP_DOWN = 1006;
  static readonly MAKE_SLIME = 1007;
  static readonly SNATCH = 1008;
  static readonly FLASH_JUMP = 1009;
  static readonly WIND_BREAKER = 1010;
  static readonly FLAME = 1011;
  static readonly DARK_SIGHT_BEGINNER = 1012;
  static readonly TELEPORT_BEGINNER = 1013;
  static readonly PIRATES_RAGE = 1014;
  static readonly IRON_ARROW = 1015;
  static readonly FOLLOW_THE_LEADER = 11000;
  static readonly GIVE_AND_TAKE = 11001;
  static readonly ALL_SEEING_EYES = 11002;
  static readonly FOCUS_ENERGY = 11003;
  static readonly DECENT_HASTE = 8000;
  static readonly DECENT_MYSTIC_DOOR = 8001;
  static readonly DECENT_SHARP_EYES = 8002;
  static readonly DECENT_HYPER_BODY = 8003;
  static readonly BERSERK_MONSTER = 8004;
  static readonly HYPER_STANCE = 8005;
  static readonly FREEZE_ARROW = 8006;
  static readonly MULTI_FREEZE = 8007;
  static readonly SOUL_STONE = 8008;
  static readonly BURSTER = 8009;
  static readonly PUNCTURE = 8010;
  static readonly BLIND = 8011;
  static readonly DECENT_COMBAT_ORDERS = 8012;
  static readonly DECENT_ADVANCED_BLESS = 8013;
  static readonly SEAL_LIGHT = 8014;
  static readonly DARK_LIGHT = 8015;
  static readonly BIG_BOX = 8016;
  static readonly TELEPORT_BATTLEFIELD = 8017;
  static readonly ZERO_DROP = 8018;
  static readonly STRENGTH = 71;
  static readonly DEXTERITY = 72;
  static readonly INTELLECT = 73;
  static readonly LUCK = 74;
  static readonly BLESSING_OF_THE_FAIRY = 20000;
  static readonly TUTORIAL_QUEST = 20001;
  static readonly FOLLOW_TUTORIAL = 20002;
  static readonly CYGNUS_BLESSING = 20003;
  static readonly NOVA_WARRIOR = 20004;
  static readonly NOVA_MAGICIAN = 20005;
  static readonly NOVA_BOWMAN = 20006;
  static readonly NOVA_THIEF = 20007;
  static readonly NOVA_PIRATE = 20008;
  static readonly EMPERORS_BLESSING = 20009;
  static readonly NOVA_CYGNUS_BLESSING = 20012;
  static readonly ARAN_BLESSING = 20013;
  static readonly EVAN_BLESSING = 20014;
  static readonly RESISTANCE_BLESSING = 20015;
  static readonly RESISTANCE_BLESSING_2 = 20016;

  private static readonly BEGINNER_SKILLS = new Set<number>([
    Beginner.THREE_SNAILS, Beginner.RECOVERY, Beginner.NIMBLE_FEET, Beginner.LEGENDARY_SPIRIT,
    Beginner.MONSTER_RIDER, Beginner.ECHO_OF_HERO, Beginner.JUMP_DOWN, Beginner.MAKE_SLIME,
    Beginner.SNATCH, Beginner.FLASH_JUMP, Beginner.WIND_BREAKER, Beginner.FLAME,
    Beginner.DARK_SIGHT_BEGINNER, Beginner.TELEPORT_BEGINNER, Beginner.PIRATES_RAGE, Beginner.IRON_ARROW,
    Beginner.FOLLOW_THE_LEADER, Beginner.GIVE_AND_TAKE, Beginner.ALL_SEEING_EYES, Beginner.FOCUS_ENERGY,
    Beginner.DECENT_HASTE, Beginner.DECENT_MYSTIC_DOOR, Beginner.DECENT_SHARP_EYES, Beginner.DECENT_HYPER_BODY,
    Beginner.BERSERK_MONSTER, Beginner.HYPER_STANCE, Beginner.FREEZE_ARROW, Beginner.MULTI_FREEZE,
    Beginner.SOUL_STONE, Beginner.BURSTER, Beginner.PUNCTURE, Beginner.BLIND,
    Beginner.DECENT_COMBAT_ORDERS, Beginner.DECENT_ADVANCED_BLESS, Beginner.SEAL_LIGHT, Beginner.DARK_LIGHT,
    Beginner.BIG_BOX, Beginner.TELEPORT_BATTLEFIELD, Beginner.ZERO_DROP,
    Beginner.STRENGTH, Beginner.DEXTERITY, Beginner.INTELLECT, Beginner.LUCK,
    Beginner.BLESSING_OF_THE_FAIRY, Beginner.TUTORIAL_QUEST, Beginner.FOLLOW_TUTORIAL,
    Beginner.CYGNUS_BLESSING, Beginner.NOVA_WARRIOR, Beginner.NOVA_MAGICIAN, Beginner.NOVA_BOWMAN,
    Beginner.NOVA_THIEF, Beginner.NOVA_PIRATE, Beginner.EMPERORS_BLESSING, Beginner.NOVA_CYGNUS_BLESSING,
    Beginner.ARAN_BLESSING, Beginner.EVAN_BLESSING, Beginner.RESISTANCE_BLESSING, Beginner.RESISTANCE_BLESSING_2,
  ]);

  handleSkill(chr: Char, skill: Skill): void {
    console.log(`Beginner.handleSkill: ${skill.skillId}`);
  }

  handleAttack(chr: Char, skill: Skill, attackInfo: any): void {
    console.log(`Beginner.handleAttack: ${skill.skillId}`);
  }

  handleBuff(chr: Char, skill: Skill, option: any): void {
    console.log(`Beginner.handleBuff: ${skill.skillId}`);
  }

  isHandlerOfSkill(skillId: number): boolean {
    return Beginner.BEGINNER_SKILLS.has(skillId);
  }
}
