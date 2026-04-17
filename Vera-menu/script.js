/* =============================================
   ДАННЫЕ: БЛЮДА
   ============================================= */

const dishes = [
  // ─── ЗАВТРАКИ ─────────────────────────────
  {
    id: 'b1',
    category: 'breakfast',
    title: 'Омлет с овощами',
    cookingTime: 15,
    tags: ['обычное', 'полезное', 'быстро'],
    ingredients: [
      { name: 'Яйца', qty: 3, unit: 'шт', priceKey: 'eggs' },
      { name: 'Молоко', qty: 50, unit: 'мл', priceKey: 'milk' },
      { name: 'Помидор', qty: 1, unit: 'шт', priceKey: 'tomato' },
      { name: 'Перец болгарский', qty: 0.5, unit: 'шт', priceKey: 'bellPepper' },
      { name: 'Масло растительное', qty: 10, unit: 'мл', priceKey: 'oil' },
    ],
    recipeSteps: [
      'Разбейте яйца в миску, добавьте молоко и щепотку соли, взбейте вилкой.',
      'Нарежьте помидор и перец небольшими кубиками.',
      'Разогрейте сковороду с маслом на среднем огне.',
      'Обжаривайте овощи 2–3 минуты, пока не станут мягкими.',
      'Залейте яичную смесь поверх овощей.',
      'Накройте крышкой и готовьте 3–4 минуты до готовности.',
    ],
  },
  {
    id: 'b2',
    category: 'breakfast',
    title: 'Овсянка с бананом',
    cookingTime: 10,
    tags: ['обычное', 'полезное', 'экономное', 'быстро'],
    ingredients: [
      { name: 'Овсяные хлопья', qty: 80, unit: 'г', priceKey: 'oats' },
      { name: 'Молоко', qty: 200, unit: 'мл', priceKey: 'milk' },
      { name: 'Банан', qty: 1, unit: 'шт', priceKey: 'banana' },
      { name: 'Мёд', qty: 10, unit: 'г', priceKey: 'honey' },
    ],
    recipeSteps: [
      'Влейте молоко в кастрюлю и доведите до кипения на среднем огне.',
      'Всыпьте овсяные хлопья и варите, помешивая, 4–5 минут.',
      'Снимите с огня, добавьте щепотку соли и мёд, перемешайте.',
      'Нарежьте банан кружочками и выложите поверх каши.',
    ],
  },
  {
    id: 'b3',
    category: 'breakfast',
    title: 'Сырники со сметаной',
    cookingTime: 25,
    tags: ['обычное', 'полезное'],
    ingredients: [
      { name: 'Творог', qty: 300, unit: 'г', priceKey: 'cottage' },
      { name: 'Яйца', qty: 1, unit: 'шт', priceKey: 'eggs' },
      { name: 'Мука пшеничная', qty: 50, unit: 'г', priceKey: 'flour' },
      { name: 'Сахар', qty: 20, unit: 'г', priceKey: 'sugar' },
      { name: 'Сметана', qty: 50, unit: 'г', priceKey: 'sour_cream' },
      { name: 'Масло растительное', qty: 15, unit: 'мл', priceKey: 'oil' },
    ],
    recipeSteps: [
      'Смешайте творог, яйцо, сахар и щепотку соли.',
      'Добавьте муку и вымешайте до однородного теста.',
      'Руками, смоченными в муке, сформируйте небольшие лепёшки толщиной 1.5 см.',
      'Разогрейте масло на сковороде на среднем огне.',
      'Обжаривайте сырники по 3–4 минуты с каждой стороны до золотистой корочки.',
      'Подавайте горячими со сметаной.',
    ],
  },
  {
    id: 'b4',
    category: 'breakfast',
    title: 'Яичница с тостами',
    cookingTime: 10,
    tags: ['обычное', 'экономное', 'быстро'],
    ingredients: [
      { name: 'Яйца', qty: 2, unit: 'шт', priceKey: 'eggs' },
      { name: 'Хлеб белый', qty: 2, unit: 'шт', priceKey: 'bread' },
      { name: 'Масло сливочное', qty: 10, unit: 'г', priceKey: 'butter' },
    ],
    recipeSteps: [
      'Разогрейте сковороду на среднем огне, растопите сливочное масло.',
      'Аккуратно разбейте яйца на сковороду, не ломая желток.',
      'Посолите, накройте крышкой и готовьте 2–3 минуты.',
      'Хлеб поджарьте в тостере или на сухой сковороде до румяной корочки.',
      'Подавайте яичницу с тостами.',
    ],
  },
  {
    id: 'b5',
    category: 'breakfast',
    title: 'Блины с творогом',
    cookingTime: 30,
    tags: ['обычное'],
    ingredients: [
      { name: 'Мука пшеничная', qty: 150, unit: 'г', priceKey: 'flour' },
      { name: 'Молоко', qty: 300, unit: 'мл', priceKey: 'milk' },
      { name: 'Яйца', qty: 2, unit: 'шт', priceKey: 'eggs' },
      { name: 'Сахар', qty: 15, unit: 'г', priceKey: 'sugar' },
      { name: 'Творог', qty: 200, unit: 'г', priceKey: 'cottage' },
      { name: 'Масло растительное', qty: 20, unit: 'мл', priceKey: 'oil' },
    ],
    recipeSteps: [
      'Смешайте муку, яйца, сахар и соль, постепенно влейте молоко, взбейте до однородности.',
      'Дайте тесту постоять 5 минут.',
      'Разогрейте сковороду, смажьте маслом.',
      'Выпекайте тонкие блины на среднем огне — по 1.5 минуты с каждой стороны.',
      'Добавьте в творог щепотку сахара и ванили, перемешайте.',
      'Заверните творог в блины.',
    ],
  },

  // ─── ОБЕДЫ ────────────────────────────────
  {
    id: 'l1',
    category: 'lunch',
    title: 'Курица с гречкой',
    cookingTime: 30,
    tags: ['обычное', 'полезное', 'экономное'],
    ingredients: [
      { name: 'Куриное филе', qty: 300, unit: 'г', priceKey: 'chicken' },
      { name: 'Гречка', qty: 150, unit: 'г', priceKey: 'buckwheat' },
      { name: 'Лук репчатый', qty: 1, unit: 'шт', priceKey: 'onion' },
      { name: 'Морковь', qty: 1, unit: 'шт', priceKey: 'carrot' },
      { name: 'Масло растительное', qty: 15, unit: 'мл', priceKey: 'oil' },
    ],
    recipeSteps: [
      'Промойте гречку и отварите в 300 мл воды на маленьком огне 15 минут, посолите.',
      'Нарежьте лук полукольцами, морковь — кружочками.',
      'Куриное филе нарежьте небольшими кусочками.',
      'Обжаривайте лук на масле 3 минуты, добавьте морковь — ещё 3 минуты.',
      'Добавьте курицу, посолите, поперчите, жарьте 8–10 минут до готовности.',
      'Подавайте курицу с гречкой.',
    ],
  },
  {
    id: 'l2',
    category: 'lunch',
    title: 'Индейка с рисом',
    cookingTime: 35,
    tags: ['обычное', 'полезное'],
    ingredients: [
      { name: 'Филе индейки', qty: 300, unit: 'г', priceKey: 'turkey' },
      { name: 'Рис', qty: 150, unit: 'г', priceKey: 'rice' },
      { name: 'Лук репчатый', qty: 1, unit: 'шт', priceKey: 'onion' },
      { name: 'Чеснок', qty: 2, unit: 'зуб.', priceKey: 'garlic' },
      { name: 'Масло растительное', qty: 15, unit: 'мл', priceKey: 'oil' },
    ],
    recipeSteps: [
      'Промойте рис, залейте 300 мл воды, посолите, варите 18–20 минут под крышкой.',
      'Нарежьте индейку средними кусочками, лук — кубиками, чеснок раздавите.',
      'Разогрейте масло на сковороде, обжарьте лук 3 минуты.',
      'Добавьте индейку и чеснок, посолите, поперчите.',
      'Жарьте 10–12 минут, периодически помешивая, до готовности.',
      'Подавайте с отварным рисом.',
    ],
  },
  {
    id: 'l3',
    category: 'lunch',
    title: 'Картофель с говядиной',
    cookingTime: 45,
    tags: ['обычное', 'экономное'],
    ingredients: [
      { name: 'Говядина', qty: 250, unit: 'г', priceKey: 'beef' },
      { name: 'Картофель', qty: 400, unit: 'г', priceKey: 'potato' },
      { name: 'Лук репчатый', qty: 1, unit: 'шт', priceKey: 'onion' },
      { name: 'Морковь', qty: 1, unit: 'шт', priceKey: 'carrot' },
      { name: 'Масло растительное', qty: 20, unit: 'мл', priceKey: 'oil' },
    ],
    recipeSteps: [
      'Нарежьте говядину кусочками по 3–4 см, посолите и поперчите.',
      'Обжарьте говядину на масле на сильном огне по 2 минуты с каждой стороны.',
      'Добавьте нарезанный лук и морковь, жарьте ещё 5 минут.',
      'Залейте 200 мл горячей воды, накройте крышкой, тушите 20 минут.',
      'Добавьте картофель, нарезанный кубиками, посолите.',
      'Тушите ещё 15 минут до мягкости картофеля.',
    ],
  },
  {
    id: 'l4',
    category: 'lunch',
    title: 'Плов с курицей',
    cookingTime: 45,
    tags: ['обычное'],
    ingredients: [
      { name: 'Куриное филе', qty: 300, unit: 'г', priceKey: 'chicken' },
      { name: 'Рис', qty: 200, unit: 'г', priceKey: 'rice' },
      { name: 'Морковь', qty: 2, unit: 'шт', priceKey: 'carrot' },
      { name: 'Лук репчатый', qty: 1, unit: 'шт', priceKey: 'onion' },
      { name: 'Чеснок', qty: 1, unit: 'головка', priceKey: 'garlic' },
      { name: 'Масло растительное', qty: 40, unit: 'мл', priceKey: 'oil' },
    ],
    recipeSteps: [
      'Нарежьте курицу крупными кусками, морковь — тонкой соломкой, лук — полукольцами.',
      'Разогрейте масло в казане или кастрюле с толстым дном.',
      'Обжарьте лук до золотистого цвета (5 минут), добавьте морковь — ещё 5 минут.',
      'Добавьте курицу, жарьте 8 минут до румяности.',
      'Посолите, добавьте специи (зира, паприка), воткните целую головку чеснока.',
      'Промытый рис выложите ровным слоем, залейте горячей водой на 2 см выше риса.',
      'Варите на сильном огне без крышки до испарения воды, затем накройте и тушите 15 минут.',
    ],
  },
  {
    id: 'l5',
    category: 'lunch',
    title: 'Паста с курицей',
    cookingTime: 25,
    tags: ['обычное', 'быстро'],
    ingredients: [
      { name: 'Паста (макароны)', qty: 200, unit: 'г', priceKey: 'pasta' },
      { name: 'Куриное филе', qty: 250, unit: 'г', priceKey: 'chicken' },
      { name: 'Сметана', qty: 100, unit: 'г', priceKey: 'sour_cream' },
      { name: 'Чеснок', qty: 2, unit: 'зуб.', priceKey: 'garlic' },
      { name: 'Масло растительное', qty: 15, unit: 'мл', priceKey: 'oil' },
    ],
    recipeSteps: [
      'Отварите пасту в подсоленной воде согласно инструкции на упаковке, слейте воду.',
      'Нарежьте куриное филе тонкими полосками.',
      'Раздавите чеснок и обжарьте на масле 1 минуту.',
      'Добавьте курицу, посолите, жарьте 7–8 минут.',
      'Влейте сметану, перемешайте, тушите 3 минуты на маленьком огне.',
      'Добавьте пасту к соусу, хорошо перемешайте и прогрейте 1 минуту.',
    ],
  },

  // ─── УЖИНЫ ────────────────────────────────
  {
    id: 'd1',
    category: 'dinner',
    title: 'Рыба с брокколи',
    cookingTime: 25,
    tags: ['полезное'],
    ingredients: [
      { name: 'Рыбное филе (минтай/хек)', qty: 300, unit: 'г', priceKey: 'fish' },
      { name: 'Брокколи', qty: 300, unit: 'г', priceKey: 'broccoli' },
      { name: 'Лимон', qty: 0.5, unit: 'шт', priceKey: 'lemon' },
      { name: 'Масло оливковое', qty: 15, unit: 'мл', priceKey: 'oil' },
    ],
    recipeSteps: [
      'Разделите брокколи на соцветия, отварите в подсоленной воде 5 минут.',
      'Рыбное филе посолите, поперчите, сбрызните лимонным соком.',
      'Разогрейте масло на сковороде.',
      'Обжаривайте рыбу по 3–4 минуты с каждой стороны до золотистой корочки.',
      'Подавайте рыбу с брокколи, украсьте ломтиком лимона.',
    ],
  },
  {
    id: 'd2',
    category: 'dinner',
    title: 'Овощной суп с курицей',
    cookingTime: 35,
    tags: ['обычное', 'полезное', 'экономное'],
    ingredients: [
      { name: 'Куриное филе', qty: 200, unit: 'г', priceKey: 'chicken' },
      { name: 'Картофель', qty: 300, unit: 'г', priceKey: 'potato' },
      { name: 'Морковь', qty: 1, unit: 'шт', priceKey: 'carrot' },
      { name: 'Лук репчатый', qty: 1, unit: 'шт', priceKey: 'onion' },
      { name: 'Капуста белокочанная', qty: 150, unit: 'г', priceKey: 'cabbage' },
    ],
    recipeSteps: [
      'Залейте 1.5 л воды, доведите до кипения.',
      'Добавьте целое куриное филе, варите 15 минут, посолите.',
      'Достаньте курицу, нарежьте кусочками и верните в бульон.',
      'Добавьте нарезанный картофель и морковь, варите 10 минут.',
      'Добавьте мелко нашинкованную капусту и нарезанный лук.',
      'Варите ещё 7–8 минут до готовности овощей. Подавайте горячим.',
    ],
  },
  {
    id: 'd3',
    category: 'dinner',
    title: 'Салат с тунцом',
    cookingTime: 15,
    tags: ['полезное', 'быстро'],
    ingredients: [
      { name: 'Тунец консервированный', qty: 1, unit: 'банка', priceKey: 'tuna' },
      { name: 'Яйца', qty: 2, unit: 'шт', priceKey: 'eggs' },
      { name: 'Огурец', qty: 1, unit: 'шт', priceKey: 'cucumber' },
      { name: 'Помидор', qty: 1, unit: 'шт', priceKey: 'tomato' },
      { name: 'Листья салата', qty: 50, unit: 'г', priceKey: 'lettuce' },
      { name: 'Масло оливковое', qty: 15, unit: 'мл', priceKey: 'oil' },
    ],
    recipeSteps: [
      'Отварите яйца вкрутую (10 минут), остудите, очистите и нарежьте четвертинками.',
      'Нарежьте огурец и помидор кубиками.',
      'Слейте масло из банки тунца, разомните вилкой.',
      'Порвите листья салата на крупные куски.',
      'Смешайте все ингредиенты, заправьте оливковым маслом, посолите.',
    ],
  },
  {
    id: 'd4',
    category: 'dinner',
    title: 'Тушёные овощи с курицей',
    cookingTime: 30,
    tags: ['обычное', 'полезное', 'экономное'],
    ingredients: [
      { name: 'Куриное филе', qty: 250, unit: 'г', priceKey: 'chicken' },
      { name: 'Кабачок', qty: 1, unit: 'шт', priceKey: 'zucchini' },
      { name: 'Перец болгарский', qty: 1, unit: 'шт', priceKey: 'bellPepper' },
      { name: 'Помидор', qty: 2, unit: 'шт', priceKey: 'tomato' },
      { name: 'Лук репчатый', qty: 1, unit: 'шт', priceKey: 'onion' },
      { name: 'Масло растительное', qty: 15, unit: 'мл', priceKey: 'oil' },
    ],
    recipeSteps: [
      'Нарежьте курицу средними кубиками, кабачок, перец и помидоры — произвольно.',
      'Лук нарежьте полукольцами.',
      'Обжарьте лук на масле 3 минуты, добавьте курицу.',
      'Жарьте курицу с луком 7 минут, затем добавьте перец и кабачок.',
      'Готовьте 5 минут, добавьте нарезанные помидоры.',
      'Посолите, накройте крышкой и тушите 8–10 минут до готовности.',
    ],
  },
  {
    id: 'd5',
    category: 'dinner',
    title: 'Крем-суп из тыквы',
    cookingTime: 35,
    tags: ['полезное', 'экономное'],
    ingredients: [
      { name: 'Тыква', qty: 500, unit: 'г', priceKey: 'pumpkin' },
      { name: 'Морковь', qty: 1, unit: 'шт', priceKey: 'carrot' },
      { name: 'Лук репчатый', qty: 1, unit: 'шт', priceKey: 'onion' },
      { name: 'Сметана', qty: 50, unit: 'г', priceKey: 'sour_cream' },
      { name: 'Масло растительное', qty: 15, unit: 'мл', priceKey: 'oil' },
    ],
    recipeSteps: [
      'Нарежьте тыкву, морковь и лук крупными кусками.',
      'Обжарьте лук на масле 3 минуты, добавьте морковь и тыкву.',
      'Залейте 700 мл воды, посолите, доведите до кипения.',
      'Варите 20 минут до мягкости тыквы.',
      'Слейте часть бульона (оставьте на дне), пробейте суп погружным блендером.',
      'При необходимости добавьте бульон до нужной консистенции, подайте со сметаной.',
    ],
  },
];

