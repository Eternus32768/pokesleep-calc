import type { CalcResult, Mode, NeedRow, Recipe, Selection, Stock } from "../types";

/** なべ容量。データに持たせず必ずここから導出する */
export function potCapacity(recipe: Recipe): number {
  return Object.values(recipe.ingredients).reduce((a, b) => a + b, 0);
}

/**
 * 必要な食材数を求める。
 *
 * sum: 各料理の必要数 × 作る回数 を、食材ごとに足し合わせる。
 *      「この料理をこれだけ作る」と決まっているとき用。
 *
 * max: 選んだ料理のうち、その食材を最も多く使う料理の数を採る。さらに servings 倍する。
 *      「翌週どれが来ても足りるように備えたい」とき用。回数は料理ごとではなく全体で指定する。
 */
export function calcNeeds(
  recipes: Map<string, Recipe>,
  selection: Selection,
  mode: Mode,
  servings = 1,
): Map<string, number> {
  const needs = new Map<string, number>();

  for (const [name, count] of Object.entries(selection)) {
    if (count <= 0) continue;
    const recipe = recipes.get(name);
    if (!recipe) continue;

    for (const [ingredient, qty] of Object.entries(recipe.ingredients)) {
      const current = needs.get(ingredient) ?? 0;
      needs.set(
        ingredient,
        mode === "max" ? Math.max(current, qty) : current + qty * count,
      );
    }
  }

  if (mode === "max") {
    for (const [ingredient, qty] of needs) {
      needs.set(ingredient, qty * servings);
    }
  }

  return needs;
}

/** 必要数と所持数を突き合わせ、表示用の行と集計値にまとめる */
export function calculate(
  recipes: Map<string, Recipe>,
  selection: Selection,
  stock: Stock,
  mode: Mode,
  servings = 1,
): CalcResult {
  const needs = calcNeeds(recipes, selection, mode, servings);

  const rows: NeedRow[] = [...needs.entries()]
    .map(([ingredient, need]) => {
      const have = stock[ingredient] ?? 0;
      return { ingredient, need, have, lack: Math.max(0, need - have) };
    })
    .sort((a, b) => b.lack - a.lack || b.need - a.need);

  let totalDishes = 0;
  let totalEnergy = 0;
  for (const [name, count] of Object.entries(selection)) {
    if (count <= 0) continue;
    const recipe = recipes.get(name);
    if (!recipe) continue;
    totalDishes += count;
    totalEnergy += recipe.energy * count;
  }

  return {
    rows,
    totalItems: rows.reduce((a, r) => a + r.need, 0),
    totalLack: rows.reduce((a, r) => a + r.lack, 0),
    totalDishes: mode === "max" ? servings : totalDishes,
    totalEnergy: mode === "max" ? null : totalEnergy,
  };
}

/** 名前引きの Map を作る。呼び出しごとに作らず、読み込み時に一度だけ */
export function indexRecipes(recipes: Recipe[]): Map<string, Recipe> {
  return new Map(recipes.map((r) => [r.name, r]));
}
