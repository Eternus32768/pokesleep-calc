export type Category = "curry" | "salad" | "dessert";

/** 集計方式。sum = 作る回数ぶん積み上げる / max = 食材ごとに最大値を取る（備蓄向け） */
export type Mode = "sum" | "max";

export interface Ingredient {
  name: string;
  /** 食材1個あたりの基礎エナジー */
  energy: number;
}

export interface Recipe {
  /** 料理名。一意であり、選択状態の保存キーとしても使う */
  name: string;
  category: Category;
  /** レシピレベル1の基礎エナジー */
  energy: number;
  /** 食材名 -> 必要個数。なべ容量はこの合計から導出するので保持しない */
  ingredients: Record<string, number>;
}

export interface RecipeData {
  /** データの基準日（YYYY-MM-DD）。フッターに表示して鮮度を可視化する */
  updated: string;
  note: string;
  ingredients: Ingredient[];
  recipes: Recipe[];
}

/** 料理名 -> 作る回数 */
export type Selection = Record<string, number>;

/** 食材名 -> 所持数 */
export type Stock = Record<string, number>;

export interface NeedRow {
  ingredient: string;
  need: number;
  have: number;
  /** 不足数。足りていれば 0 */
  lack: number;
}

export interface CalcResult {
  rows: NeedRow[];
  /** 食材の総数 */
  totalItems: number;
  /** 不足の総数 */
  totalLack: number;
  /** 料理の総食数 */
  totalDishes: number;
  /** 基礎エナジー合計。max モードでは意味を持たないため null */
  totalEnergy: number | null;
}
