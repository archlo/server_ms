export class NXNode {
  [key: string]: any;

  nName: string = '';
  nValue: any = null;
  nTagName: string = 'none';
  nChildren: NXNode[] = [];
  nParent: NXNode | null = null;
  nWidth: number = 0;
  nHeight: number = 0;
  nX: number = 0;
  nY: number = 0;

  _bitmapIndex: number = -1;
  _audioIndex: number = -1;
  _audioLength: number = 0;

  nGet(key: string | number, defaultValue?: any): any {
    const k = String(key);
    const child = (this as any)[k];
    if (!(child instanceof NXNode)) return defaultValue;
    // Scalar property nodes (int/double/string) yield their value;
    // directory/vector/canvas/audio/none nodes yield the node itself.
    const tag = child.nTagName;
    if (tag === 'int' || tag === 'double' || tag === 'string') {
      const v = child.nValue;
      return v !== null && v !== undefined ? v : defaultValue;
    }
    return child;
  }

  nGetChild(cb: (node: NXNode) => boolean): NXNode | null {
    for (const child of this.nChildren) {
      if (cb(child)) return child;
    }
    return null;
  }

  nGetPath(): string {
    let ret = '';
    let p: NXNode | null = this;
    while (p) { ret = `${p.nName}/${ret}`; p = p.nParent; }
    return ret.slice(1, -1);
  }
}