/* =============================================
   СЛОВАРЬ ЦЕН (руб. за кг / за упаковку / за шт)
   Пятёрочка и Дикси
   ============================================= */
const prices = {
  //         { pyat, dixy, unit }
  chicken:      { pyat: 230, dixy: 220, unit: 'кг' },
  turkey:       { pyat: 320, dixy: 310, unit: 'кг' },
  beef:         { pyat: 490, dixy: 480, unit: 'кг' },
  fish:         { pyat: 160, dixy: 150, unit: 'кг' },
  tuna:         { pyat: 95,  dixy: 90,  unit: 'банка' },
  eggs:         { pyat: 100, dixy: 95,  unit: '10 шт' },
  milk:         { pyat: 80,  dixy: 75,  unit: 'л' },
  cottage:      { pyat: 110, dixy: 100, unit: '500 г' },
  sour_cream:   { pyat: 65,  dixy: 60,  unit: '200 г' },
  butter:       { pyat: 140, dixy: 135, unit: '200 г' },
  oats:         { pyat: 55,  dixy: 50,  unit: 'кг' },
  buckwheat:    { pyat: 75,  dixy: 70,  unit: 'кг' },
  rice:         { pyat: 80,  dixy: 75,  unit: 'кг' },
  pasta:        { pyat: 65,  dixy: 60,  unit: 'кг' },
  flour:        { pyat: 50,  dixy: 47,  unit: 'кг' },
  sugar:        { pyat: 65,  dixy: 60,  unit: 'кг' },
  potato:       { pyat: 35,  dixy: 30,  unit: 'кг' },
  carrot:       { pyat: 30,  dixy: 28,  unit: 'кг' },
  onion:        { pyat: 25,  dixy: 23,  unit: 'кг' },
  tomato:       { pyat: 90,  dixy: 85,  unit: 'кг' },
  cucumber:     { pyat: 75,  dixy: 70,  unit: 'кг' },
  bellPepper:   { pyat: 130, dixy: 120, unit: 'кг' },
  broccoli:     { pyat: 120, dixy: 110, unit: 'кг' },
  cabbage:      { pyat: 25,  dixy: 22,  unit: 'кг' },
  zucchini:     { pyat: 55,  dixy: 50,  unit: 'кг' },
  lettuce:      { pyat: 80,  dixy: 75,  unit: 'кг' },
  pumpkin:      { pyat: 45,  dixy: 40,  unit: 'кг' },
  lemon:        { pyat: 30,  dixy: 28,  unit: 'шт' },
  banana:       { pyat: 70,  dixy: 65,  unit: 'кг' },
  honey:        { pyat: 350, dixy: 330, unit: 'кг' },
  bread:        { pyat: 40,  dixy: 38,  unit: 'буханка' },
  oil:          { pyat: 130, dixy: 125, unit: 'л' },
  garlic:       { pyat: 200, dixy: 190, unit: 'кг' },
};

