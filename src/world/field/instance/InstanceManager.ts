import { MapProvider } from '../../../provider/MapProvider';
import { MapInfo } from '../../../provider/map/MapInfo';
import { Instance } from './Instance';
import { InstanceFieldStorage } from './InstanceFieldStorage';

const CLEANUP_INTERVAL_MS = 60_000;

/** Port of kinoko's InstanceStorage - per-process registry of temporary field-clone instances. */
export class InstanceManager {
  private static instanceIdCounter = 1;
  private static readonly instances = new Map<number, Instance>();
  private static cleanupHandle: ReturnType<typeof setInterval> | null = null;

  /** Port of InstanceStorage::createInstance. Returns null if any mapId is unresolvable. */
  static createInstance(mapIds: number[], returnMap: number, timeLimit: number): Instance | null {
    const mapInfos: MapInfo[] = [];
    for (const mapId of mapIds) {
      const mapInfo = MapProvider.getMapInfo(mapId);
      if (!mapInfo) return null;
      mapInfos.push(mapInfo);
    }
    const instance = new Instance(this.instanceIdCounter++, returnMap, new Date(Date.now() + timeLimit * 1000));
    instance.fieldStorage = InstanceFieldStorage.from(instance, mapInfos);
    this.instances.set(instance.instanceId, instance);
    this.ensureCleanupTimer();
    return instance;
  }

  /** Port of InstanceStorage::removeInstance. */
  static removeInstance(instance: Instance): boolean {
    if (instance.getUsers().size > 0) return false;
    instance.fieldStorage.clear();
    return this.instances.delete(instance.instanceId);
  }

  static clear(): void {
    for (const instance of this.instances.values()) instance.fieldStorage.clear();
    this.instances.clear();
    if (this.cleanupHandle) { clearInterval(this.cleanupHandle); this.cleanupHandle = null; }
  }

  private static ensureCleanupTimer(): void {
    if (this.cleanupHandle) return;
    this.cleanupHandle = setInterval(() => {
      const now = new Date();
      for (const instance of this.instances.values()) {
        if (now >= instance.expireTime) this.removeInstance(instance);
      }
    }, CLEANUP_INTERVAL_MS);
  }
}
