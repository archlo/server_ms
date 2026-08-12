import { SkillProvider } from '../../../provider/SkillProvider';
import { SkillStat } from '../../../provider/skill/SkillStat';
import { SkillManager } from '../../skill/SkillManager';
import { BasicStat } from './BasicStat';
import { SecondaryStat } from './SecondaryStat';

// Mechanic constants (avoid circular import from Mechanic.ts)
const MECH_PERFECT_ARMOR = 35101007;
const MECH_SIEGE_MODE = 35111004;
const MECH_SIEGE_MODE_2 = 35121013;
const MECHANIC_VEHICLE_ID = 35100000;

class AdditionPsd {
  cr = 0;
  cdMin = 0;
  ar = 0;
  dipR = 0;
  pdamR = 0;
  mdamR = 0;
  impR = 0;
}

export class PassiveSkillData {
  private readonly additionPsd = new Map<number, AdditionPsd>();
  private mhpR = 0;
  private mmpR = 0;
  private cr = 0;
  private cdMin = 0;
  private accR = 0;
  private evaR = 0;
  private ar = 0;
  private er = 0;
  private pddR = 0;
  private mddR = 0;
  private pdR = 0;
  private mdR = 0;
  private dipR = 0;
  private pdamR = 0;
  private mdamR = 0;
  private padR = 0;
  private madR = 0;
  private expR = 0;
  private impR = 0;
  private asrR = 0;
  private terR = 0;
  private mesoR = 0;
  private padX = 0;
  private madX = 0;
  private imdR = 0;
  private psdJump = 0;
  private psdSpeed = 0;
  private ocR = 0;
  private dcR = 0;

  getMhpR(): number { return this.mhpR; }
  getMmpR(): number { return this.mmpR; }
  getCr(): number { return this.cr; }
  getCdMin(): number { return this.cdMin; }
  getAccR(): number { return this.accR; }
  getEvaR(): number { return this.evaR; }
  getAr(): number { return this.ar; }
  getEr(): number { return this.er; }
  getPddR(): number { return this.pddR; }
  getMddR(): number { return this.mddR; }
  getPdR(): number { return this.pdR; }
  getMdR(): number { return this.mdR; }
  getDipR(): number { return this.dipR; }
  getPdamR(): number { return this.pdamR; }
  getMdamR(): number { return this.mdamR; }
  getPadR(): number { return this.padR; }
  getMadR(): number { return this.madR; }
  getExpR(): number { return this.expR; }
  getImpR(): number { return this.impR; }
  getAsrR(): number { return this.asrR; }
  getTerR(): number { return this.terR; }
  getMesoR(): number { return this.mesoR; }
  getPadX(): number { return this.padX; }
  getMadX(): number { return this.madX; }
  getImdR(): number { return this.imdR; }
  getPsdJump(): number { return this.psdJump; }
  getPsdSpeed(): number { return this.psdSpeed; }
  getOcR(): number { return this.ocR; }
  getDcR(): number { return this.dcR; }

  getAdditionCr(skillId: number): number {
    const apsd = this.additionPsd.get(skillId);
    return apsd ? apsd.cr : 0;
  }

  setFrom(bs: BasicStat, ss: SecondaryStat, sm: SkillManager): void {
    this.clearData();

    for (const skillRecord of sm.getSkillRecords()) {
      const si = SkillProvider.getSkillInfoById(skillRecord.skillId);
      if (!si) continue;
      if (si.psd && (si.skillId !== MECH_PERFECT_ARMOR || ss.getRidingVehicle() === MECHANIC_VEHICLE_ID)) {
        if (si.skillId === MECH_SIEGE_MODE_2) {
          this.addPassiveSkillData(si, SkillManager.getSkillLevel(ss, sm, MECH_SIEGE_MODE));
        } else if (skillRecord.skillLevel > 0) {
          this.addPassiveSkillData(si, skillRecord.skillLevel);
        }
      }
    }

    // Special handling for Mech: Siege Mode
    if (bs.getJob() >= 3500 && bs.getJob() < 3600) {
      if (SkillManager.getSkillLevel(ss, sm, MECH_SIEGE_MODE) > 0) {
        const skillInfo = SkillProvider.getSkillInfoById(MECH_SIEGE_MODE_2);
        if (skillInfo) {
          this.addPassiveSkillData(skillInfo, SkillManager.getSkillLevel(ss, sm, MECH_SIEGE_MODE));
        }
      }
    }

    // DiceInfo bonus (port of kinoko PassiveSkillData.setFrom dice section).
    // Each index of the 22-int aDiceInfo maps to a specific psd stat bonus.
    const diceInfo = ss.getDiceInfo().getInfoArray();
    this.mhpR += diceInfo[0];
    this.mmpR += diceInfo[1];
    this.cr += diceInfo[2];
    this.cdMin += diceInfo[3]; // index 4 not used
    this.evaR += diceInfo[5];
    this.ar += diceInfo[6];
    this.er += diceInfo[7];
    this.pddR += diceInfo[8];
    this.mddR += diceInfo[9];
    this.pdR += diceInfo[10];
    this.mdR += diceInfo[11];
    this.dipR += diceInfo[12];
    this.pdamR += diceInfo[13];
    this.mdamR += diceInfo[14];
    this.padR += diceInfo[15];
    this.madR += diceInfo[16];
    this.expR += diceInfo[17];
    this.impR += diceInfo[18];
    this.asrR += diceInfo[19];
    this.terR += diceInfo[20];
    this.mesoR += diceInfo[21];

    this.revisePassiveSkillData();
  }

