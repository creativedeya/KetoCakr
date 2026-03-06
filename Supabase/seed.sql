-- Insert dessert types
INSERT INTO dessert_types (slug, name_en, name_bg, icon, assembly_instructions_en, assembly_instructions_bg) VALUES
('cake', 'Cake', 'Торта', '🎂', 
  E'1. Place the crust layer on a serving plate\n2. Spread the cream evenly\n3. Add the filling layer\n4. Top with decoration\n5. Refrigerate for 2 hours before serving',
  E'1. Поставете блата на чиния\n2. Разпределете крема равномерно\n3. Добавете плънката\n4. Декорирайте отгоре\n5. Охладете 2 часа преди сервиране'),
('cheesecake', 'Cheesecake', 'Чийзкейк', '🍰',
  E'1. Press crust into the bottom of a springform pan\n2. Pour cream mixture over crust\n3. Bake as directed\n4. Cool completely\n5. Add filling and decoration\n6. Chill overnight',
  E'1. Натиснете блата в дъното на форма\n2. Прибавете кремовата смес\n3. Печете според указанията\n4. Охладете напълно\n5. Добавете плънка и декор\n6. Охладете през нощта'),
('tart', 'Tart', 'Тарт', '🥧',
  E'1. Press crust into tart pan\n2. Bake crust until golden\n3. Fill with cream mixture\n4. Add filling\n5. Top with decoration\n6. Chill before serving',
  E'1. Натиснете блата в тарт форма\n2. Печете докато стане златист\n3. Напълнете с кремова смес\n4. Добавете плънка\n5. Декорирайте\n6. Охладете преди сервиране'),
('muffin', 'Muffins', 'Мъфини', '🧁',
  E'1. Divide crust batter into muffin cups\n2. Bake until set\n3. Cool completely\n4. Pipe cream on top\n5. Add filling\n6. Finish with decoration',
  E'1. Разпределете тестото в форми за мъфини\n2. Печете докато втвърдят\n3. Охладете напълно\n4. Поставете крем отгоре\n5. Добавете плънка\n6. Декорирайте'),
('roll', 'Roll', 'Руло', '🌯',
  E'1. Spread crust batter on baking sheet\n2. Bake thin layer\n3. Spread cream while warm\n4. Add filling\n5. Roll tightly\n6. Add decoration\n7. Chill before slicing',
  E'1. Разстелете тестото на тава\n2. Изпечете тънък пласт\n3. Намажете с крем докато е топъл\n4. Добавете плънка\n5. Увийте здраво\n6. Декорирайте\n7. Охладете преди рязане');

-- Sample Base Recipes
INSERT INTO base_recipes (category, name_en, name_bg, description_en, description_bg, ingredients, steps, prep_time_minutes, difficulty, nutrition, suitable_for_dessert_types) VALUES
('crust', 'Almond Flour Crust', 'Блат от бадемово брашно', 
  'Classic keto-friendly almond flour base', 'Класическа кето основа от бадемово брашно',
  '[
    {"name": "Almond flour", "amount": 200, "unit": "g"},
    {"name": "Butter, melted", "amount": 80, "unit": "g"},
    {"name": "Erythritol", "amount": 40, "unit": "g"},
    {"name": "Egg", "amount": 1, "unit": "pcs"},
    {"name": "Vanilla extract", "amount": 1, "unit": "tsp"}
  ]',
  '[
    "Preheat oven to 180°C (350°F)",
    "Mix all dry ingredients in a bowl",
    "Add melted butter and egg, mix until combined",
    "Press into 18cm springform pan",
    "Bake for 12-15 minutes until golden",
    "Cool completely before using"
  ]',
  25, 'easy',
  '{
    "calories": 1650,
    "protein": 48,
    "fat": 145,
    "carbs": 35,
    "fiber": 20,
    "servings": 8
  }',
  ARRAY['cake', 'cheesecake', 'tart']
),
('cream', 'Mascarpone Cream', 'Маскарпоне крем',
  'Rich and creamy mascarpone filling', 'Богат и кремообразен маскарпоне пълнеж',
  '[
    {"name": "Mascarpone cheese", "amount": 500, "unit": "g"},
    {"name": "Heavy cream", "amount": 200, "unit": "ml"},
    {"name": "Powdered erythritol", "amount": 80, "unit": "g"},
    {"name": "Vanilla extract", "amount": 2, "unit": "tsp"},
    {"name": "Lemon zest", "amount": 1, "unit": "tsp"}
  ]',
  '[
    "Beat heavy cream until soft peaks form",
    "In another bowl, mix mascarpone with erythritol until smooth",
    "Add vanilla and lemon zest to mascarpone",
    "Gently fold whipped cream into mascarpone mixture",
    "Refrigerate for 30 minutes before using"
  ]',
  15, 'easy',
  '{
    "calories": 2400,
    "protein": 35,
    "fat": 230,
    "carbs": 25,
    "fiber": 0,
    "servings": 8
  }',
  ARRAY['cake', 'cheesecake', 'tart', 'muffin', 'roll']
),
('filling', 'Berry Compote', 'Компот от горски плодове',
  'Sugar-free berry filling', 'Пълнеж от горски плодове без захар',
  '[
    {"name": "Mixed berries", "amount": 300, "unit": "g"},
    {"name": "Erythritol", "amount": 50, "unit": "g"},
    {"name": "Lemon juice", "amount": 2, "unit": "tbsp"},
    {"name": "Chia seeds", "amount": 1, "unit": "tbsp"},
    {"name": "Water", "amount": 50, "unit": "ml"}
  ]',
  '[
    "Combine berries, erythritol, and water in a saucepan",
    "Cook over medium heat for 10 minutes, stirring occasionally",
    "Add lemon juice and chia seeds",
    "Simmer for 5 more minutes until thickened",
    "Cool completely before using"
  ]',
  20, 'easy',
  '{
    "calories": 180,
    "protein": 4,
    "fat": 2,
    "carbs": 45,
    "fiber": 15,
    "servings": 8
  }',
  ARRAY['cake', 'cheesecake', 'tart', 'muffin', 'roll']
),
('decoration', 'Whipped Cream Topping', 'Бита сметана',
  'Light and fluffy whipped cream', 'Лека и пухкава бита сметана',
  '[
    {"name": "Heavy whipping cream", "amount": 300, "unit": "ml"},
    {"name": "Powdered erythritol", "amount": 30, "unit": "g"},
    {"name": "Vanilla extract", "amount": 1, "unit": "tsp"}
  ]',
  '[
    "Chill mixing bowl and beaters in freezer for 10 minutes",
    "Pour cold cream into chilled bowl",
    "Beat on medium speed until soft peaks form",
    "Add erythritol and vanilla",
    "Continue beating until stiff peaks form",
    "Use immediately or refrigerate"
  ]',
  10, 'easy',
  '{
    "calories": 900,
    "protein": 6,
    "fat": 96,
    "carbs": 9,
    "fiber": 0,
    "servings": 8
  }',
  ARRAY['cake', 'cheesecake', 'tart', 'muffin', 'roll']
);