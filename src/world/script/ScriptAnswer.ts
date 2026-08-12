/** Port of kinoko's ScriptAnswer. */
export class ScriptAnswer {
  private constructor(
    public readonly action: number,
    public readonly answer: number,
    public readonly textAnswer: string | null,
  ) {}

  static withAction(action: number): ScriptAnswer {
    return new ScriptAnswer(action, -1, null);
  }

  static withAnswer(action: number, answer: number): ScriptAnswer {
    return new ScriptAnswer(action, answer, null);
  }

  static withTextAnswer(action: number, answer: string): ScriptAnswer {
    return new ScriptAnswer(action, -1, answer);
  }
}