/* веса единиц к кг для расчёта стоимости */
const unitToKg = {
  'кг':     1,
  'г':      0.001,
  'мл':     0.001,
  'л':      1,
  'шт':     0.1,   // условный весовой эквивалент для расчёта
  'зуб.':   0.02,
  'банка':  1,     // цена указана за банку, qty=1
  'головка': 0.05,
  'буханка': 1,
  '200 г':  1,
  '10 шт':  1,
  '500 г':  1,
};

/* Категории продуктов для группировки */
const groceryCategories = {
  'Мясо и рыба': ['chicken', 'turkey', 'beef', 'fish', 'tuna'],
  'Молочные продукты и яйца': ['eggs', 'milk', 'cottage', 'sour_cream', 'butter'],
  'Крупы и бакалея': ['oats', 'buckwheat', 'rice', 'pasta', 'flour', 'sugar', 'oil', 'honey', 'bread'],
  'Овощи': ['potato', 'carrot', 'onion', 'tomato', 'cucumber', 'bellPepper', 'broccoli', 'cabbage', 'zucchini', 'lettuce', 'pumpkin', 'garlic'],
  'Фрукты': ['lemon', 'banana'],
};

/* Названия дней недели */
const dayNames = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'];
const dayEmojis = ['🌱', '☀️', '🌿', '⭐', '🎉', '🌈', '🍀'];

