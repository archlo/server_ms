import { RecipeInfo } from './RecipeInfo';

export class MakerProvider {
  private static readonly recipes = new Map<number, RecipeInfo>();

  static getRecipe(recipeItemId: number): RecipeInfo | undefined {
    return this.recipes.get(recipeItemId);
  }

  static registerRecipe(recipe: RecipeInfo): void {
    this.recipes.set(recipe.recipeId, recipe);
  }

  static isRecipeItem(itemId: number): boolean {
    return this.recipes.has(itemId);
  }
}
