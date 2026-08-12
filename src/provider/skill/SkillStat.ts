export enum SkillStat {
  x='x', y='y', z='z', u='u', v='v', w='w', t='t',
  prop='prop', subProp='subProp', time='time', subTime='subTime',
  cooltime='cooltime', range='range', damage='damage', damagepc='damagepc',
  fixdamage='fixdamage', attackCount='attackCount', mobCount='mobCount',
  dot='dot', dotInterval='dotInterval', dotTime='dotTime',
  hpCon='hpCon', mpCon='mpCon', bulletCount='bulletCount',
  bulletConsume='bulletConsume', itemCon='itemCon', itemConNo='itemConNo',
  itemConsume='itemConsume', moneyCon='moneyCon', selfDestruction='selfDestruction',
  hp='hp', mp='mp', pad='pad', mad='mad', pdd='pdd', mdd='mdd',
  acc='acc', eva='eva', er='er', cr='cr',
  criticaldamageMin='criticaldamageMin', criticaldamageMax='criticaldamageMax',
  mastery='mastery', morph='morph', speed='speed', jump='jump',
  psdSpeed='psdSpeed', psdJump='psdJump',
  emhp='emhp', emmp='emmp', epad='epad', emad='emad', epdd='epdd', emdd='emdd',
  padX='padX', madX='madX',
  mhpR='mhpR', mmpR='mmpR', ar='ar', pdr='pdr', mdr='mdr',
  accR='accR', evaR='evaR', padR='padR', madR='madR', pddR='pddR', mddR='mddR',
  asrR='asrR', terR='terR', damR='damR',
  ignoreMobDamR='ignoreMobDamR', ignoreMobpdpR='ignoreMobpdpR',
  mesoR='mesoR', expR='expR', overChargeR='overChargeR', disCountR='disCountR',
  lt='lt', rb='rb', hs='hs', hit='hit', ball='ball',
  action='action', dateExpire='dateExpire', maxLevel='maxLevel',
  interval='interval', summonEffect='summonEffect',
}

const nameMap = new Map<string, SkillStat>();
for (const v of Object.values(SkillStat)) nameMap.set(v, v as SkillStat);

export function skillStatFromName(name: string): SkillStat | null {
  return nameMap.get(name) ?? null;
}