const mealLabels = { breakfast: 'Завтрак', lunch: 'Обед', dinner: 'Ужин' };

/* =============================================
   ГЕНЕРАЦИЯ МЕНЮ
   ============================================= */

/**
 * Возвращает подходящие блюда по категории и параметрам.
 */
function filterDishes(category, style, maxCookTime) {
  return dishes.filter(d => {
    if (d.category !== category) return false;
    if (maxCookTime !== 'any' && d.cookingTime > parseInt(maxCookTime)) return false;
    // стиль питания: "полезное" и "экономное" фильтруем строго, "обычное" — берём всё
    if (style === 'полезное' && !d.tags.includes('полезное')) return false;
    if (style === 'экономное' && !d.tags.includes('экономное')) return false;
    return true;
  });
}

/**
 * Выбирает блюда для 7 дней с минимальными повторами.
 */
function pickDishes(pool, count) {
  if (pool.length === 0) return [];
  const result = [];
  const used = [];
  for (let i = 0; i < count; i++) {
    // предпочитаем неиспользованные
    const available = pool.filter(d => !used.includes(d.id));
    const src = available.length > 0 ? available : pool;
    const pick = src[i % src.length];
    result.push(pick);
    used.push(pick.id);
    // сбрасываем историю, если использовали все
    if (used.length >= pool.length) used.length = 0;
  }
  return result;
}

