import { NXNode } from '../../wz-utils/NXNode';
import { PortalType, portalTypeFromValue } from './PortalType';

export const UNDEFINED_FIELD_ID = 999999999;

export class PortalInfo {
  static readonly EMPTY = new PortalInfo(
    PortalType.STARTPOINT, 0, '', UNDEFINED_FIELD_ID, '', 0, 0, 0, 100, 100, 0, 0, false, '', '',
  );

  constructor(
    public readonly portalType: PortalType,
    public readonly portalId: number,
    public readonly portalName: string,
    public readonly destinationFieldId: number,
    public readonly destinationPortalName: string,
    public readonly x: number,
    public readonly y: number,
    public readonly delay: number,
    public readonly hRange: number,
    public readonly vRange: number,
    public readonly hImpact: number,
    public readonly vImpact: number,
    public readonly onlyOnce: boolean,
    public readonly script: string,
    public readonly reactor: string,
  ) {}

  hasDestinationField(): boolean {
    return this.destinationFieldId !== UNDEFINED_FIELD_ID;
  }

  static from(portalType: PortalType, portalId: number, n: NXNode): PortalInfo {
    return new PortalInfo(
      portalType, portalId,
      n.nGet('pn', '') as string,
      n.nGet('tm', UNDEFINED_FIELD_ID) as number,
      n.nGet('tn', '') as string,
      n.nGet('x', 0), n.nGet('y', 0),
      n.nGet('delay', 0),
      n.nGet('hRange', 100), n.nGet('vRange', 100),
      n.nGet('horizontalImpact', 0), n.nGet('verticalImpact', 0),
      (n.nGet('onlyOnce', 0) as number) !== 0,
      n.nGet('script', '') as string,
      n.nGet('reactorName', '') as string,
    );
  }
}
