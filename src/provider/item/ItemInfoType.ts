export enum ItemInfoType {
  cash='cash', price='price', unitPrice='unitPrice', slotMax='slotMax',
  durability='durability', only='only', tradBlock='tradBlock', dropBlock='dropBlock',
  tradeBlock='tradeBlock', tragetBlock='tragetBlock', pickUpBlock='pickUpBlock',
  tradeAvailable='tradeAvailable', equipTradeBlock='equipTradeBlock',
  scanTradeBlock='scanTradeBlock', accountSharable='accountSharable',
  timeLimited='timeLimited', noExpend='noExpend', notExtend='notExtend',
  notSale='notSale', onlyEquip='onlyEquip', quest='quest', questId='questId',
  uiData='uiData', mobPotion='mobPotion', maxLevel='maxLevel', setItemID='setItemID',
  life='life', hungry='hungry', chatBalloon='chatBalloon', nameTag='nameTag',
  permanent='permanent', consumeHP='consumeHP', consumeMP='consumeMP',
  pickupItem='pickupItem', sweepForDrop='sweepForDrop', evol='evol',
  incSTR='incSTR', incDEX='incDEX', incINT='incINT', incLUK='incLUK',
  incHP='incHP', incMP='incMP', incMHP='incMHP', incMHPr='incMHPr',
  incMMP='incMMP', incMMPr='incMMPr', incMaxHP='incMaxHP', incMaxMP='incMaxMP',
  incPAD='incPAD', incMAD='incMAD', incPDD='incPDD', incMDD='incMDD',
  incACC='incACC', incEVA='incEVA', incCraft='incCraft', incSpeed='incSpeed',
  incJump='incJump', incSwim='incSwim', incFatigue='incFatigue', incIUC='incIUC',
  incLEV='incLEV', incReqLevel='incReqLevel', incRandVol='incRandVol',
  incPERIOD='incPERIOD', success='success', cursed='cursed', recover='recover',
  randstat='randstat', preventslip='preventslip', warmsupport='warmsupport',
  elemDefault='elemDefault', incRMAF='incRMAF', incRMAI='incRMAI',
  incRMAL='incRMAL', incRMAS='incRMAS',
  reqSTR='reqSTR', reqDEX='reqDEX', reqINT='reqINT', reqLUK='reqLUK',
  reqLEVEL='reqLEVEL', reqPOP='reqPOP', reqCUC='reqCUC', reqRUC='reqRUC',
  reqJob='reqJob', reqLevel='reqLevel', reqSkillLevel='reqSkillLevel',
  masterLevel='masterLevel', skill='skill', reqQuestOnProgress='reqQuestOnProgress',
  enchantCategory='enchantCategory', tuc='tuc', IUCMax='IUCMax', setKey='setKey',
  addition='addition', npc='npc', keywordEffect='keywordEffect',
  stateChangeItem='stateChangeItem', lt='lt', rb='rb', lv='lv',
  randOption='randOption', randStat='randStat', time='time',
  recoveryHP='recoveryHP', recoveryMP='recoveryMP',
}

const nameMap = new Map<string, ItemInfoType>();
for (const v of Object.values(ItemInfoType)) nameMap.set(v, v as ItemInfoType);

export function itemInfoTypeIsIgnored(name: string): boolean { return !nameMap.has(name); }
export function itemInfoTypeFromName(name: string): ItemInfoType { return nameMap.get(name) as ItemInfoType; }