  private addPassiveSkillData(si: { psdSkills: number[]; getValue: (stat: SkillStat, slv: number) => number }, slv: number): void {
    if (slv <= 0) return;

    this.mhpR += si.getValue(SkillStat.mhpR, slv);
    this.mmpR += si.getValue(SkillStat.mmpR, slv);
    if (si.psdSkills.length === 0) {
      this.cr += si.getValue(SkillStat.cr, slv);
      this.cdMin += si.getValue(SkillStat.criticaldamageMin, slv);
    }
    this.accR += si.getValue(SkillStat.accR, slv);
    this.evaR += si.getValue(SkillStat.evaR, slv);
    if (si.psdSkills.length === 0) {
      this.ar += si.getValue(SkillStat.ar, slv);
    }
    this.er += si.getValue(SkillStat.er, slv);
    this.pddR += si.getValue(SkillStat.pddR, slv);
    this.mddR += si.getValue(SkillStat.mddR, slv);
    this.pdR += si.getValue(SkillStat.pdr, slv);
    this.mdR += si.getValue(SkillStat.mdr, slv);
    if (si.psdSkills.length === 0) {
      this.dipR += si.getValue(SkillStat.damR, slv);
      this.pdamR += si.getValue(SkillStat.pdr, slv);
      this.mdamR += si.getValue(SkillStat.mdr, slv);
    }
    this.padR += si.getValue(SkillStat.padR, slv);
    this.madR += si.getValue(SkillStat.madR, slv);
    this.expR += si.getValue(SkillStat.expR, slv);
    this.impR += si.getValue(SkillStat.ignoreMobpdpR, slv);
    this.asrR += si.getValue(SkillStat.asrR, slv);
    this.terR += si.getValue(SkillStat.terR, slv);
    this.mesoR += si.getValue(SkillStat.mesoR, slv);
    this.padX += si.getValue(SkillStat.padX, slv);
    this.madX += si.getValue(SkillStat.madX, slv);
    this.imdR += si.getValue(SkillStat.ignoreMobDamR, slv);
    this.psdJump += si.getValue(SkillStat.psdJump, slv);
    this.psdSpeed += si.getValue(SkillStat.psdSpeed, slv);
    this.ocR += si.getValue(SkillStat.overChargeR, slv);
    this.dcR += si.getValue(SkillStat.disCountR, slv);

    for (const skillId of si.psdSkills) {
      const apsd = new AdditionPsd();
      apsd.cr += si.getValue(SkillStat.cr, slv);
      apsd.cdMin += si.getValue(SkillStat.criticaldamageMin, slv);
      apsd.ar += si.getValue(SkillStat.ar, slv);
      apsd.dipR += si.getValue(SkillStat.damR, slv);
      apsd.pdamR += si.getValue(SkillStat.pdr, slv);
      apsd.mdamR += si.getValue(SkillStat.mdr, slv);
      apsd.impR += si.getValue(SkillStat.ignoreMobpdpR, slv);
      this.additionPsd.set(skillId, apsd);
    }
  }

  private revisePassiveSkillData(): void {
    if (this.mesoR > 0) {
      this.mesoR = Math.max(this.mesoR, 100);
    } else {
      this.mesoR = 0;
    }
    if (this.ocR > 0) {
      this.ocR = Math.max(this.ocR, 50);
    } else {
      this.ocR = 0;
    }
    if (this.dcR > 0) {
      this.dcR = Math.max(this.dcR, 50);
    } else {
      this.dcR = 0;
    }
  }

  private clearData(): void {
    this.mhpR = 0;
    this.mmpR = 0;
    this.cr = 0;
    this.cdMin = 0;
    this.accR = 0;
    this.evaR = 0;
    this.ar = 0;
    this.er = 0;
    this.pddR = 0;
    this.mddR = 0;
    this.pdR = 0;
    this.mdR = 0;
    this.dipR = 0;
    this.pdamR = 0;
    this.mdamR = 0;
    this.padR = 0;
    this.madR = 0;
    this.expR = 0;
    this.impR = 0;
    this.asrR = 0;
    this.terR = 0;
    this.mesoR = 0;
    this.padX = 0;
    this.madX = 0;
    this.imdR = 0;
    this.psdJump = 0;
    this.psdSpeed = 0;
    this.ocR = 0;
    this.dcR = 0;
    this.additionPsd.clear();
  }
}
