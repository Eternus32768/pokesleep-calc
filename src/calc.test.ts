import { describe, expect, it } from "vitest";
import { calcNeeds, calculate, indexRecipes, potCapacity } from "./calc";
import type { Recipe } from "../types";

const recipeA: Recipe = {
  name: "A", category: "curry", energy: 100,
  ingredients: { きのこ: 2, ポテト: 3 },
};
const recipeB: Recipe = {
  name: "B", category: "curry", energy: 200,
  ingredients: { きのこ: 5 },
};
const recipes = indexRecipes([recipeA, recipeB]);

describe("potCapacity", () => {
  it("食材の合計を返す", () => {
    expect(potCapacity(recipeA)).toBe(5);
  });
});

describe("calcNeeds", () => {
  it("sum は回数ぶん積み上げる", () => {
    const needs = calcNeeds(recipes, { A: 1, B: 1 }, "sum");
    expect(needs.get("きのこ")).toBe(7);
  });

  it("sum は回数を掛ける", () => {
    const needs = calcNeeds(recipes, { A: 3 }, "sum");
    expect(needs.get("ポテト")).toBe(9);
  });

  it("max は最も多く使う料理の数を採る", () => {
    const needs = calcNeeds(recipes, { A: 1, B: 1 }, "max");
    expect(needs.get("きのこ")).toBe(5);
  });

  it("max は食数を最後に掛ける", () => {
    const needs = calcNeeds(recipes, { A: 1, B: 1 }, "max", 3);
    expect(needs.get("きのこ")).toBe(15);
  });

  it("回数0の料理は無視する", () => {
    const needs = calcNeeds(recipes, { A: 0, B: 1 }, "sum");
    expect(needs.has("ポテト")).toBe(false);
  });

  it("存在しない料理名は無視する", () => {
    expect(() => calcNeeds(recipes, { 存在しない: 1 }, "sum")).not.toThrow();
  });
});

describe("calculate", () => {
  it("所持数を引いて不足を出す", () => {
    const { rows } = calculate(recipes, { B: 1 }, { きのこ: 2 }, "sum");
    expect(rows[0]).toEqual({ ingredient: "きのこ", need: 5, have: 2, lack: 3 });
  });

  it("足りていれば不足は0", () => {
    const { totalLack } = calculate(recipes, { B: 1 }, { きのこ: 99 }, "sum");
    expect(totalLack).toBe(0);
  });

  it("不足の多い順に並ぶ", () => {
    const { rows } = calculate(recipes, { A: 1, B: 1 }, {}, "sum");
    expect(rows.map((r) => r.ingredient)).toEqual(["きのこ", "ポテト"]);
  });

  it("max モードではエナジー合計を出さない", () => {
    const { totalEnergy } = calculate(recipes, { A: 1 }, {}, "max");
    expect(totalEnergy).toBeNull();
  });
});