function generateMenu(settings) {
  const { style, cookTime, meals } = settings;
  const includeMeals = meals === '3'
    ? ['breakfast', 'lunch', 'dinner']
    : ['lunch', 'dinner'];

  const menuByDay = [];
  const pools = {};

  includeMeals.forEach(cat => {
    let pool = filterDishes(cat, style, cookTime);
    // если фильтр слишком жёсткий, берём все блюда категории
    if (pool.length === 0) pool = dishes.filter(d => d.category === cat);
    pools[cat] = pool;
  });

  const pickedByCategory = {};
  includeMeals.forEach(cat => {
    pickedByCategory[cat] = pickDishes(pools[cat], 7);
  });

  for (let i = 0; i < 7; i++) {
    const day = { name: dayNames[i], emoji: dayEmojis[i], meals: {} };
    includeMeals.forEach(cat => {
      day.meals[cat] = pickedByCategory[cat][i];
    });
    menuByDay.push(day);
  }

  return menuByDay;
}

/* =============================================
   СПИСОК ПРОДУКТОВ И СТОИМОСТЬ
   ============================================= */

function collectGroceries(menuByDay, people) {
  const totals = {}; // priceKey -> { name, qty, unit, priceKey }

  menuByDay.forEach(day => {
    Object.values(day.meals).forEach(dish => {
      if (!dish) return;
      dish.ingredients.forEach(ing => {
        const key = ing.priceKey;
        const scaled = ing.qty * people;
        if (totals[key]) {
          totals[key].qty += scaled;
        } else {
          totals[key] = { name: ing.name, qty: scaled, unit: ing.unit, priceKey: key };
        }
      });
    });
  });

  return totals;
}

