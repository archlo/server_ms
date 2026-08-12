import { NXNode } from '../../wz-utils/NXNode';
import { Rect } from '../../util/Rect';
import { computeCrcField } from '../../util/Crc32';
import { Foothold } from './Foothold';
import { FootholdNode } from './FootholdNode';
import { LadderRope } from './LadderRope';
import { LifeInfo } from './LifeInfo';
import { PortalInfo, UNDEFINED_FIELD_ID } from './PortalInfo';
import { PortalType } from './PortalType';
import { ReactorInfo } from './ReactorInfo';
import { FieldOption, fieldOptionsFromLimit } from './FieldOption';
import { FieldType, fieldTypeFromValue } from './FieldType';

export class MapInfo {
  private readonly footholdRoot: FootholdNode;
  public readonly fieldCrc: number;

  constructor(
    public readonly mapId: number,
    public readonly town: boolean,
    public readonly swim: boolean,
    public readonly fly: boolean,
    public readonly shop: boolean,
    public readonly clock: boolean,
    public readonly phase: number,
    public readonly returnMap: number,
    public readonly forcedReturn: number,
    public readonly fieldOptions: Set<FieldOption>,
    public readonly fieldType: FieldType,
    public readonly mobRate: number,
    public readonly onFirstUserEnter: string,
    public readonly onUserEnter: string,
    public readonly allowedItems: number[],
    public readonly areas: Rect[],
    public readonly footholds: Foothold[],
    public readonly ladderRopes: LadderRope[],
    public readonly lifeInfos: LifeInfo[],
    public readonly portalInfos: PortalInfo[],
    public readonly reactorInfos: ReactorInfo[],
    constantCrc: number,
  ) {
    this.footholdRoot = new FootholdNode();
    for (const fh of footholds) this.footholdRoot.insert(fh);
    this.fieldCrc = computeCrcField(constantCrc, mapId, footholds, ladderRopes, portalInfos, town, swim, fly, shop, phase);
  }

  hasFieldOption(opt: FieldOption): boolean { return this.fieldOptions.has(opt); }
  hasOnFirstUserEnter(): boolean { return this.onFirstUserEnter.length > 0; }
  hasOnUserEnter(): boolean { return this.onUserEnter.length > 0; }

  getPortalById(id: number): PortalInfo | undefined {
    return this.portalInfos.find(p => p.portalId === id);
  }

  getPortalByName(name: string): PortalInfo | undefined {
    return this.portalInfos.find(p => p.portalName === name);
  }

  getTownPortalPoints(): PortalInfo[] {
    return this.portalInfos.filter(p => p.portalType === PortalType.TOWNPORTAL_POINT);
  }

  getStartPoints(): PortalInfo[] {
    return this.portalInfos.filter(p => p.portalType === PortalType.STARTPOINT);
  }

  getRandomStartPoint(): PortalInfo | undefined {
    const startPoints = this.getStartPoints();
    if (startPoints.length === 0) return undefined;
    return startPoints[Math.floor(Math.random() * startPoints.length)];
  }

  getFootholdBelow(x: number, y: number): Foothold | undefined {
    let best: Foothold | undefined;
    this.footholdRoot.searchDown(fh => {
      if (fh.isWall()) return;
      if (x < fh.x1 || x > fh.x2) return;
      const my = fh.getYFromX(x);
      if (my < y) return;
      if (!best || fh.getYFromX(x) < best.getYFromX(x)) best = fh;
    }, x, y);
    return best;
  }

  static from(
    mapId: number,
    infoProp: NXNode,
    areas: Rect[],
    footholds: Foothold[],
    ladderRopes: LadderRope[],
    lifeInfos: LifeInfo[],
    portalInfos: PortalInfo[],
    reactorInfos: ReactorInfo[],
    clock: boolean,
    constantCrc: number,
  ): MapInfo {
    const allowedItems: number[] = [];
    const allowedItemNode = infoProp.nGet('allowedItem') as NXNode | undefined;
    if (allowedItemNode) {
      for (const child of allowedItemNode.nChildren) {
        if (child.nValue !== null) allowedItems.push(child.nValue as number);
      }
    }
    return new MapInfo(
      mapId,
      (infoProp.nGet('town',        0) as number) !== 0,
      (infoProp.nGet('swim',        0) as number) !== 0,
      (infoProp.nGet('fly',         0) as number) !== 0,
      (infoProp.nGet('personalShop',0) as number) !== 0,
      clock,
      infoProp.nGet('phase',       0) as number,
      infoProp.nGet('returnMap',   UNDEFINED_FIELD_ID) as number,
      infoProp.nGet('forcedReturn',UNDEFINED_FIELD_ID) as number,
      fieldOptionsFromLimit(infoProp.nGet('fieldLimit', 0) as number),
      fieldTypeFromValue(infoProp.nGet('fieldType', 0) as number),
      infoProp.nGet('mobRate', 1.0) as number,
      infoProp.nGet('onFirstUserEnter', '') as string,
      infoProp.nGet('onUserEnter', '') as string,
      allowedItems,
      areas, footholds, ladderRopes, lifeInfos, portalInfos, reactorInfos,
      constantCrc,
    );
  }
}
