import * as fs from 'fs';
import * as path from 'path';
import { NXNode } from './NXNode';
import { NXReader } from './NXReader';

// Server-side NX manager — reads .nx files from disk (synchronous at startup).
// WZ files referenced as "Character.wz/..." are resolved to "Character.nx".
// NX dir defaults to server/wz/ but can be set via NX_DIR env var.

let nxDir = process.env.NX_DIR ?? path.join(process.cwd(), 'wz');

const fileCache = new Map<string, NXNode>();

function nxName(wzPath: string): string {
  return wzPath.split('/')[0].replace(/\.wz$/i, '').replace(/\.nx$/i, '');
}

function loadFile(name: string): NXNode {
  if (fileCache.has(name)) return fileCache.get(name)!;
  const filePath = path.join(nxDir, `${name}.nx`);
  if (!fs.existsSync(filePath)) throw new Error(`NX file not found: ${filePath}`);
  const buf = fs.readFileSync(filePath);
  const root = new NXReader(buf).parse();
  fileCache.set(name, root);
  return root;
}

function navigate(root: NXNode, parts: string[]): NXNode | undefined {
  let node: any = root;
  for (const part of parts) {
    if (node == null) return undefined;
    node = node[part] ?? node[part.replace(/\.img$/i, '')];
  }
  return node;
}

const NXManager = {
  setNxDir(dir: string): void {
    nxDir = dir;
    fileCache.clear();
  },

  preload(name: string): void {
    loadFile(name);
  },

  get(wzPath: string): NXNode | undefined {
    const parts = wzPath.split('/');
    const name  = nxName(parts[0]);
    const root  = loadFile(name);
    if (parts.length === 1) return root;
    return navigate(root, parts.slice(1));
  },

  getOrThrow(wzPath: string): NXNode {
    const node = NXManager.get(wzPath);
    if (!node) throw new Error(`NX path not found: ${wzPath}`);
    return node;
  },

  pathExists(wzPath: string): boolean {
    try {
      return NXManager.get(wzPath) !== undefined;
    } catch {
      return false;
    }
  },

  clear(): void {
    fileCache.clear();
  },
};

export default NXManager;
