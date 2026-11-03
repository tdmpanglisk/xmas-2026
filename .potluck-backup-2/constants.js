// Event Configuration
export const EVENT_CONFIG = {
  name: "Mah Family Hawaiian Christmas 2026",
  date: "December 25, 2026",
  time: "5:00 PM - Midnight",
  address: "1183 Hainstock Green SW Edmonton, Alberta T6W3B6",
  hostNames: "The Mah Family (馬家)",
  maxGuests: 30,
  rsvpDeadline: "December 10, 2026",
  dressCode: "Aloha Attire Encouraged - Hawaiian Shirts, Muumuus & Leis Welcome!",
  emailNotifications: {
    hostEmail: "tranmahpaulson@gmail.com", // Replace with actual email
    subject: "New RSVP for Mah Family Hawaiian Christmas 2026",
  },
};

export const GOOGLE_SHEETS_WEBAPP_URL = 'https://script.google.com/macros/s/AKfycbwge97CjOM3QVRfrSjyd-NbePHqDg7BmTnqqCEwVov4nBPiBfgi0f8yauq-l805QmzJaA/exec';

// Potluck Food Categories & Options - Hawaiian Luau Theme
/*
export const FOOD_CATEGORIES = [
  {
    id: 'appetizers',
    name: 'Pūpū (Appetizers)',
    icon: '🥥',
    options: [
      { id: 'poke-bowls', name: 'Ahi Poke Bowls (Shoyu, Spicy Mayo, Limu)', serves: 12 },
      { id: 'lomi-salmon', name: 'Lomi Lomi Salmon with Tomato & Onion', serves: 10 },
      { id: 'coconut-shrimp', name: 'Coconut-Crusted Shrimp with Pineapple Dipping Sauce', serves: 15 },
      { id: 'manapua', name: 'Char Siu Manapua (Steamed BBQ Pork Buns)', serves: 20 },
      { id: 'poi', name: 'Fresh Poi with Lomi Onions', serves: 15 },
    ],
  },
  {
    id: 'mains',
    name: 'Mea ʻAi Nui (Main Dishes) - The Kalua Pig',
    icon: '🐷',
    options: [
      { id: 'kalua-pig', name: '🌺 Kālua Pig (Traditional Imu-Roasted with Lei)', serves: 25 },
      { id: 'huli-huli-chicken', name: 'Huli Huli Chicken (Grilled Pineapple Glaze)', serves: 20 },
      { id: 'lau-lau', name: 'Lau Lau (Pork & Fish Wrapped in Luau & Ti Leaves)', serves: 15 },
      { id: 'tofu-lau-lau', name: 'Vegetarian Lau Lau (Tofu, Sweet Potato, Taro Leaf)', serves: 12 },
      { id: 'grilled-mahi', name: 'Grilled Mahi-Mahi with Macadamia Nut Crust', serves: 15 },
    ],
  },
  {
    id: 'sides',
    name: 'Sides & Starches',
    icon: '🍠',
    options: [
      { id: 'hawaiian-sweet-bread', name: 'Hawaiian Sweet Bread (Portuguese Style)', serves: 20 },
      { id: 'rice', name: 'Steamed White Rice (Calrose)', serves: 30 },
      { id: 'mac-salad', name: 'Hawaiian Mac Salad (Best in the Islands)', serves: 20 },
      { id: 'baked-taro', name: 'Baked Taro with Coconut Cream', serves: 15 },
      { id: 'purple-sweet-potato', name: 'Okinawan Purple Sweet Potato Mash', serves: 15 },
      { id: 'seaweed-salad', name: 'Limu & Cucumber Seaweed Salad', serves: 15 },
      { id: 'pineapple-rice', name: 'Baked Pineapple Fried Rice in Pineapple Boat', serves: 15 },
    ],
  },
  {
    id: 'desserts',
    name: 'Mea ʻOno (Desserts)',
    icon: '🍍',
    options: [
      { id: 'haupia', name: 'Haupia (Coconut Pudding Squares)', serves: 20 },
      { id: 'malasadas', name: 'Leonard\'s Style Malasadas (Filled: Haupia, Custard, Lilikoi)', serves: 30 },
      { id: 'mochi', name: 'Butter Mochi & Mochi Ice Cream Assortment', serves: 20 },
      { id: 'guava-chiffon', name: 'Guava Chiffon Cake', serves: 15 },
      { id: 'lilikoi-cheesecake', name: 'Lilikoi (Passion Fruit) Cheesecake Bars', serves: 15 },
      { id: 'fruit-platter', name: 'Tropical Fruit Platter (Papaya, Mango, Pineapple, Lychee, Starfruit)', serves: 25 },
    ],
  },
  {
    id: 'drinks',
    name: 'Inu (Drinks)',
    icon: '🍹',
    options: [
      { id: 'mai-tai', name: 'Classic Mai Tai (Orgeat, Orange Curaçao, Lime, Dark Rum)', serves: 20 },
      { id: 'blue-hawaii', name: 'Blue Hawaiʻi (Blue Curaçao, Pineapple, Vodka)', serves: 20 },
      { id: 'pina-colada', name: 'Fresh Piña Colada (Coconut Cream, Pineapple, White Rum)', serves: 20 },
      { id: 'poi-smoothie', name: 'Poi Banana Smoothies (Non-Alcoholic)', serves: 20 },
      { id: 'kona-coffee', name: 'Kona Coffee & Hot Tea Station', serves: 30 },
      { id: 'guava-juice', name: 'Fresh Guava & Lilikoi Juice Bar', serves: 25 },
    ],
  },
];*/