function formatQty(qty, unit) {
  const roundedQty = Math.ceil(qty * 10) / 10;
  if (unit === 'г') {
    if (roundedQty >= 1000) return `${(roundedQty / 1000).toFixed(1)} кг`;
    return `${Math.ceil(roundedQty)} г`;
  }
  if (unit === 'мл') {
    if (roundedQty >= 1000) return `${(roundedQty / 1000).toFixed(1)} л`;
    return `${Math.ceil(roundedQty)} мл`;
  }
  if (unit === 'шт' || unit === 'зуб.' || unit === 'банка' || unit === 'буханка' || unit === 'головка') {
    return `${Math.ceil(roundedQty)} ${unit}`;
  }
  return `${roundedQty.toFixed(1)} ${unit}`;
}

function calcCost(groceries) {
  let pyat = 0, dixy = 0;

  Object.values(groceries).forEach(item => {
    const p = prices[item.priceKey];
    if (!p) return;
    const factor = unitToKg[item.unit] || 0.001;
    const kg = item.qty * factor;
    pyat += kg * p.pyat;
    dixy += kg * p.dixy;
  });

  return { pyat: Math.round(pyat), dixy: Math.round(dixy) };
}

/* =============================================
   РЕНДЕР: МЕНЮ
   ============================================= */

