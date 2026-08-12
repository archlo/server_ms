export enum ItemOptionStat {
  prop='prop', time='time',
  incSTR='incSTR', incDEX='incDEX', incINT='incINT', incLUK='incLUK',
  HP='HP', MP='MP', incMHP='incMHP', incMMP='incMMP',
  incACC='incACC', incEVA='incEVA', incSpeed='incSpeed', incJump='incJump',
  incPAD='incPAD', incMAD='incMAD', incPDD='incPDD', incMDD='incMDD',
  incSTRr='incSTRr', incDEXr='incDEXr', incINTr='incINTr', incLUKr='incLUKr',
  incMHPr='incMHPr', incMMPr='incMMPr', incACCr='incACCr', incEVAr='incEVAr',
  incPADr='incPADr', incMADr='incMADr', incPDDr='incPDDr', incMDDr='incMDDr',
  incCr='incCr', incCDr='incCDr', incMAMr='incMAMr', incSkill='incSkill',
  incAllskill='incAllskill', RecoveryHP='RecoveryHP', RecoveryMP='RecoveryMP',
  RecoveryUP='RecoveryUP', mpconReduce='mpconReduce', mpRestore='mpRestore',
  ignoreTargetDEF='ignoreTargetDEF', ignoreDAM='ignoreDAM', ignoreDAMr='ignoreDAMr',
  incDAMr='incDAMr', DAMreflect='DAMreflect', attackType='attackType',
  incMesoProp='incMesoProp', incRewardProp='incRewardProp',
  level='level', boss='boss', face='face',
}

const IGNORED = new Set([ItemOptionStat.face]);
const nameMap = new Map<string, ItemOptionStat>();
for (const v of Object.values(ItemOptionStat)) nameMap.set(v, v as ItemOptionStat);

export function itemOptionStatIsIgnored(name: string): boolean { return IGNORED.has(name as ItemOptionStat); }
export function itemOptionStatFromName(name: string): ItemOptionStat | null { return nameMap.get(name) ?? null; }
