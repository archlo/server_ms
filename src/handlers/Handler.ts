const handlerRegistry = new Map<number, any>();

export function Handler(opcode: number): ClassDecorator {
  return (target: any) => {
    handlerRegistry.set(opcode, target);
  };
}

export function getHandler(opcode: number): any {
  return handlerRegistry.get(opcode);
}