// Dietary restrictions
export const DIETARY_OPTIONS = [
  { id: 'vegetarian', label: 'Vegetarian', icon: '🌱' },
  { id: 'vegan', label: 'Vegan', icon: '🌿' },
  { id: 'gluten-free', label: 'Gluten-Free', icon: '🚫🌾' },
  { id: 'dairy-free', label: 'Dairy-Free', icon: '🚫🥛' },
  { id: 'nut-free', label: 'Nut-Free', icon: '🚫🥜' },
  { id: 'keto', label: 'Keto/Low-Carb', icon: '🥑' },
  { id: 'halal', label: 'Halal', icon: '☪️' },
  { id: 'kosher', label: 'Kosher', icon: '✡️' },
];

// Attendance options
export const ATTENDANCE_OPTIONS = [
  { id: 'yes', label: 'Yes, I\'ll be there! 🌺🤙', value: true },
  { id: 'no', label: 'Sorry, cannot make it 😢', value: false },
  { id: 'maybe', label: 'Maybe - I\'ll let you know soon 🤔', value: null },
];

// Party size options
export const PARTY_SIZE_OPTIONS = Array.from({ length: 8 }, (_, i) => ({
  value: i + 1,
  label: i === 0 ? 'Just me' : i === 1 ? 'Me + 1 guest' : `Me + ${i} guests`,
}));

// Admin password (in production, use environment variable)
export const ADMIN_PASSWORD = 'mahxmas2026';

// Admin access URL parameter (hidden access)
export const ADMIN_ACCESS_PARAM = 'admin';

// Invitation codes - simple single code for all guests (no emails in code)
export const VALID_CODES = [
  'MAH-2026-EXCLUSIVE',
];

// Validate invitation code
export const validateInviteCode = (code) => {
  return VALID_CODES.includes(code.toUpperCase()) ? { code: code.toUpperCase() } : null;
};

// EmailJS Configuration (replace with your actual credentials)
export const EMAILJS_CONFIG = {
  serviceId: 'service_9k6hrlt',        // Your EmailJS service ID
  templateId: 'template_8zel339',      // RSVP confirmation template (guest)
  publicKey: 'eE4kGTKd1q0UwpduP',     // Your EmailJS public key
  //hostTemplateId: 'template_jfxdixe',  // Template for host notification
  inviteTemplateId: 'template_jfxdixe', // TODO: Replace with your Invitation template ID (the Hawaiian Christmas template)
};

