import NXManager from '../wz-utils/NXManager';
import { NXNode } from '../wz-utils/NXNode';
import { Rect } from '../util/Rect';
import { computeCrcConstant } from '../util/Crc32';
import { MapInfo } from './map/MapInfo';
import { Foothold } from './map/Foothold';
import { LadderRope } from './map/LadderRope';
import { LifeInfo } from './map/LifeInfo';
import { PortalInfo } from './map/PortalInfo';
import { PortalType, portalTypeFromValue } from './map/PortalType';
import { ReactorInfo } from './map/ReactorInfo';
import { PhysicsConstants } from './map/PhysicsConstants';
import { lifeTypeFromString } from './map/LifeType';

// kinoko.provider.MapProvider ported 1:1 to TypeScript + NX

const mapInfos  = new Map<number, MapInfo>();
const mapLinks  = new Map<number, number>();
const areaCodes = new Map<number, number>();

let constantCrc = 0;

export const MapProvider = {
  initialize(gameVersion: number): void {
    mapInfos.clear();
    mapLinks.clear();
    areaCodes.clear();

    loadPhysics(gameVersion);
    loadMapInfos();
    loadAreaCodes();
  },

  getMapInfos(): MapInfo[] { return [...mapInfos.values()]; },

  getMapInfo(mapId: number): MapInfo | undefined { return mapInfos.get(mapId); },

  getMapLink(mapId: number): number | undefined { return mapLinks.get(mapId); },

  getConstantCrc(): number { return constantCrc; },

  isConnected(fromId: number, toId: number): boolean {
    if (isEventMap(fromId) || isEventMap(toId)) return false;
    if (Math.floor(fromId / 10000) === 20009 || Math.floor(toId / 10000) === 20009) return false;
    const fromCat = areaCodes.get(fromId);
    if (fromCat === undefined) return false;
    return fromCat === areaCodes.get(toId);
  },
};

function isEventMap(mapId: number): boolean {
  return mapId >= 9000000 && mapId < 9100000;
}

function loadPhysics(gameVersion: number): void {
  const physNode = NXManager.getOrThrow('Map.wz/Physics.img');
  const physics  = PhysicsConstants.from(physNode);
  constantCrc    = computeCrcConstant(physics, gameVersion);
}

function loadMapInfos(): void {
  const mapDir = NXManager.getOrThrow('Map.wz/Map');
  const linked = new Map<number, { link: number; infoProp: NXNode }>();

  for (const subDir of mapDir.nChildren) {
    if (!/^Map[0-9]$/.test(subDir.nName)) continue;
    for (const imgNode of subDir.nChildren) {
      const mapId = parseInt(imgNode.nName.replace(/\.img$/, ''));
      const infoProp = imgNode.nGet('info') as NXNode | undefined;
      if (!infoProp) throw new Error(`MapProvider: no info for map ${mapId}`);

      const linkVal = infoProp.nGet('link');
      if (linkVal !== undefined && linkVal !== null) {
        linked.set(mapId, { link: Number(linkVal), infoProp });
        continue;
      }

      const clock = imgNode.nGet('clock') !== undefined;
      const info  = resolveMapInfo(mapId, imgNode, infoProp, clock);
      mapInfos.set(mapId, info);
    }
  }

  for (const [mapId, { link, infoProp }] of linked) {
    const linkInfo = mapInfos.get(link);
    if (!linkInfo) throw new Error(`MapProvider: linked map ${mapId} -> ${link} not found`);
    mapInfos.set(mapId, MapInfo.from(
      mapId, infoProp,
      linkInfo.areas, linkInfo.footholds, linkInfo.ladderRopes,
      linkInfo.lifeInfos, linkInfo.portalInfos, linkInfo.reactorInfos,
      linkInfo.clock, constantCrc,
    ));
    mapLinks.set(mapId, link);
  }
}

function resolveMapInfo(mapId: number, imgNode: NXNode, infoProp: NXNode, clock: boolean): MapInfo {
  return MapInfo.from(
    mapId, infoProp,
    resolveAreas(imgNode),
    resolveFootholds(imgNode),
    resolveLadderRopes(imgNode),
    resolveLife(imgNode),
    resolvePortals(imgNode),
    resolveReactors(imgNode),
    clock, constantCrc,
  );
}

function resolveAreas(imgNode: NXNode): Rect[] {
  const areaNode = imgNode.nGet('area') as NXNode | undefined;
  if (!areaNode) return [];
  return areaNode.nChildren.map(n =>
    Rect.of(n.nGet('x1', 0), n.nGet('y1', 0), n.nGet('x2', 0), n.nGet('y2', 0))
  );
}

function resolveFootholds(imgNode: NXNode): Foothold[] {
  const fhNode = imgNode.nGet('foothold') as NXNode | undefined;
  if (!fhNode) return [];
  const result: Foothold[] = [];
  for (const layerNode of fhNode.nChildren) {
    const layerId = parseInt(layerNode.nName);
    for (const groupNode of layerNode.nChildren) {
      const groupId = parseInt(groupNode.nName);
      for (const fhEntry of groupNode.nChildren) {
        const sn = parseInt(fhEntry.nName);
        result.push(Foothold.from(layerId, groupId, sn, fhEntry));
      }
    }
  }
  return result;
}

function resolveLadderRopes(imgNode: NXNode): LadderRope[] {
  const lrNode = imgNode.nGet('ladderRope') as NXNode | undefined;
  if (!lrNode) return [];
  return lrNode.nChildren
    .map(n => LadderRope.from(parseInt(n.nName), n))
    .sort((a, b) => a.sn - b.sn);
}

function resolveLife(imgNode: NXNode): LifeInfo[] {
  const lifeNode = imgNode.nGet('life') as NXNode | undefined;
  if (!lifeNode) return [];
  return lifeNode.nChildren.map(n => {
    const typeStr = n.nGet('type', 'm') as string;
    return LifeInfo.from(lifeTypeFromString(typeStr), n);
  });
}

function resolvePortals(imgNode: NXNode): PortalInfo[] {
  const portalNode = imgNode.nGet('portal') as NXNode | undefined;
  if (!portalNode) return [];
  return portalNode.nChildren
    .map(n => {
      const portalId   = parseInt(n.nName);
      const typeVal    = n.nGet('pt', 0) as number;
      const portalType = portalTypeFromValue(typeVal) ?? PortalType.STARTPOINT;
      return PortalInfo.from(portalType, portalId, n);
    })
    .sort((a, b) => a.portalId - b.portalId);
}

function resolveReactors(imgNode: NXNode): ReactorInfo[] {
  const reactorNode = imgNode.nGet('reactor') as NXNode | undefined;
  if (!reactorNode) return [];
  return reactorNode.nChildren.map(n => ReactorInfo.from(n));
}

function loadAreaCodes(): void {
  const areaCodeImg = NXManager.getOrThrow('Map.wz/Map/AreaCode.img');
  for (const child of areaCodeImg.nChildren) {
    const key = parseInt(child.nName);
    if (child.nValue !== null && child.nValue !== undefined) {
      areaCodes.set(key, child.nValue as number);
    }
  }
}
