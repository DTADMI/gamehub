"use client";
import React, { useState } from "react";

const NUTRIENT_TARGETS: Record<string, string> = {
  pasta: "glucose",
  chicken: "protein",
  avocado: "fats",
};

export const FuelMatchingPuzzle: React.FC<{ onSolved: () => void }> = ({ onSolved }) => {
  // Dynamic label resolution requires the i18n hook which is only available
  // in the game shell. For now, we expose this as a drop-in replacement
  // that still uses the imported t() from the game's scope.
  const [selected, setSelected] = useState<string | null>(null);
  const [matched, setMatched] = useState<Record<string, string>>({});

  const foods = ["pasta", "chicken", "avocado"];
  const nutrients = ["glucose", "protein", "fats"];

  const handleFoodClick = (food: string) => {
    if (matched[food]) {return;}
    setSelected(food);
  };

  const handleNutrientClick = (nutrient: string) => {
    if (!selected || matched[selected]) {return;}
    if (NUTRIENT_TARGETS[selected] === nutrient) {
      const next = { ...matched, [selected]: nutrient };
      setMatched(next);
      setSelected(null);
      if (Object.keys(next).length === foods.length) {
        onSolved();
      }
    } else {
      setSelected(null);
    }
  };

  const foodKeys = Object.keys(NUTRIENT_TARGETS);

  return (
    <div className="mb-4 rounded-lg bg-amber-50 p-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <div className="flex flex-col gap-2">
            {foods.map((food) => (
              <button
                key={food}
                className={`min-h-[44px] rounded border-2 px-4 py-2 text-left ${
                  matched[food]
                    ? "border-green-400 bg-green-100"
                    : selected === food
                      ? "border-amber-500 bg-amber-100"
                      : "border-amber-200 bg-white"
                }`}
                onClick={() => handleFoodClick(food)}
                disabled={!!matched[food]}
              >
                {food}
                {matched[food] && (
                  <span className="ml-2 text-green-600">→ {matched[food]}</span>
                )}
              </button>
            ))}
          </div>
        </div>
        <div>
          <div className="flex flex-col gap-2">
            {nutrients.map((nutrient) => (
              <button
                key={nutrient}
                className={`min-h-[44px] rounded border-2 px-4 py-2 text-left ${
                  Object.values(matched).includes(nutrient)
                    ? "border-green-400 bg-green-100"
                    : "border-amber-200 bg-white"
                }`}
                onClick={() => handleNutrientClick(nutrient)}
                disabled={Object.values(matched).includes(nutrient)}
              >
                {nutrient}
              </button>
            ))}
          </div>
        </div>
      </div>
      {Object.keys(matched).length === foodKeys.length && (
        <p className="mt-2 text-center font-bold text-green-600">All nutrients matched!</p>
      )}
    </div>
  );
};