// Potluck Food Categories & Options - Guest Sign-up Slots
// Guests select a slot and can enter their specific dish name
// Recipe suggestions are provided as optional inspiration
export const FOOD_CATEGORIES = [
  {
    id: 'appetizers',
    name: 'Appetizer',
    icon: '🥟',
    // 2 slots available
    options: [
      { id: 'appetizer-1', name: 'Appetizer', serves: 8 },
      { id: 'appetizer-2', name: 'Appetizer', serves: 8 },
    ],
    // Optional recipe suggestions for inspiration
    recipeSuggestions: [
      'Ahi Poke Bowls (Shoyu, Spicy Mayo, Limu)',
      'Lomi Lomi Salmon with Tomato & Onion',
      'Coconut-Crusted Shrimp with Pineapple Dipping Sauce',
      'Char Siu Manapua (Steamed BBQ Pork Buns)',
      'Crispy Wonton Chips with Mango Salsa',
      'Grilled Pineapple & Shrimp Skewers',
      'Spam Musubi',
      'Edamame with Sea Salt',
    ],
  },
  {
    id: 'hot-veggie',
    name: 'Hot Veggie',
    icon: '🥦',
    // 1 slot available
    options: [
      { id: 'hot-veggie-1', name: 'Hot Veggie', serves: 10 },
    ],
    recipeSuggestions: [
      'Garlic Butter Green Beans with Almonds',
      'Roasted Brussels Sprouts with Bacon & Balsamic',
      'Hawaiian Style Corn (Grilled with Butter, Shoyu, Furikake)',
      'Sautéed Bok Choy with Garlic & Oyster Sauce',
      'Honey Glazed Carrots with Ginger',
      'Grilled Asparagus with Lemon & Parmesan',
      'Maple Roasted Sweet Potatoes & Carrots',
      'Creamed Spinach with Bacon',
    ],
  },
  {
    id: 'starches',
    name: 'Starch',
    icon: '🍚',
    // 2 slots available
    options: [
      { id: 'starch-1', name: 'Starch', serves: 12 },
      { id: 'starch-2', name: 'Starch', serves: 12 },
    ],
    recipeSuggestions: [
      'Hawaiian Sweet Bread (Portuguese Style)',
      'Steamed White Rice (Calrose)',
      'Hawaiian Mac Salad (Best in the Islands)',
      'Baked Taro with Coconut Cream',
      'Okinawan Purple Sweet Potato Mash',
      'Baked Pineapple Fried Rice in Pineapple Boat',
      'Garlic Butter Rice with Green Onions',
      'Cheesy Scalloped Potatoes',
      'Cornbread with Honey Butter',
      'Wild Rice Pilaf with Cranberries & Pecans',
    ],
  },
  {
    id: 'desserts',
    name: 'Dessert',
    icon: '🍰',
    // 2 slots available
    options: [
      { id: 'dessert-1', name: 'Dessert', serves: 12 },
      { id: 'dessert-2', name: 'Dessert', serves: 12 },
    ],
    recipeSuggestions: [
      'Haupia (Coconut Pudding Squares)',
      "Leonard's Style Malasadas (Filled: Haupia, Custard, Lilikoi)",
      'Butter Mochi & Mochi Ice Cream Assortment',
      'Guava Chiffon Cake',
      'Lilikoi (Passion Fruit) Cheesecake Bars',
      'Tropical Fruit Platter (Papaya, Mango, Pineapple, Lychee, Starfruit)',
      'Chocolate Haupia Pie',
      'Pineapple Upside-Down Cake',
      'Coconut Cake with Cream Cheese Frosting',
      'Banana Bread with Macadamia Nuts',
    ],
  },
];

// Potluck note for guests
export const POTLUCK_NOTE = '📝 Recipes are optional - you choose the category and bring your own dish!<br>🚫 No salads allowed, please.<br>💡 Click "Recipe Ideas" for inspiration.'; 

