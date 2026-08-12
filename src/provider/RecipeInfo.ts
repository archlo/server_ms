export class RecipeInfo {
  constructor(
    public readonly recipeId: number,
    public readonly resultItemId: number,
    public readonly resultCount: number,
    public readonly reqLevel: number,
    public readonly reqSkillLevel: number,
    public readonly meso: number,
    public readonly ingredients: Array<{ itemId: number; count: number }>,
    public readonly successRate: number,
    public readonly maxPerSlot: number = 1,
  ) {}
}
