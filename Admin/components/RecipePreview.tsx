import type { ParsedRecipe } from '@/app/api/pdf-import/parse/route';

interface RecipePreviewProps {
  recipes: ParsedRecipe[];
  maxDisplay?: number;
}

export function RecipePreview({ recipes, maxDisplay = 3 }: RecipePreviewProps) {
  const displayed = recipes.slice(0, maxDisplay);

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-gray-700">
        Преглед на {displayed.length} от {recipes.length} рецепти
      </h3>

      {displayed.map((recipe) => (
        <div key={recipe.id} className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div>
              <h4 className="font-semibold text-gray-900">{recipe.name}</h4>
              <p className="text-xs text-gray-400">{recipe.name_en}</p>
            </div>
            <span className="text-xs bg-rose-100 text-rose-700 px-2 py-1 rounded-full whitespace-nowrap flex-shrink-0">
              {recipe.servings} порции
            </span>
          </div>

          <div className="flex gap-3 text-xs text-gray-500 mb-2">
            {recipe.bake_time_minutes > 0 && <span>Печене: {recipe.bake_time_minutes} мин</span>}
            <span className="text-gray-400 italic">placeholder съдържание</span>
          </div>

          {recipe.ingredients_text_bg && (
            <p className="text-xs text-gray-400 line-clamp-1">
              {recipe.ingredients_text_bg.split('\n')[0]}
            </p>
          )}
        </div>
      ))}

      {recipes.length > maxDisplay && (
        <p className="text-sm text-gray-400 text-center italic">
          + {recipes.length - maxDisplay} още рецепти...
        </p>
      )}
    </div>
  );
}