// Recipe data for potluck items - includes internet recipes, variations, verified direct images, and notes
// Local image paths are applied at build time
export const RECIPE_DATA = {
  'kalua-pig': {
    name: '🌺 Kālua Pig (Traditional Imu-Roasted with Lei)',
    providedBy: 'Host (Mah Family)',
    isHostProvided: true,
    imageUrl: '/images/kalua-pig.jpg',
    description: 'The centerpiece of our luau - traditionally cooked in an imu (underground oven) for 12+ hours until fall-apart tender, infused with mesquite smoke and ti leaf essence.',
    recipes: [
      { name: '3-Ingredient Kalua Pork (Oven or Instant Pot)', source: 'Onolicious Hawaiʻi', url: 'https://onolicioushawaii.com/kalua-pork/' },
    ],
      variations: [
      'Add liquid smoke if no imu available',
      'Wrap in banana leaves + foil for oven version',
      'Use pork shoulder (Boston butt) for best results',
      'Add Hawaiian sea salt (alaea) for authentic flavor',
    ],
    notes: 'Host is providing the main kalua pig - no need to sign up! This is the evening highlight. 🐷✨',
  },
  'huli-huli-chicken': {
    name: 'Huli Huli Chicken (Grilled Pineapple Glaze)',
    providedBy: '',
    isHostProvided: false,
    imageUrl: '/images/huli-huli-chicken.jpg',
    description: 'Classic Hawaiian grilled chicken basted in sweet-savory pineapple-soy glaze, turned ("huli") repeatedly over charcoal.',
    recipes: [
      { name: 'Shoyu Roast Chicken Alternative', source: 'Onolicious Hawaiʻi', url: 'https://onolicioushawaii.com/shoyu-vinegar-roast-chicken/' },
    ],
    variations: [
      'Use bone-in thighs for juicier meat',
      'Add ginger & garlic to marinade',
      'Grill over kiawe (mesquite) wood for authenticity',
      'Make extra glaze for serving',
    ],
    notes: '',
  },
  'lau-lau': {
    name: 'Lau Lau (Pork & Fish Wrapped in Luau & Ti Leaves)',
    providedBy: '',
    isHostProvided: false,
    imageUrl: '/images/lau-lau.jpg',
    description: 'Traditional Hawaiian dish - pork butt and butterfish wrapped in luau (taro) leaves, then ti leaves, steamed until meltingly tender.',
    recipes: [
      { name: 'Crock Pot Laulau', source: 'Keeping It Relle', url: 'https://keepingitrelle.com/crock-pot-laulau/' },
      { name: 'Instant Pot Lūʻau Stew', source: 'Keeping It Relle', url: 'https://keepingitrelle.com/luau-stew-made-quick-and-easy-in-the-instant-pot/' },
    ],
    variations: [
      'Use spinach + collard greens if luau leaves unavailable',
      'Substitute ti leaves with parchment + foil',
      'Add sweet potato chunks inside',
    ],
    notes: '',
  },
  'tofu-lau-lau': {
    name: 'Vegetarian Lau Lau (Tofu, Sweet Potato, Taro Leaf)',
    providedBy: '',
    isHostProvided: false,
    imageUrl: '/images/tofu-lau-lau.jpg',
    description: 'Plant-based take on the classic - firm tofu, sweet potato, and mushrooms wrapped in taro and ti leaves.',
    recipes: [
      { name: 'Local-Style Chicken Tofu (Can easily sub all Tofu)', source: 'Onolicious Hawaiʻi', url: 'https://onolicioushawaii.com/chicken-tofu/' },
    ],
    variations: [
      'Add jackfruit for "pulled pork" texture',
      'Use heart of palm instead of fish',
      'Add fermented black bean for umami',
    ],
    notes: '',
  },
  'grilled-mahi': {
    name: 'Grilled Mahi-Mahi with Macadamia Nut Crust',
    providedBy: '',
    isHostProvided: false,
    imageUrl: '/images/grilled-mahi.jpg',
    description: 'Fresh Hawaiian mahi-mahi encrusted with toasted macadamia nuts, pan-seared to golden perfection.',
    recipes: [
      { name: 'Macadamia Crusted Mahi Mahi', source: 'Keeping It Relle', url: 'https://keepingitrelle.com/macadamia-nut-crusted-mahi-mahi/' },
    ],
    variations: [
      'Add furikake to crust for extra flavor',
      'Serve with lilikoi beurre blanc',
      'Use Ono or Ahi as alternative',
    ],
    notes: '',
  },
  'poke-bowls': {
    name: 'Ahi Poke Bowls (Shoyu, Spicy Mayo, Limu)',
    providedBy: '',
    isHostProvided: false,
    imageUrl: '/images/poke-bowls.jpg',
    description: 'Fresh ahi tuna cubes in classic shoyu marinade with limu (seaweed), served over rice with toppings.',
    recipes: [
      { name: 'Hawaii-Style Ahi Poke', source: 'Onolicious Hawaiʻi', url: 'https://onolicioushawaii.com/what-is-poke/' },
      { name: 'Tako (Octopus) Poke', source: 'Onolicious Hawaiʻi', url: 'https://onolicioushawaii.com/tako-poke/' },
    ],
    variations: [
      'Shoyu (soy sauce, sesame oil, onion)',
      'Spicy mayo (sriracha + Kewpie mayo)',
      'Limu (ogo seaweed) + Hawaiian salt',
      'Add avocado, cucumber, edamame, tobiko',
    ],
    notes: '',
  },
  'lomi-salmon': {
    name: 'Lomi Lomi Salmon with Tomato & Onion',
    providedBy: '',
    isHostProvided: false,
    imageUrl: '/images/lomi-salmon.jpg',
    description: 'Salted salmon "massaged" (lomi) with diced tomato, sweet onion, and green onions - a refreshing Hawaiian staple.',
    recipes: [
      { name: 'Traditional Lomi Lomi Salmon', source: 'Onolicious Hawaiʻi', url: 'https://onolicioushawaii.com/lomi-lomi-salmon/' },
    ],
    variations: [
      'Use sushi-grade salmon for raw version',
      'Add cucumber for crunch',
      'Adjust saltiness by soaking salmon longer/shorter',
      'Add chili flakes for heat',
    ],
    notes: '',
  },
  'coconut-shrimp': {
    name: 'Coconut-Crusted Shrimp with Pineapple Dipping Sauce',
    providedBy: '',
    isHostProvided: false,
    imageUrl: '/images/coconut-shrimp.jpg',
    description: 'Jumbo shrimp coated in panko and sweet coconut, fried golden, served with tangy pineapple dipping sauce.',
    recipes: [
      { name: 'Baked Coconut Shrimp', source: 'Punchfork', url: 'https://www.punchfork.com/recipe/Whole30-Coconut-Crusted-Shrimp-with-Pineapple-Chili-Sauce-Food-Network' },
    ],
    variations: [
      'Add macadamia nuts to coconut crust',
      'Use tempura batter for lighter coating',
      'Pineapple sauce: pineapple juice, rice vinegar, chili, cornstarch',
    ],
    notes: '',
  },
  'manapua': {
    name: 'Char Siu Manapua (Steamed BBQ Pork Buns)',
    providedBy: '',
    isHostProvided: false,
    imageUrl: '/images/manapua.jpg',
    description: 'Fluffy steamed buns filled with sweet-savory Chinese BBQ pork (char siu) - a Hawaiian dim sum favorite.',
    recipes: [
      { name: 'Char Siu Bao (Steamed BBQ Pork Buns)', source: 'Woks of Life', url: 'https://thewoksoflife.com/steamed-bbq-pork-buns-char-siu-bao/' },
    ],
    variations: [
      'Use store-bought char siu to save time',
      'Add hard-boiled egg quarter inside',
      'Brush tops with honey water for shine',
      'Freeze well - steam from frozen',
    ],
    notes: '',
  },
  'poi': {
    name: 'Fresh Poi',
    providedBy: '',
    isHostProvided: false,
    imageUrl: '/images/poi.jpg',
    description: 'Pounded taro root (kalo) fermented to desired sourness - the starch of Hawaii.',
    recipes: [
      { name: 'How to Make Poi', source: 'Taste of Home', url: 'https://www.tasteofhome.com/article/what-is-poi/' },
    ],
    variations: [
      'One-finger, two-finger, three-finger consistency',
      'Fresh (sweet) vs. aged (sour) poi',
      'Mix with milk/sugar for breakfast',
    ],
    notes: 'Best sourced fresh from local taro farm or Hawaiian specialty market - hard to make from scratch without equipment',
  },
  'hawaiian-sweet-bread': {
    name: 'Hawaiian Sweet Bread (Portuguese Style)',
    providedBy: '',
    isHostProvided: false,
    imageUrl: '/images/hawaiian-sweet-bread.jpg',
    description: 'Soft, slightly sweet enriched bread - the famous "Portuguese sweet bread" beloved in Hawaii.',
    recipes: [
      { name: 'Portuguese Sweet Bread', source: 'King Arthur Baking', url: 'https://www.kingarthurbaking.com/recipes/portuguese-sweet-bread-recipe' },
    ],
    variations: [
      'Make as rolls or round loaf',
      'Add raisins or macadamia nuts',
      'Brush with butter + honey after baking',
    ],
    notes: '',
  },
  /*'rice': {
    name: 'Steamed White Rice (Calrose)',
    providedBy: '',
    isHostProvided: false,
    imageUrl: '/images/rice.jpg',
    description: 'Perfect sticky Calrose rice - the foundation of every Hawaiian plate lunch.',
    recipes: [
      { name: 'Perfect Rice Every Time', source: 'Just One Cookbook', url: 'https://www.justonecookbook.com/how-to-make-rice/' },
    ],
    variations: [
      'Rinse until water runs clear',
      'Use rice cooker for consistency',
      'Add pandan leaf for aroma',
    ],
    notes: 'Calrose or short-grain sticky rice is the local standard for plate lunches.',
  },*/
  'mac-salad': {
    name: 'Hawaiian Mac Salad (Best in the Islands)',
    providedBy: '',
    isHostProvided: false,
    imageUrl: '/images/mac-salad.jpg',
    description: 'Creamy elbow macaroni with mayo, grated carrot, onion, and the secret: letting it absorb overnight.',
    recipes: [
      { name: 'Authentic Hawaiian Macaroni Salad', source: 'Onolicious Hawaiʻi', url: 'https://onolicioushawaii.com/hawaiian-macaroni-salad/' },
    ],
    variations: [
      'Use Best Foods/Hellmann\'s mayo only',
      'Grate onion on microplane',
      'Make day ahead - crucial for texture',
      'Add peas or diced ham for variation',
    ],
    notes: '',
  },
  'baked-taro': {
    name: 'Baked Taro with Coconut Cream',
    providedBy: '',
    isHostProvided: false,
    imageUrl: '/images/baked-taro.jpg',
    description: 'Taro root baked until creamy, topped with rich coconut cream and a touch of sugar.',
    recipes: [
      { name: 'Kūlolo (Taro and Coconut Dessert)', source: 'Eat Bread Fruit', url: 'https://eatbreadfruit.com/blogs/recipes/kalo-taro-with-coconut-cream' },
    ],
    variations: [
      'Steam first, then bake for caramelization',
      'Add butter + brown sugar before coconut cream',
      'Top with toasted coconut flakes',
    ],
    notes: '',
  },
  'purple-sweet-potato': {
    name: 'Okinawan Purple Sweet Potato Mash',
    providedBy: '',
    isHostProvided: false,
    imageUrl: '/images/purple-sweet-potato.jpg',
    description: 'Vibrant purple Okinawan sweet potatoes mashed with butter, coconut milk, and a hint of vanilla.',
    recipes: [
      { name: 'Mashed Okinawan Sweet Potato', source: 'Cooking on the Weekends', url: 'https://cookingontheweekends.com/mashed-okinawan-sweet-potatoes/' },
    ],
    variations: [
      'Steam don\'t boil - preserves color & nutrients',
      'Add white miso for savory depth',
      'Pipe decoratively for presentation',
    ],
    notes: '',
  },
  'seaweed-salad': {
    name: 'Limu & Cucumber Seaweed Salad',
    providedBy: '',
    isHostProvided: false,
    imageUrl: '/images/seaweed-salad.jpg',
    description: 'Refreshing mix of ogo (seaweed), cucumber, sesame oil, rice vinegar, and chili flakes.',
    recipes: [
      { name: 'Hawaiian Seaweed Salad', source: 'Serious Eats', url: 'https://www.seriouseats.com/seaweed-salad-recipe' },
    ],
    variations: [
      'Use fresh ogo if available',
      'Add diced tomato & sweet onion',
      'Sprinkle furikake on top',
    ],
    notes: '',
  },
  'pineapple-rice': {
    name: 'Baked Pineapple Fried Rice in Pineapple Boat',
    providedBy: '',
    isHostProvided: false,
    imageUrl: '/images/pineapple-rice.jpg',
    description: 'Fragrant fried rice with pineapple chunks, shrimp, chicken, cashews, curry powder - served in a hollowed pineapple half.',
    recipes: [
      { name: 'Pineapple Fried Rice', source: 'Cookie and Kate', url: 'https://cookieandkate.com/thai-pineapple-fried-rice-recipe/' },
    ],
    variations: [
      'Use day-old jasmine rice',
      'Add raisins for sweetness',
      'Curry powder is key for color/flavor',
      'Serve in pineapple boat for wow factor',
    ],
    notes: '',
  },
  'haupia': {
    name: 'Haupia (Coconut Pudding Squares)',
    providedBy: '',
    isHostProvided: false,
    imageUrl: '/images/haupia.jpg',
    description: 'Traditional Hawaiian coconut pudding set with cornstarch/arrowroot - firm, creamy, not too sweet.',
    recipes: [
      { name: 'Authentic Haupia Recipe', source: 'Onolicious Hawaiʻi', url: 'https://onolicioushawaii.com/haupia/' },
    ],
    variations: [
      'Layer with chocolate for "haupia pie"',
      'Use arrowroot for clearer set',
      'Top with toasted macadamia nuts',
      'Add lilikoi (passion fruit) layer',
    ],
    notes: '',
  },
  'malasadas': {
    name: 'Leonard\'s Style Malasadas (Filled: Haupia, Custard, Lilikoi)',
    providedBy: '',
    isHostProvided: false,
    imageUrl: '/images/malasadas.jpg',
    description: 'Portuguese-style yeast donuts rolled in sugar, best served warm. Filled with haupia cream, vanilla custard, or lilikoi curd.',
    recipes: [
      { name: 'Indulge in Homemade Portuguese Sweet Bread with this Recipe', source: 'Ono Hawaiian Recipes', url: 'https://onohawaiianrecipes.com/recipes/portuguese-sweet-bread/' },
    ],
    variations: [
      'Fry at 350°F for golden exterior',
      'Fill with pastry bag after cooling',
      'Haupia filling: haupia + whipped cream',
      'Lilikoi curd: passion fruit + butter + eggs + sugar',
    ],
    notes: 'Best eaten same day - fry on site if possible!',
  },
  'mochi': {
    name: 'Butter Mochi & Mochi Ice Cream Assortment',
    providedBy: '',
    isHostProvided: false,
    imageUrl: '/images/mochi.jpg',
    description: 'Chewy coconut butter mochi bars (baked) + assortment of mochi ice cream (mango, green tea, strawberry, chocolate).',
    recipes: [
      { name: 'Local Sweets: Butter Mochi', source: 'Onolicious Hawaiʻi', url: 'https://onolicioushawaii.com/butter-mochi/' },
    ],
    variations: [
      'Butter mochi: mochiko flour, coconut milk, butter, eggs, sugar',
      'Add matcha powder for green tea version',
      'Mochi ice cream: buy assortment from Bubbies or Mikawaya',
    ],
    notes: '',
  },
  'guava-chiffon': {
    name: 'Guava Chiffon Cake',
    providedBy: '',
    isHostProvided: false,
    imageUrl: '/images/guava-chiffon.jpg',
    description: 'Light-as-air chiffon cake infused with guava puree - a Hawaiian bakery classic.',
    recipes: [
      { name: 'Hawaiian Guava Cake', source: 'Guava Rose', url: 'https://www.guavarose.com/2013/12/guava-chiffon-cake/' },
    ],
    variations: [
      'Use guava nectar or fresh puree',
      'Tube pan essential for chiffon rise',
      'Cool upside down to prevent collapse',
      'Glaze with guava jelly + water',
    ],
    notes: '',
  },
  'lilikoi-cheesecake': {
    name: 'Lilikoi (Passion Fruit) Cheesecake Bars',
    providedBy: '',
    isHostProvided: false,
    imageUrl: '/images/lilikoi-cheesecake.jpg',
    description: 'Creamy cheesecake bars with tangy lilikoi curd swirl on shortbread crust - tropical perfection.',
    recipes: [
      { name: 'Lilikoi Cheesecake', source: 'Punchfork', url: 'https://www.punchfork.com/recipe/Lilikoi-Cheesecake-Tart-with-Lilikoi-Glaze-The-Little-Ferraro-Kitchen' },
    ],
    variations: [
      'Use fresh lilikoi pulp (seeds and all)',
      'Shortbread crust: butter + flour + sugar',
      'Swirl curd before baking',
      'Chill overnight for clean slices',
    ],
    notes: '',
  },
  'fruit-platter': {
    name: 'Tropical Fruit Platter (Papaya, Mango, Pineapple, Lychee, Starfruit)',
    providedBy: '',
    isHostProvided: false,
    imageUrl: '/images/fruit-platter.jpg',
    description: 'Beautiful arrangement of Hawaii\'s finest tropical fruits - colorful, refreshing, and healthy.',
    recipes: [
      { name: 'Fruit Platter Presentation', source: 'Yummy Mmummy Kitchen', url: 'https://www.yummymummykitchen.com/2016/06/tropical-fruit.html' },
    ],
    variations: [
      'Include: papaya, mango, pineapple, lychee, starfruit, dragon fruit, rambutan',
      'Serve with li hing mui powder for dipping',
      'Add coconut yogurt dip',
      'Carve watermelon/pineapple as serving bowl',
    ],
    notes: '',
  },
  'mai-tai': {
    name: 'Classic Mai Tai (Orgeat, Orange Curaçao, Lime, Dark Rum)',
    providedBy: '',
    isHostProvided: false,
    imageUrl: '/images/mai-tai.jpg',
    description: 'The definitive tiki cocktail - aged rum, fresh lime, orgeat (almond syrup), orange curaçao, shaken not stirred.',
    recipes: [
      { name: 'Classic Mai Tai Recipe', source: 'Liquor.com', url: 'https://www.liquor.com/recipes/mai-tai/' },
    ],
    variations: [
      'Use Jamaican + Martinique rum blend',
      'Orgeat is essential - make or buy quality',
      'Float dark rum on top',
      'Garnish: mint sprig, lime wheel, orchid',
    ],
    notes: '',
  },
  'blue-hawaii': {
    name: 'Blue Hawaiʻi (Blue Curaçao, Pineapple, Vodka)',
    providedBy: '',
    isHostProvided: false,
    imageUrl: '/images/blue-hawaii.jpg',
    description: 'Iconic blue tropical cocktail - vodka, blue curaçao, pineapple juice, sweet & sour.',
    recipes: [
      { name: 'Blue Hawaii Cocktail', source: 'Liquor.com', url: 'https://www.liquor.com/recipes/blue-hawaii/' },
    ],
    variations: [
      'Blend with ice for frozen version',
      'Use white rum instead of vodka',
      'Add coconut cream for creamier texture',
    ],
    notes: '',
  },
  'pina-colada': {
    name: 'Fresh Piña Colada (Coconut Cream, Pineapple, White Rum)',
    providedBy: '',
    isHostProvided: false,
    imageUrl: '/images/pina-colada.jpg',
    description: 'The classic frozen cocktail - blended fresh pineapple, coconut cream, white rum, served in hurricane glass.',
    recipes: [
      { name: 'Perfect Piña Colada', source: 'Liquor.com', url: 'https://www.liquor.com/recipes/pina-colada/' },
    ],
    variations: [
      'Use fresh pineapple not juice',
      'Coco López cream of coconut is standard',
      'Blend with crushed ice',
      'Garnish: pineapple leaf, cherry, umbrella',
    ],
    notes: '',
  },
  'poi-smoothie': {
    name: 'Poi Banana Smoothies (Non-Alcoholic)',
    providedBy: '',
    isHostProvided: false,
    imageUrl: '/images/poi-smoothie.jpg',
    description: 'Unique Hawaiian smoothie - poi + banana + coconut milk + honey, surprisingly delicious and probiotic-rich.',
    recipes: [
      { name: 'Poi Smoothie Recipe', source: 'Hawaiʻi Nutritional Center', url: 'https://nutritioncenter.ctahr.hawaii.edu/poi-fruit-smoothie/' },
    ],
    variations: [
      'Add mango or pineapple',
      'Use kefir instead of coconut milk for extra probiotics',
      'Add protein powder for breakfast',
    ],
    notes: 'Kids love these! Great non-alcoholic option.',
  },
  'kona-coffee': {
    name: 'Coffee & Hot Tea Station',
    providedBy: '',
    isHostProvided: false,
    imageUrl: '/images/kona-coffee.jpg',
    description: 'Coffee (light & medium roast) + assortment of hot teas (jasmine, chamomile, mint).',
    recipes: [
      { name: 'How to Brew Coffee', source: 'Chemex', url: 'https://chemex-canada.ca/blogs/news/chemex-brew-guide' },
    ],
    variations: [
      'French press or pour-over for best flavor',
      'Mamaki tea: native Hawaiian herb, caffeine-free',
      'Offer oat, macadamia, coconut milk options',
    ],
    notes: '',
  },
  'guava-juice': {
    name: 'Fresh Guava Juice Bar',
    providedBy: '',
    isHostProvided: false,
    imageUrl: '/images/guava-juice.jpg',
    description: 'Fresh-pressed guava nectar and POG (Passion Orange Guava) - served over ice with sparkling water option.',
    recipes: [
      { name: 'Homemade POG Juice', source: 'That Girl Cooks Healthy', url: 'https://thatgirlcookshealthy.com/guava-juice-recipe/' },
    ],
    variations: [
      'Dilute with water or sparkling water',
      'Add li hing mui powder rim',
      'Make into popsicles for keiki',
    ],
    notes: '',
  },
  // ============ NEW POTLUCK SLOT ENTRIES ============
  // These are generic slot entries - guests enter their own dish name
  'appetizer-1': {
    name: 'Appetizer',
    providedBy: '',
    isHostProvided: false,
    description: 'Bring your favorite appetizer or pupu to share! Recipe ideas available when you sign up.',
    recipes: [],
    variations: [],
    notes: 'Click "Recipe Ideas" in the RSVP form for Hawaiian-inspired suggestions.',
    dietaryTags: [],
  },
  'appetizer-2': {
    name: 'Appetizer',
    providedBy: '',
    isHostProvided: false,
    description: 'Bring your favorite appetizer or pupu to share! Recipe ideas available when you sign up.',
    recipes: [],
    variations: [],
    notes: 'Click "Recipe Ideas" in the RSVP form for Hawaiian-inspired suggestions.',
    dietaryTags: [],
  },
  'hot-veggie-1': {
    name: 'Hot Veggie',
    providedBy: '',
    isHostProvided: false,
    description: 'Bring a hot vegetable dish to share! Recipe ideas available when you sign up.',
    recipes: [],
    variations: [],
    notes: 'Click "Recipe Ideas" in the RSVP form for Hawaiian-inspired suggestions.',
    dietaryTags: ['vegetarian', 'vegan', 'gluten-free'],
  },
  'starch-1': {
    name: 'Starch',
    providedBy: '',
    isHostProvided: false,
    description: 'Bring a starch side dish to share! Recipe ideas available when you sign up.',
    recipes: [],
    variations: [],
    notes: 'Click "Recipe Ideas" in the RSVP form for Hawaiian-inspired suggestions.',
    dietaryTags: [],
  },
  'starch-2': {
    name: 'Starch',
    providedBy: '',
    isHostProvided: false,
    description: 'Bring a starch side dish to share! Recipe ideas available when you sign up.',
    recipes: [],
    variations: [],
    notes: 'Click "Recipe Ideas" in the RSVP form for Hawaiian-inspired suggestions.',
    dietaryTags: [],
  },
  'dessert-1': {
    name: 'Dessert',
    providedBy: '',
    isHostProvided: false,
    description: 'Bring a dessert to share! Recipe ideas available when you sign up.',
    recipes: [],
    variations: [],
    notes: 'Click "Recipe Ideas" in the RSVP form for Hawaiian-inspired suggestions.',
    dietaryTags: [],
  },
  'dessert-2': {
    name: 'Dessert',
    providedBy: '',
    isHostProvided: false,
    description: 'Bring a dessert to share! Recipe ideas available when you sign up.',
    recipes: [],
    variations: [],
    notes: 'Click "Recipe Ideas" in the RSVP form for Hawaiian-inspired suggestions.',
    dietaryTags: [],
  },
};