function renderMenu(menuByDay, mealsPerDay) {
  const panel = document.getElementById('tab-menu');
  const includeMeals = mealsPerDay === '3'
    ? ['breakfast', 'lunch', 'dinner']
    : ['lunch', 'dinner'];

  let html = '<div class="week-grid">';
  menuByDay.forEach(day => {
    html += `
      <div class="day-card">
        <div class="day-card__header">${day.emoji} ${day.name}</div>
        <div class="day-card__body">
    `;
    includeMeals.forEach(cat => {
      const dish = day.meals[cat];
      if (!dish) return;
      html += `
        <div class="meal-slot">
          <span class="meal-slot__label">${mealLabels[cat]}</span>
          <span class="meal-slot__name">${dish.title}</span>
          <span class="meal-slot__time">⏱ ${dish.cookingTime} мин</span>
        </div>
      `;
    });
    html += '</div></div>';
  });
  html += '</div>';
  panel.innerHTML = html;
}

/* =============================================
   РЕНДЕР: ПРОДУКТЫ
   ============================================= */

function renderGroceries(groceries) {
  const panel = document.getElementById('tab-groceries');
  let html = '<div class="groceries-panel"><h2>Список продуктов на неделю</h2>';

  Object.entries(groceryCategories).forEach(([groupName, keys]) => {
    const items = keys.filter(k => groceries[k]);
    if (items.length === 0) return;

    const icons = {
      'Мясо и рыба': '🥩',
      'Молочные продукты и яйца': '🥛',
      'Крупы и бакалея': '🌾',
      'Овощи': '🥦',
      'Фрукты': '🍌',
    };

    html += `
      <div class="grocery-group">
        <div class="grocery-group__title">${icons[groupName] || '📦'} ${groupName}</div>
        <ul class="grocery-list">
    `;
    items.forEach(key => {
      const item = groceries[key];
      const id = `chk_${key}`;
      html += `
        <li>
          <input type="checkbox" id="${id}" />
          <label for="${id}">
            <span>${item.name}</span>
            <span>${formatQty(item.qty, item.unit)}</span>
          </label>
        </li>
      `;
    });
    html += '</ul></div>';
  });

  html += '</div>';
  panel.innerHTML = html;
}

/* =============================================
   РЕНДЕР: БЮДЖЕТ
   ============================================= */

function renderBudget(cost) {
  const panel = document.getElementById('tab-budget');
  const avg = Math.round((cost.pyat + cost.dixy) / 2);
  const diff = Math.abs(cost.pyat - cost.dixy);
  const cheaper = cost.pyat < cost.dixy ? 'Пятёрочка' : 'Дикси';
  const noteText = diff < 300
    ? 'Разница между магазинами небольшая — можно идти в любой.'
    : `Экономнее всего: <strong>${cheaper}</strong> — вы сэкономите ~${diff} ₽.`;

  panel.innerHTML = `
    <div class="budget-panel">
      <h2>Примерная стоимость корзины</h2>
      <div class="budget-cards">
        <div class="budget-card ${cost.pyat < cost.dixy ? 'budget-card--highlight' : ''}">
          <div class="budget-card__store">🏪 Пятёрочка</div>
          <div class="budget-card__price">${cost.pyat.toLocaleString('ru-RU')} <span>₽</span></div>
        </div>
        <div class="budget-card ${cost.dixy < cost.pyat ? 'budget-card--highlight' : ''}">
          <div class="budget-card__store">🛒 Дикси</div>
          <div class="budget-card__price">${cost.dixy.toLocaleString('ru-RU')} <span>₽</span></div>
        </div>
        <div class="budget-card">
          <div class="budget-card__store">📊 Средняя сумма</div>
          <div class="budget-card__price">${avg.toLocaleString('ru-RU')} <span>₽</span></div>
        </div>
      </div>
      <div class="budget-note">
        <span class="budget-note__icon">💡</span>
        <p class="budget-note__text">${noteText}</p>
      </div>
    </div>
  `;
}

