import { CharacterTemporaryStat } from '../../world/user/stat/CharacterTemporaryStat';

export enum ItemSpecType {
  hp='hp', mp='mp', hpR='hpR', mpR='mpR', inc='inc', incFatigue='incFatigue',
  seal='seal', curse='curse', weakness='weakness', poison='poison', darkness='darkness',
  time='time', str='str', dex='dex', int_='int', luk='luk',
  mhpR='mhpR', mmpR='mmpR', pad='pad', mad='mad', pdd='pdd', mdd='mdd',
  acc='acc', eva='eva', speed='speed', jump='jump', booster='booster',
  thaw='thaw', exp='exp', expinc='expinc', expBuff='expBuff',
  defenseAtt='defenseAtt', defenseState='defenseState',
  itemupbyitem='itemupbyitem', mesoupbyitem='mesoupbyitem',
  mhpRRate='mhpRRate', mmpRRate='mmpRRate', padRate='padRate', madRate='madRate',
  pddRate='pddRate', mddRate='mddRate', accRate='accRate', evaRate='evaRate',
  speedRate='speedRate', eventRate='eventRate', eventPoint='eventPoint',
  barrier='barrier', berserk='berserk',
  npc='npc', script='script', moveTo='moveTo', ignoreContinent='ignoreContinent',
  returnMapQR='returnMapQR', onlyPickup='onlyPickup', runOnPickup='runOnPickup',
  consumeOnPickup='consumeOnPickup', repeatEffect='repeatEffect', uiNumber='uiNumber',
  morph='morph', morphRandom='morphRandom', ghost='ghost', screenMsg='screenMsg',
  randomMoveInFieldSet='randomMoveInFieldSet', cp='cp', party='party',
  otherParty='otherParty', nuffSkill='nuffSkill', respectFS='respectFS',
  respectPimmune='respectPimmune', respectMimmune='respectMimmune',
  con='con', prob='prob', itemCode='itemCode', itemRange='itemRange',
  mob='mob', mobID='mobID', mobHp='mobHp', attackMobID='attackMobID',
  attackIndex='attackIndex', dojangshield='dojangshield', BFSkill='BFSkill',
}

const IGNORED = new Set(['con', 'mob', 'morphRandom']);

const nameMap = new Map<string, ItemSpecType>();
for (const [k, v] of Object.entries(ItemSpecType)) {
  // int_ maps to 'int' in WZ
  nameMap.set(k === 'int_' ? 'int' : v, v as ItemSpecType);
}

export function itemSpecTypeIsIgnored(name: string): boolean {
  return /^\d+$/.test(name) || IGNORED.has(name);
}
export function itemSpecTypeFromName(name: string): ItemSpecType | null {
  return nameMap.get(name) ?? null;
}

/** Port of kinoko's ItemSpecType::getStat - used by User::setConsumeItemEffect (#16). */
export function itemSpecTypeGetStat(type: ItemSpecType): CharacterTemporaryStat | null {
  switch (type) {
    case ItemSpecType.pad:    return CharacterTemporaryStat.PAD;
    case ItemSpecType.mad:    return CharacterTemporaryStat.MAD;
    case ItemSpecType.pdd:    return CharacterTemporaryStat.PDD;
    case ItemSpecType.mdd:    return CharacterTemporaryStat.MDD;
    case ItemSpecType.acc:    return CharacterTemporaryStat.ACC;
    case ItemSpecType.eva:    return CharacterTemporaryStat.EVA;
    case ItemSpecType.speed:  return CharacterTemporaryStat.Speed;
    case ItemSpecType.jump:   return CharacterTemporaryStat.Jump;
    case ItemSpecType.booster: return CharacterTemporaryStat.Booster;
    case ItemSpecType.mhpR:   return CharacterTemporaryStat.MaxHP;
    case ItemSpecType.mmpR:   return CharacterTemporaryStat.MaxMP;
    case ItemSpecType.thaw:   return CharacterTemporaryStat.Thaw;
    case ItemSpecType.morph:  return CharacterTemporaryStat.Morph;
    case ItemSpecType.expBuff: return CharacterTemporaryStat.ExpBuffRate;
    // The following require special handling (see User::setConsumeItemEffect)
    case ItemSpecType.defenseAtt:    return CharacterTemporaryStat.DefenseAtt;
    case ItemSpecType.defenseState:  return CharacterTemporaryStat.DefenseState;
    case ItemSpecType.respectPimmune: return CharacterTemporaryStat.RespectPImmune;
    case ItemSpecType.respectMimmune: return CharacterTemporaryStat.RespectMImmune;
    case ItemSpecType.itemupbyitem:  return CharacterTemporaryStat.ItemUpByItem;
    case ItemSpecType.mesoupbyitem:  return CharacterTemporaryStat.MesoUpByItem;
    // Reset stats
    case ItemSpecType.curse:    return CharacterTemporaryStat.Curse;
    case ItemSpecType.darkness: return CharacterTemporaryStat.Darkness;
    case ItemSpecType.poison:   return CharacterTemporaryStat.Poison;
    case ItemSpecType.seal:     return CharacterTemporaryStat.Seal;
    case ItemSpecType.weakness: return CharacterTemporaryStat.Weakness;
    default: return null;
  }
}
