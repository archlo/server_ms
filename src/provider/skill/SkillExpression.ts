// Evaluates kinoko-style skill expressions like "x*2+3", "u(x/4)", "d(x*1.5)"
// u() = ceil, d() = floor — kinoko's exp4j custom functions
export class SkillExpression {
  private readonly expr: string;

  constructor(expr: string) {
    this.expr = expr;
  }

  evaluate(x: number): number {
    // Replace u(...) with Math.ceil and d(...) with Math.floor
    let s = this.expr
      .replace(/\bu\s*\(/g, 'Math.ceil(')
      .replace(/\bd\s*\(/g, 'Math.floor(');
    // Replace bare 'x' with the value
    s = s.replace(/\bx\b/g, String(x));
    try {
      // eslint-disable-next-line no-new-func
      return Number(Function(`"use strict"; return (${s});`)());
    } catch {
      return 0;
    }
  }

  static from(expr: string): SkillExpression {
    return new SkillExpression(expr);
  }
}