/* =============================================
   РЕНДЕР: РЕЦЕПТЫ
   ============================================= */

function renderRecipes(menuByDay, mealsPerDay) {
  const panel = document.getElementById('tab-recipes');
  const includeMeals = mealsPerDay === '3'
    ? ['breakfast', 'lunch', 'dinner']
    : ['lunch', 'dinner'];

  let html = '<div class="recipes-panel"><h2>Рецепты на каждый день</h2>';

  menuByDay.forEach((day, idx) => {
    html += `
      <div class="recipe-day">
        <button class="recipe-day__toggle" data-day="${idx}" aria-expanded="false">
          <span>${day.emoji} ${day.name}</span>
          <span class="arrow">▼</span>
        </button>
        <div class="recipe-day__content" id="recipe-content-${idx}">
    `;

    includeMeals.forEach(cat => {
      const dish = day.meals[cat];
      if (!dish) return;

      const ingList = dish.ingredients
        .map(i => `<li>${i.name} — ${formatQty(i.qty, i.unit)}</li>`)
        .join('');
      const stepList = dish.recipeSteps
        .map(s => `<li>${s}</li>`)
        .join('');

      html += `
        <div class="recipe-meal">
          <div class="recipe-meal__heading">${mealLabels[cat]}</div>
          <div class="recipe-meal__name">${dish.title}</div>
          <div class="recipe-meta">⏱ Время приготовления: ${dish.cookingTime} мин</div>
          <div class="recipe-section-label">Ингредиенты (на 1 человека):</div>
          <ul class="recipe-ingredients">${ingList}</ul>
          <div class="recipe-section-label">Шаги приготовления:</div>
          <ol class="recipe-steps">${stepList}</ol>
        </div>
      `;
    });

    html += '</div></div>';
  });

  html += '</div>';
  panel.innerHTML = html;

  // Обработчики раскрытия/скрытия дней
  panel.querySelectorAll('.recipe-day__toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = btn.dataset.day;
      const content = document.getElementById(`recipe-content-${idx}`);
      const isOpen = content.classList.contains('open');
      content.classList.toggle('open', !isOpen);
      btn.classList.toggle('open', !isOpen);
      btn.setAttribute('aria-expanded', String(!isOpen));
    });
  });
}

/* =============================================
   ВКЛАДКИ
   ============================================= */

function initTabs() {
  const tabs = document.querySelectorAll('.tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('tab--active'));
      tab.classList.add('tab--active');

      document.querySelectorAll('.tab-panel').forEach(p => {
        p.classList.remove('tab-panel--active');
      });
      document.getElementById(`tab-${tab.dataset.tab}`).classList.add('tab-panel--active');
    });
  });
}

/* =============================================
   ГЛАВНЫЙ ОБРАБОТЧИК ФОРМЫ
   ============================================= */

document.getElementById('menuForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const settings = {
    people:   parseInt(document.getElementById('people').value),
    budget:   parseInt(document.getElementById('budget').value),
    style:    document.getElementById('style').value,
    cookTime: document.getElementById('cookTime').value,
    meals:    document.getElementById('meals').value,
  };

  // Генерация данных
  const menuByDay  = generateMenu(settings);
  const groceries  = collectGroceries(menuByDay, settings.people);
  const cost       = calcCost(groceries);

  // Рендер всех секций
  renderMenu(menuByDay, settings.meals);
  renderGroceries(groceries);
  renderBudget(cost);
  renderRecipes(menuByDay, settings.meals);

  // Показываем результаты
  const resultsEl = document.getElementById('results');
  resultsEl.hidden = false;
  resultsEl.scrollIntoView({ behavior: 'smooth', block: 'start' });

  // Сброс вкладок — показываем первую
  document.querySelectorAll('.tab').forEach((t, i) => {
    t.classList.toggle('tab--active', i === 0);
  });
  document.querySelectorAll('.tab-panel').forEach((p, i) => {
    p.classList.toggle('tab-panel--active', i === 0);
  });

  initTabs();
});

/* =============================================
   КНОПКА «СОСТАВИТЬ ЗАНОВО»
   ============================================= */

document.getElementById('resetBtn').addEventListener('click', () => {
  document.getElementById('results').hidden = true;
  document.getElementById('formSection').scrollIntoView({ behavior: 'smooth', block: 'start' });
});
