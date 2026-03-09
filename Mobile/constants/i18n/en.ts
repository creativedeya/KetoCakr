import type { TranslationKeys } from './bg';

export const en: TranslationKeys = {
  common: {
    back: 'Back',
    save: 'Save',
    cancel: 'Cancel',
    continue: 'Continue',
    create: 'Create',
    edit: 'Edit',
    delete: 'Delete',
    search: 'Search',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    confirm: 'Confirm',
    yes: 'Yes',
    no: 'No',
    retry: 'Try again',
    all: 'All',
    viewAll: 'View all',
    createNew: 'Create new',
    noResults: 'No results',
  },

  tabs: {
    home: 'Home',
    search: 'Search',
    create: 'Create',
    tools: 'Tools',
    profile: 'Profile',
    login: 'Sign In',
  },

  home: {
    greeting: 'Hello! 👋',
    hero: {
      title: 'Dessert of the Day',
      subtitle: 'A special recommendation just for you',
      button: 'Show me!',
    },
    error: {
      title: 'Loading Error',
      failedToLoad: "We couldn't load the dessert of the day",
      failedToLoadRecipes: "We couldn't load the recipes",
    },
    noDessert: {
      title: 'No dessert of the day',
      subtitle: 'Check back later',
    },
    createMasterpiece: 'Create masterpiece',
    featuredBadge: 'DESSERT OF THE DAY',
    viewRecipe: 'VIEW RECIPE',
    startCreating: 'START CREATING',
    byDessertType: 'By dessert type',
    noRecipes: {
      title: 'No recipes',
      subtitle: 'Try another filter',
    },
    quickActions: {
      title: 'What would you like to do?',
      createCake: {
        title: 'Create Cake',
        description: 'Puzzle mode',
      },
      readyRecipes: {
        title: 'Ready Recipes',
        description: 'From our team',
      },
    },
    popularCakes: {
      title: 'Popular Cakes',
      netCarbs: 'net carbs',
    },
    yourCreations: 'Your Creations',
    noCreations: 'No recipes yet',
  },

  search: {
    title: 'Search',
    placeholder: 'Search recipes, ingredients...',
    popularSearches: 'Popular Searches',
    recentSearches: 'Recent Searches',
    categories: 'Categories',
    emptyState: {
      title: 'No searches yet',
      description: 'Start searching for your favorite\nketo desserts',
    },
    categoryItems: {
      cakes: 'Cakes',
      muffins: 'Muffins',
      cookies: 'Cookies',
      cheesecakes: 'Cheesecakes',
      pies: 'Pies',
      recipes: 'recipes',
    },
    filters: {
      dessertType: 'Dessert type',
      calories: 'Calories per serving',
      netCarbs: 'Net carbs',
      all: 'All',
    },
    results: 'results',
  },

  create: {
    title: 'My Creations',
    recipe: 'recipe',
    recipes: 'recipes',
    servings: 'servings',
    searchPlaceholder: 'Search my recipes...',
    emptyState: {
      title: 'My Creations',
      description: "You don't have any created recipes yet.\nTime to start creating!",
      button: 'Create New Cake',
    },
  },

  tools: {
    title: 'Tools',
    subtitle: 'Everything you need for the perfect dessert',
    quickTools: '⚡ Quick Tools',
    knowledgeBase: '📚 Knowledge Base',
    tipsOfDay: '💡 Tips of the Day',
    items: {
      converter: {
        title: 'Converter',
        description: 'Inches ↔ Cm\nOunces ↔ Grams',
      },
      timer: {
        title: 'Timer',
        description: 'For baking and cooking',
      },
      panSizes: {
        title: 'Pan Sizes',
        description: 'Recalculate for different sizes',
      },
      macroCalculator: {
        title: 'Macro Calculator',
        description: 'Personal daily needs',
      },
      encyclopedia: {
        title: 'Ingredient Encyclopedia',
        subtitle: 'Properties, substitutes, tips',
      },
      substitutes: {
        title: 'Ingredient Substitutes',
        subtitle: 'What to use instead of...',
      },
      techniques: {
        title: 'Cooking Techniques',
        subtitle: 'Tips from professionals',
      },
      nutrition: {
        title: 'Nutrition Tables',
        subtitle: 'Calories and macros',
      },
    },
    tipText:
      'When baking keto crusts, always preheat the oven to 180°C (350°F). This ensures even baking and better texture.',
  },

  profile: {
    title: 'Profile',
    user: 'User',
    login: {
      title: 'Sign in to your account',
      description: 'Save your recipes and sync\nacross all your devices',
      signIn: 'Sign In',
      signUp: 'Sign Up',
    },
    stats: {
      myRecipes: 'My Recipes',
      favorites: 'Favorites',
      daysActive: 'Days Active',
    },
    menu: {
      favoriteRecipes: {
        title: 'Favorite Recipes',
        subtitle: '28 saved desserts',
      },
      shoppingList: {
        title: 'Shopping List',
        subtitle: 'Generated from recipes',
      },
      premium: {
        title: 'Premium Subscription',
        subtitle: 'Unlock all features',
      },
      settings: {
        title: 'Settings',
        subtitle: 'Profile and preferences',
      },
      logout: 'Sign Out',
    },
    ingredientPrices: {
      title: 'My ingredient prices',
      subtitle: 'Customize for accurate costs',
    },
    logoutConfirm: {
      title: 'Sign Out',
      message: 'Are you sure you want to sign out?',
    },
    appInfo: {
      version: 'KetoCakr v1.0.0',
      tagline: 'Made with 💜 for keto lovers',
    },
  },

  recipeBuilder: {
    dessertSelection: {
      title: 'Choose Dessert',
      subtitle: 'What shall we make today?',
    },
    buildStep: {
      roles: {
        crust: 'Crust',
        filling: 'Filling',
        cream: 'Cream',
        decoration: 'Decoration',
      },
      continueButton: 'Continue ({{count}}/4)',
      nutrition: {
        kcal: 'kcal',
        protein: 'protein',
        fat: 'fat',
        carbs: 'carbs',
        net: 'net',
      },
    },
    finalizeStep: {
      title: 'Final Step',
      subtitle: 'Name and servings',
      recipeName: 'Recipe Name',
      servings: 'Number of Servings',
      descriptionLabel: 'Description (optional)',
      descriptionPlaceholder: 'Write a short description of your dessert...',
      summary: {
        title: 'Summary',
        dessert: 'Dessert:',
        components: 'Components:',
        calories: 'Calories:',
        perServing: 'kcal/serving',
      },
      saveButton: '🎉 Save Recipe',
      placeholder: 'My {{dessert}}',
    },
    alerts: {
      loginRequired: {
        title: 'Error',
        message: 'Please sign in to save recipe',
      },
      selectComponent: {
        title: 'Error',
        message: 'Please select at least one component',
      },
      success: {
        title: 'Success! 🎉',
        message: 'Recipe saved successfully',
        viewRecipe: 'View Recipe',
        goToRecipes: 'Go to Recipes',
      },
      error: {
        title: 'Error',
        message: 'Failed to save recipe',
      },
    },
  },

  recipeDetail: {
    tabs: {
      overview: 'Overview',
      intro: 'INTRO',
      ingredients: 'INGREDIENTS',
      steps: 'STEPS',
      instructions: 'Instructions',
      nutrition: 'Nutrition',
      nutritionShort: 'NUTRITION',
    },
    mode: {
      servings: 'SERVINGS',
      quantity: 'QUANTITY',
      price: 'PRICE',
      total: 'TOTAL',
      portion: 'SERVING',
    },
    type: 'TYPE:',
    views: {
      text: 'Text',
      gallery: 'Photos',
    },
    overview: {
      servings: 'servings',
      perServing: 'per serving',
      components: 'Components',
      ingredients: 'Ingredients',
    },
    nutrition: {
      calories: 'Calories',
      protein: 'Protein',
      fat: 'Fat',
      carbs: 'Carbohydrates',
      fiber: 'Fiber',
      netCarbs: 'Net Carbs',
      perServing: 'Nutritional values per serving',
    },
    instructions: {
      step: 'Step',
      noInstructions: 'No instructions available',
      assembly: 'Assembly',
    },
    actions: {
      addToShoppingList: 'Add to List',
      addToShoppingListLong: 'Add to shopping list',
      addedToList: 'Ingredients added to list',
      share: 'Share',
      favorite: 'Favorite',
    },
    share: {
      title: 'Share',
      message: 'Share functionality coming soon!',
    },
    timer: {
      started: 'Started {{minutes}} minute timer!',
      error: 'Could not start timer',
    },
    cost: {
      total: 'Total Cost',
      perServing: 'per serving',
      estimatedCost: 'Estimated Cost',
      note: 'Enter prices for all products based on your preferred brands in the Ingredient Prices menu for accurate calculations.',
      pricePerKg: 'Price per kg',
      pricePerL: 'Price per L',
      pricePerPc: 'Price per pc',
      pricePerLb: 'Price per lb',
      pricePerFlOz: 'Price per fl oz',
    },
    makes: 'MAKES:',
    totalWeight: 'TOTAL WEIGHT',
    perServingShort: 'PER SERVING',
    intro: {
      type: 'Type',
      prep: 'Prep',
      bake: 'Bake',
      total: 'Total',
      equipment: 'Equipment needed',
      min: 'min',
    },
    noIngredients: 'No ingredient information available',
    errorState: 'Loading Error',
  },

  ingredientPrices: {
    title: 'Ingredient Prices',
    subtitle: 'Set prices from your store',
    loading: 'Loading ingredients...',
    search: 'Search ingredient...',
    saveAll: 'Save All',
    resetAll: 'Reset',
    saved: 'Saved!',
    priceLabel: 'Price:',
    notSet: 'Not set',
    pricePerUnit: 'Price per {{unit}}',
    noResults: 'No ingredients found',
    categories: {
      all: 'All',
      dairy: 'Dairy',
      nuts: 'Nuts',
      sweeteners: 'Sweeteners',
      flours: 'Flours',
      other: 'Other',
    },
  },

  shoppingList: {
    title: 'Shopping List',
    clearChecked: 'Clear checked',
    addProduct: 'Add item',
    newProduct: 'New item',
    productName: 'Product name',
    quantity: 'Quantity',
    unit: 'Unit',
    add: 'Add',
    toBuy: 'To buy',
    bought: 'Purchased',
    stats: {
      unchecked: '{{count}} items',
      checked: 'Checked: {{count}}',
    },
    empty: {
      title: 'List is empty',
      description: 'Add items or import from a recipe',
    },
    actions: {
      clearAll: 'Clear All',
      shareList: 'Share List',
      addManually: 'Add Manually',
    },
    item: {
      checked: 'Purchased',
      unchecked: 'Not purchased',
    },
    alerts: {
      emptyIngredient: 'Please enter the ingredient name',
      noChecked: {
        title: 'Information',
        message: 'No checked items',
      },
      deleteChecked: {
        title: 'Delete',
        message: 'Delete {{count}} checked items?',
        button: 'Delete',
      },
      clearAll: {
        title: 'Clear List',
        message: 'Are you sure you want to delete all items?',
        button: 'Delete All',
      },
    },
    confirmClear: {
      title: 'Clear List',
      message: 'Are you sure?',
    },
    total: 'Total: {{amount}} BGN',
  },

  settings: {
    title: 'Settings',
    loginRequired: {
      title: 'Sign in to your account',
      subtitle: 'To change settings',
    },
    account: 'Account',
    email: 'Email',
    name: 'Name',
    notSet: 'Not set',
    preferences: 'Preferences',
    notifications: {
      title: 'Notifications',
      subtitle: 'Push notifications for new recipes',
    },
    darkMode: {
      title: 'Dark Mode',
      comingSoon: 'Coming soon',
    },
    language: {
      title: 'Language',
      current: 'Bulgarian',
      alert: 'You will be able to choose language soon',
    },
    about: {
      title: 'About',
      alertMessage: 'KetoCakr v1.0.0\n\nPersonalized keto desserts',
    },
    privacy: {
      title: 'Privacy',
      alertMessage: 'Your data is protected',
    },
    help: {
      title: 'Help',
      alertMessage: 'For help: support@ketocakr.com',
    },
    contact: {
      title: 'Contact us',
      alertMessage: 'Email: support@ketocakr.com',
    },
    copyright: '© 2025 All rights reserved',
    saveChanges: 'Save changes',
    units: {
      title: 'Units',
      metric: 'Metric',
      imperial: 'Imperial',
      metricHint: 'g, ml, °C',
      imperialHint: 'oz, fl oz, °F',
    },
    currency: {
      title: 'Currency',
      dollar: 'Dollar',
      euro: 'Euro',
    },
    saved: {
      title: 'Success! ✅',
      message: 'Settings saved',
    },
  },

  roles: {
    1: 'Crust',
    2: 'Cream',
    3: 'Filling',
    4: 'Decoration',
    crust: 'Crust',
    cream: 'Cream',
    filling: 'Filling',
    decoration: 'Decoration',
  },

  units: {
    g: 'g',
    kg: 'kg',
    ml: 'ml',
    l: 'l',
    tsp: 'tsp',
    tbsp: 'tbsp',
    cup: 'cup',
    piece: 'pcs',
    perHundredG: 'per 100g',
  },

  favorites: {
    title: 'Favorite Recipes',
    loginRequired: {
      description: 'To view your favorite recipes',
    },
    count: {
      single: 'recipe',
      plural: 'recipes',
    },
    servings: 'servings',
    components: 'components',
    empty: {
      title: 'No favorite recipes',
      description: 'Mark recipes as favorites with the ❤️ button to see them here',
      browse: 'Browse recipes',
    },
  },

  alerts: {
    comingSoon: 'Coming soon...',
    premium: {
      title: '👑 Premium Feature',
      message:
        'This feature is available only for premium users.\n\nSubscribe for full access to all tools!',
    },
  },

  panPicker: {
    title: 'Pan',
    servings: 'servings',
    pieces: 'pieces',
    rectangular: 'Rectangular pans',
    selectPan: 'Select pan',
    perServing: 'per serving',
    round: 'round',
    freeSize: 'Free size',
  },

  allRecipes: {
    title: 'All Recipes',
    searchPlaceholder: 'Search recipes...',
  },

  imageUpload: {
    addPhoto: 'Add photo',
    camera: 'Camera',
    gallery: 'Gallery',
    cancel: 'Cancel',
    uploaded: 'Photo uploaded!',
    skipForNow: 'You can add a photo later',
  },

  unitConverter: {
    title: 'Inch ↔ cm Converter',
    placeholder: 'Enter value',
    inchToCm: 'inch → cm',
    cmToInch: 'cm → inch',
    result: 'Result',
    inches: 'inches',
    cm: 'cm',
  },

  bakingTimer: {
    title: 'Baking Timer',
    addTimer: '+ New Timer',
    start: 'Start',
    pause: 'Pause',
    resume: 'Resume',
    reset: 'Reset',
    done: 'Done!',
    timer: 'Timer',
    placeholderMin: 'min',
    finished: 'finished!',
  },

  panConverter: {
    title: 'Pan Converter',
    round: 'Round',
    rectangular: 'Rectangular',
    diameter: 'Diameter (cm)',
    length: 'Length (cm)',
    width: 'Width (cm)',
    volume: 'Volume',
    servings: 'servings',
    closestPan: 'Closest pan',
    enterSize: 'Enter size',
    liters: 'L',
  },

  macroCalculator: {
    title: 'Macro Calculator',
    weight: 'Weight (kg)',
    height: 'Height (cm)',
    age: 'Age',
    gender: 'Gender',
    male: 'Male',
    female: 'Female',
    activity: 'Activity level',
    sedentary: 'Sedentary',
    lightlyActive: 'Lightly active',
    moderatelyActive: 'Moderately active',
    active: 'Active',
    veryActive: 'Very active',
    calculate: 'Calculate',
    bmr: 'Basal Metabolic Rate (BMR)',
    tdee: 'Daily Energy Needs (TDEE)',
    deficit: 'With deficit (-500 cal)',
    ketoMacros: 'Keto macros',
    fat: 'Fat',
    protein: 'Protein',
    carbs: 'Carbs',
    gramsPerDay: 'g/day',
    kcalPerDay: 'kcal/day',
    fillAll: 'Please fill in all fields',
  },
};
