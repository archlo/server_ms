import NXManager from '../wz-utils/NXManager';
import { NXNode } from '../wz-utils/NXNode';
import { ReactorTemplate } from './reactor/ReactorTemplate';

const reactorTemplates = new Map<number, ReactorTemplate>();

export const ReactorProvider = {
  initialize(): void {
    reactorTemplates.clear();
    loadReactorTemplates();
  },

  getReactorTemplate(id: number): ReactorTemplate | undefined { return reactorTemplates.get(id); },
  getAllReactorTemplates(): ReactorTemplate[]                  { return [...reactorTemplates.values()]; },
};

function loadReactorTemplates(): void {
  const root = NXManager.getOrThrow('Reactor.wz');
  const linked = new Map<number, { link: number; notHitable: boolean; activateByTouch: boolean; action: string }>();

  for (const imgNode of root.nChildren) {
    if (!imgNode.nName.endsWith('.img')) continue;
    const id   = parseInt(imgNode.nName.replace('.img', ''));
    const action = imgNode.nGet('action') as string ?? '';
    let notHitable      = false;
    let activateByTouch = false;

    const infoNode = imgNode.nGet('info') as NXNode | undefined;
    if (infoNode) {
      notHitable      = (imgNode.nGet('notHitable',      0) as number) !== 0;
      activateByTouch = (imgNode.nGet('activateByTouch', 0) as number) !== 0;
      const link = infoNode.nGet('link') as number | string | undefined;
      if (link !== undefined) {
        linked.set(id, { link: Number(link), notHitable, activateByTouch, action });
        continue;
      }
    }
    reactorTemplates.set(id, ReactorTemplate.from(id, notHitable, activateByTouch, action, imgNode));
  }

  for (const [id, entry] of linked) {
    const base = reactorTemplates.get(entry.link);
    if (!base) { console.warn(`ReactorProvider: cannot resolve link ${id} -> ${entry.link}`); continue; }
    reactorTemplates.set(id, new ReactorTemplate(id, entry.notHitable, entry.activateByTouch, entry.action, base.states));
  }
}
