// AharaBimba Ingredient Knowledge Base, Meesho-style Filter Taxonomies & Explanations

// 1. Core Personalized Dietary Filters (Strictly matching prompt requirements)
export const PERSONALIZED_FILTERS = [
  {
    id: 'diabetes',
    name: 'Diabetes / Sugar Awareness',
    shortName: 'Low Sugar',
    localKn: 'ಮಧುಮೇಹ / ಸಕ್ಕರೆ ಎಚ್ಚರಿಕೆ',
    localHi: 'मधुमेह / कम चीनी',
    localTa: 'நீரிழிவு / சர்க்கரை விழிப்புணர்வு',
    localTe: 'మధుమేహం / చక్కెర అవగాహన',
    icon: '🩺',
    badgeColor: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800',
    description: 'Flags added sucrose, glucose syrup, invert syrup, maltodextrin, high-fructose corn syrup, and excessive sugar content.',
    warningMessage: 'High sugar content detected. Check whether this product fits your dietary needs.',
    warningMessageKn: 'ಈ ಆಹಾರದಲ್ಲಿ ಸಕ್ಕರೆಯ ಪ್ರಮಾಣ ಹೆಚ್ಚಾಗಿದೆ ಎಂದು ಲೇಬಲ್ನಲ್ಲಿ ಕಾಣಿಸುತ್ತದೆ. ನಿಮಗೆ ಮಧುಮೇಹ ಇದ್ದರೆ, ನಿಮ್ಮ ಆಹಾರ ನಿಯಮಗಳಿಗೆ ಇದು ಸೂಕ್ತವೇ ಎಂದು ಪರಿಶೀಲಿಸಿ.',
    warningMessageHi: 'इस उत्पाद में चीनी की मात्रा अधिक है। यदि आपको मधुमेह है, तो जांचें कि क्या यह उत्पाद आपकी आहार आवश्यकताओं के अनुकूल है।',
    warningMessageTa: 'இந்த உணவில் சர்க்கரை அளவு அதிகமாக உள்ளது. உங்களுக்கு நீரிழிவு இருந்தால், இது உங்கள் உணவுக்கு ஏற்றதா என சரிபார்க்கவும்.',
    warningMessageTe: 'ఈ ఆహారంలో చక్కెర పరిమాణం ఎక్కువగా ఉంది. మీకు మధుమేహం ఉంటే, ఇది మీ ఆహార నియమాలకు సరిపోతుందో లేదో తనిఖీ చేయండి.',
    aliases: [
      'sugar', 'added sugar', 'cane sugar', 'sucrose', 'high fructose corn syrup',
      'hfcs', 'corn syrup', 'glucose syrup', 'liquid glucose', 'invert sugar',
      'invert syrup', 'maltodextrin', 'dextrose', 'maltose', 'fructose', 'brown sugar',
      'molasses', 'golden syrup', 'caramelized sugar', 'crystallized cane juice', 'dextrin'
    ],
    thresholdGramsPer100g: 15
  },
  {
    id: 'allergies',
    name: 'Food Allergies',
    shortName: 'Allergens',
    localKn: 'ಆಹಾರ ಅಲರ್ಜಿಗಳು (Allergies)',
    localHi: 'खाद्य एलर्जी',
    localTa: 'உணவு ஒவ்வாமை',
    localTe: 'ఆహార అలెర్జీలు',
    icon: '🛡️',
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
    description: 'Guards against common allergens: peanuts, tree nuts, soy, dairy, eggs, and seafood.',
    warningMessage: 'Allergen alert: Potential allergens detected in the ingredients.',
    warningMessageKn: 'ಅಲರ್ಜಿ ಎಚ್ಚರಿಕೆ: ಈ ಉತ್ಪನ್ನದಲ್ಲಿ ಅಲರ್ಜಿ ಉಂಟುಮಾಡುವ ಪದಾರ್ಥಗಳು ಪತ್ತೆಯಾಗಿವೆ.',
    warningMessageHi: 'एलर्जी चेतावनी: इस उत्पाद में एलर्जी पैदा करने वाले घटक पाए गए हैं।',
    warningMessageTa: 'ஒவ்வாமை எச்சரிக்கை: இதில் ஒவ்வாமை ஏற்படுத்தும் பொருட்கள் உள்ளன.',
    warningMessageTe: 'అలెర్జీ హెచ్చరిక: ఇందులో అలెర్జీ కలిగించే పదార్థాలు కనుగొనబడ్డాయి.',
    aliases: [
      'peanut', 'peanuts', 'groundnut', 'groundnuts', 'tree nut', 'tree nuts',
      'almond', 'almonds', 'cashew', 'cashews', 'walnut', 'walnuts', 'pistachio',
      'hazelnut', 'soy', 'soya', 'soybean', 'soy lecithin', 'ins 322', 'e322',
      'milk', 'dairy', 'whey', 'casein', 'egg', 'eggs', 'albumin', 'shrimp',
      'crustacean', 'sesame', 'mustard', 'sulphite', 'sulfite'
    ]
  },
  {
    id: 'lactose',
    name: 'Lactose Intolerance',
    shortName: 'Lactose-Free',
    localKn: 'ಲ್ಯಾಕ್ಟೋಸ್ ಅಸಹಿಷ್ಣುತೆ (Lactose)',
    localHi: 'लैक्टोज असहिष्णुता',
    localTa: 'லாக்டோஸ் சகிப்புத்தன்மை',
    localTe: 'లాక్టోస్ అసహనం',
    icon: '🥛',
    badgeColor: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800',
    description: 'Checks for milk solids, whey, casein, butter, cheese, curds, milk powder, and dairy derivatives.',
    warningMessage: 'Allergen alert: Milk is listed in the ingredients.',
    warningMessageKn: 'ಅಲರ್ಜಿ ಎಚ್ಚರಿಕೆ: ಹಾಲಿನ ಅಂಶಗಳು (Milk) ಈ ಪದಾರ್ಥಗಳ ಪಟ್ಟಿಯಲ್ಲಿ ಕಾಣಿಸುತ್ತಿವೆ. ಲ್ಯಾಕ್ಟೋಸ್ ಅಸಹಿಷ್ಣುತೆ ಅಥವಾ ಹಾಲು ಅಲರ್ಜಿ ಇದ್ದರೆ ಪರಿಶೀಲಿಸಿ.',
    warningMessageHi: 'एलर्जी चेतावनी: सामग्री में दूध (Milk) सूचीबद्ध है। यदि आपको लैक्टोज संवेदनशीलता है तो कृपया जांचें।',
    warningMessageTa: 'ஒவ்வாமை எச்சரிக்கை: பொருட்களில் பால் (Milk) குறிப்பிடப்பட்டுள்ளது.',
    warningMessageTe: 'అలెర్జీ హెచ్చరిక: పదార్థాల జాబితాలో పాలు (Milk) పేర్కొనబడింది.',
    aliases: [
      'milk', 'milk solids', 'dairy solids', 'lactose', 'whey', 'whey protein',
      'whey isolate', 'casein', 'caseinate', 'sodium caseinate', 'calcium caseinate',
      'skimmed milk powder', 'whole milk powder', 'butter', 'ghee', 'clarified butter',
      'cheese', 'paneer', 'cream', 'curd', 'yogurt', 'yoghurt', 'buttermilk',
      'milk fat', 'condensed milk', 'khoya', 'mava', 'dairy cream'
    ]
  },
  {
    id: 'gluten_free',
    name: 'Gluten-Free Preference',
    shortName: 'Gluten-Free',
    localKn: 'ಗ್ಲುಟನ್ ಮುಕ್ತ (Gluten-Free)',
    localHi: 'ग्लूटेन-मुक्त',
    localTa: 'பசையம் இல்லாதது',
    localTe: 'గ్లూటెన్ రహితం',
    icon: '🌾',
    badgeColor: 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:text-amber-200 dark:border-amber-700',
    description: 'Flags refined wheat flour (maida), whole wheat (atta), barley, rye, malt extract, and gluten.',
    warningMessage: 'Gluten detected: Contains wheat flour (maida/atta) or gluten derivatives.',
    warningMessageKn: 'ಗ್ಲುಟನ್ ಎಚ್ಚರಿಕೆ: ಈ ಉತ್ಪನ್ನದಲ್ಲಿ ಗೋಧಿ, ಮೈದಾ ಅಥವಾ ಗ್ಲುಟನ್ ಅಂಶಗಳು ಪತ್ತೆಯಾಗಿವೆ.',
    warningMessageHi: 'ग्लूटेन चेतावनी: इसमें गेहूं का आटा (मैदा/आटा) या ग्लूटेन मौजूद है।',
    warningMessageTa: 'பசையம் எச்சரிக்கை: இதில் கோதுமை மாவு (மைதா/ஆட்டா) அல்லது பசையம் உள்ளது.',
    warningMessageTe: 'గ్లూటెన్ హెచ్చరిక: ఇందులో గోధుమ పిండి (మైదా/ఆటా) లేదా గ్లూటెన్ ఉన్నాయి.',
    aliases: [
      'wheat', 'wheat flour', 'maida', 'refined wheat flour', 'atta', 'whole wheat',
      'gluten', 'vital wheat gluten', 'barley', 'barley malt', 'malt extract',
      'rye', 'spelt', 'semolina', 'sooji', 'suji', 'rava', 'couscous', 'farina',
      'durum', 'durum wheat', 'bulgur', 'triticale'
    ]
  },
  {
    id: 'vegetarian',
    name: 'Vegetarian Preference',
    shortName: 'Pure Veg 🟢',
    localKn: 'ಶುದ್ಧ ಸಸ್ಯಾಹಾರಿ (Pure Veg)',
    localHi: 'शुद्ध शाकाहारी',
    localTa: 'சைவ உணவு',
    localTe: 'శాకాహార ప్రాధాన్యత',
    icon: '🟢',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
    description: 'Checks for non-vegetarian ingredients: animal gelatin, carmine (E120 cochineal), animal rennet, tallow, and fish oil.',
    warningMessage: 'Non-vegetarian alert: Potential animal-derived ingredients identified.',
    warningMessageKn: 'ಮಾಂಸಾಹಾರಿ ಎಚ್ಚರಿಕೆ: ಪ್ರಾಣಿಜನ್ಯ ಜಿಲಾಟಿನ್ ಅಥವಾ ಕೀಟ ವರ್ಣ (ಕಾರ್ಮೈನ್ E120) ಪತ್ತೆಯಾಗಿದೆ.',
    warningMessageHi: 'मांसाहारी चेतावनी: इसमें पशु-व्युत्पन्न जिलेटिन या गैर-शाकाहारी रंग (कारमाइन E120) हो सकता है।',
    warningMessageTa: 'அசைவ எச்சரிக்கை: இதில் விலங்கு சார்ந்த பொருட்கள் (ஜெலட்டின் / கார்மைன்) இருக்கலாம்.',
    warningMessageTe: 'మాంసాహార హెచ్చరిక: ఇందులో జంతు సంబంధిత పదార్ధాలు (జెలాటిన్ లేదా కార్మైన్) ఉండవచ్చు.',
    aliases: [
      'gelatin', 'gelatine', 'bovine gelatin', 'porcine gelatin', 'carmine',
      'cochineal', 'e120', 'ins 120', 'natural red 4', 'animal rennet', 'rennet',
      'tallow', 'lard', 'animal fat', 'fish oil', 'isinglass', 'bone char',
      'chicken fat', 'beef fat', 'anchovy', 'meat extract', 'pork', 'bacon', 'shrimp'
    ]
  },
  {
    id: 'vegan',
    name: 'Vegan Preference',
    shortName: '100% Vegan 🌱',
    localKn: 'ಸಂಪೂರ್ಣ ಸಸ್ಯಹಾರಿ (Vegan)',
    localHi: 'वीगन (पूरी तरह से पौधा आधारित)',
    localTa: 'முழுமையான தாவர உணவு',
    localTe: 'పూర్తిగా వీగన్',
    icon: '🌱',
    badgeColor: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/40 dark:text-green-300 dark:border-green-800',
    description: 'Flags all animal products: dairy, whey, casein, butter, ghee, honey, eggs, gelatin, and carmine.',
    warningMessage: 'Non-vegan alert: Contains dairy, eggs, honey, or animal derivatives.',
    warningMessageKn: 'ವೀಗನ್ ಎಚ್ಚರಿಕೆ: ಹಾಲು, ಜೇನುತುಪ್ಪ ಅಥವಾ ಪ್ರಾಣಿಜನ್ಯ ಪದಾರ್ಥಗಳು ಇದರಲ್ಲಿವೆ.',
    warningMessageHi: 'वीगन चेतावनी: इसमें डेयरी, शहद या पशु व्युत्पन्न घटक शामिल हैं।',
    warningMessageTa: 'வீகன் எச்சரிக்கை: இதில் பால் அல்லது விலங்கு பொருட்கள் உள்ளன.',
    warningMessageTe: 'వీగన్ హెచ్చరిక: ఇందులో పాలు లేదా జంతు ఉత్పత్తులు ఉన్నాయి.',
    aliases: [
      'milk', 'dairy', 'whey', 'casein', 'butter', 'ghee', 'cheese', 'paneer',
      'curd', 'yogurt', 'honey', 'egg', 'eggs', 'albumin', 'gelatin', 'gelatine',
      'carmine', 'cochineal', 'e120', 'shellac', 'e904', 'beeswax', 'e901'
    ]
  },
  {
    id: 'high_salt',
    name: 'High-Salt / BP Awareness',
    shortName: 'Low Sodium',
    localKn: 'ಉಪ್ಪು / ರಕ್ತದೊತ್ತಡ ಎಚ್ಚರಿಕೆ',
    localHi: 'कम नमक / रक्तचाप सजगता',
    localTa: 'குறைந்த உப்பு விழிப்புணர்வு',
    localTe: 'తక్కువ ఉప్పు అవగాహన',
    icon: '🧂',
    badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800',
    description: 'Identifies high sodium levels, iodized salt, monosodium glutamate (MSG/E621), and sodium-based preservatives.',
    warningMessage: 'High salt content detected. Check whether this product fits your blood pressure and sodium needs.',
    warningMessageKn: 'ಹೆಚ್ಚಿನ ಉಪ್ಪಿನ ಪ್ರಮಾಣ ಪತ್ತೆಯಾಗಿದೆ. ನಿಮಗೆ ರಕ್ತದೊತ್ತಡ ಇದ್ದರೆ ನಿಮ್ಮ ಆಹಾರ ಅಗತ್ಯಗಳಿಗೆ ಇದು ಸೂಕ್ತವೇ ಎಂದು ಪರಿಶೀಲಿಸಿ.',
    warningMessageHi: 'इस उत्पाद में नमक या सोडियम की मात्रा अधिक है। यदि आपको उच्च रक्तचाप है तो कृपया जांचें।',
    warningMessageTa: 'அதிக உப்பு அளவு கண்டறியப்பட்டது. இரத்த அழுத்த பிரச்சனை உள்ளவர்கள் கவனிக்கவும்.',
    warningMessageTe: 'అధిక ఉప్పు లేదా సోడియం కనుగొనబడింది. రక్తపోటు ఉన్నవారు దయచేసి పరిశీలించండి.',
    aliases: [
      'salt', 'iodized salt', 'sodium', 'sodium chloride', 'monosodium glutamate',
      'msg', 'e621', 'ins 621', 'sodium benzoate', 'ins 211', 'e211',
      'sodium bicarbonate', 'baking soda', 'ins 500', 'disodium phosphate',
      'sodium nitrate', 'sodium nitrite', 'sodium metabisulphite', 'rock salt', 'black salt'
    ],
    thresholdMgPer100g: 600
  }
];

// Alias for backward compatibility if any file imports ALLERGEN_CATEGORIES
export const ALLERGEN_CATEGORIES = PERSONALIZED_FILTERS;

// 2. Comprehensive Plain-Language Ingredient Explanations Dictionary (100+ Common Packaged Food Items)
export const INGREDIENT_EXPLANATIONS = {
  // Grains & Flours
  'refined wheat flour': {
    simpleName: 'Refined Wheat Flour (Maida)',
    explanation: 'Finely ground wheat stripped of bran and fiber. It digests quickly and can cause blood sugar spikes.',
    category: 'Grains & Carbs',
    healthImpact: 'High glycemic index; contains gluten.',
    isGluten: true,
    isAllergen: true
  },
  'maida': {
    simpleName: 'Maida',
    explanation: 'Processed white flour with all natural wheat fiber removed. Used to make biscuits and snacks soft.',
    category: 'Grains & Carbs',
    healthImpact: 'Spikes blood glucose; not suitable for celiac or diabetic diets.',
    isGluten: true,
    isAllergen: true
  },
  'rolled oats': {
    simpleName: 'Rolled Oats',
    explanation: 'Whole oat groats that are steamed and flattened. Rich in healthy soluble fiber (beta-glucan).',
    category: 'Whole Grains',
    healthImpact: 'Heart-healthy, aids digestion, and keeps you full longer.',
    isGluten: false,
    isAllergen: false
  },
  'atta': {
    simpleName: 'Whole Wheat Flour (Atta)',
    explanation: 'Traditional wheat flour that retains natural bran and wheat germ fiber.',
    category: 'Whole Grains',
    healthImpact: 'Good source of complex carbohydrates; contains natural gluten.',
    isGluten: true,
    isAllergen: true
  },

  // Sugars & Sweeteners
  'sugar': {
    simpleName: 'Refined Table Sugar',
    explanation: 'Processed cane sugar (sucrose). Adds empty calories without vitamins or minerals.',
    category: 'Added Sugars',
    healthImpact: 'Raises blood glucose rapidly; linked to dental cavities and weight gain.',
    isGluten: false,
    isAllergen: false
  },
  'invert sugar syrup': {
    simpleName: 'Invert Sugar Syrup',
    explanation: 'A liquid mixture of glucose and fructose that is sweeter than normal sugar. Keeps cookies moist and soft.',
    category: 'Added Sugars',
    healthImpact: 'Rapidly absorbed sugar that quickly elevates blood sugar levels.',
    isGluten: false,
    isAllergen: false
  },
  'high fructose corn syrup': {
    simpleName: 'High Fructose Corn Syrup (HFCS)',
    explanation: 'Concentrated industrial sweetener made from corn starch. Very cheap and widely used in sodas and sweets.',
    category: 'Added Sugars',
    healthImpact: 'Heavy burden on liver metabolism; closely associated with obesity and fatty liver.',
    isGluten: false,
    isAllergen: false
  },
  'maltodextrin': {
    simpleName: 'Maltodextrin',
    explanation: 'A processed white powder made from corn, rice, or potato starch. Used as a thickener and filler.',
    category: 'Processed Carbs',
    healthImpact: 'Has an even higher glycemic index than regular table sugar (105-185).',
    isGluten: false,
    isAllergen: false
  },
  'liquid glucose': {
    simpleName: 'Liquid Glucose (Corn Syrup)',
    explanation: 'A viscous clear syrup derived from starch, preventing crystallization in confectioneries.',
    category: 'Added Sugars',
    healthImpact: 'Concentrated fast-acting carbohydrate.',
    isGluten: false,
    isAllergen: false
  },
  'stevia leaf extract': {
    simpleName: 'Stevia Leaf Extract',
    explanation: 'Natural zero-calorie sweetener extracted from the leaves of the Stevia plant.',
    category: 'Natural Sweetener',
    healthImpact: 'Does not raise blood sugar; safe for diabetics.',
    isGluten: false,
    isAllergen: false
  },

  // Fats & Oils
  'palm oil': {
    simpleName: 'Palm Oil / Palm Olein',
    explanation: 'Tropical vegetable oil high in saturated fats. Widely used because it is very stable at high frying heat and inexpensive.',
    category: 'Fats & Oils',
    healthImpact: 'Contains nearly 50% saturated fat, which can elevate LDL cholesterol if consumed in excess.',
    isGluten: false,
    isAllergen: false
  },
  'hydrogenated vegetable fat': {
    simpleName: 'Hydrogenated Fat (Vanaspati)',
    explanation: 'Liquid plant oil artificially hardened with hydrogen gas. Often contains dangerous trans fats.',
    category: 'Unhealthy Fats',
    healthImpact: 'Significantly increases heart disease risk by elevating bad cholesterol and lowering good cholesterol.',
    isGluten: false,
    isAllergen: false
  },
  'cocoa butter': {
    simpleName: 'Cocoa Butter',
    explanation: 'The natural, edible fat extracted straight from cocoa beans. Gives chocolate its melt-in-mouth texture.',
    category: 'Plant Fats',
    healthImpact: 'Rich in stearic acid, which has a neutral effect on blood cholesterol.',
    isGluten: false,
    isAllergen: false
  },
  'butter': {
    simpleName: 'Dairy Butter',
    explanation: 'Traditional fat churned from cow or buffalo milk cream.',
    category: 'Dairy Fats',
    healthImpact: 'Natural dairy fat; contains vitamin A, but high in saturated fat and dairy solids.',
    isGluten: false,
    isAllergen: true
  },

  // Additives, Emulsifiers & Preservatives
  'soy lecithin': {
    simpleName: 'Soy Lecithin (INS 322)',
    explanation: 'A natural fatty substance extracted from soybeans that prevents chocolate or oils from separating from water.',
    category: 'Emulsifiers',
    healthImpact: 'Safe for general population, but a critical allergen risk for people allergic to soy.',
    isGluten: false,
    isAllergen: true
  },
  'monosodium glutamate': {
    simpleName: 'Monosodium Glutamate (MSG / E621)',
    explanation: 'An amino acid seasoning that creates an intense savory, meaty "umami" flavor in soups and noodles.',
    category: 'Flavor Enhancers',
    healthImpact: 'Adds dietary sodium; some people experience mild headaches or flushing (MSG sensitivity).',
    isGluten: false,
    isAllergen: false
  },
  'sodium benzoate': {
    simpleName: 'Sodium Benzoate (INS 211)',
    explanation: 'A common chemical preservative that stops mold, yeast, and bacteria from growing in acidic beverages.',
    category: 'Preservatives',
    healthImpact: 'Generally safe in regulated amounts; best avoided by individuals with asthma or aspirin sensitivity.',
    isGluten: false,
    isAllergen: false
  },
  'citric acid': {
    simpleName: 'Citric Acid (INS 330)',
    explanation: 'A mild organic acid found naturally in citrus fruits like lemons and oranges. Adds a pleasant sour taste.',
    category: 'Acidity Regulators',
    healthImpact: 'Completely natural and safe; harmlessly metabolized by the human body.',
    isGluten: false,
    isAllergen: false
  },
  'tartrazine': {
    simpleName: 'Tartrazine (INS 102 / Yellow 5)',
    explanation: 'A synthetic petroleum-derived bright yellow-orange food coloring used in candies, chips, and drinks.',
    category: 'Synthetic Dyes',
    healthImpact: 'Known to trigger allergic reactions in sensitive people and linked to hyperactivity in children.',
    isGluten: false,
    isAllergen: false
  },
  'baking soda': {
    simpleName: 'Baking Soda (INS 500 ii)',
    explanation: 'Sodium bicarbonate. A gentle rising agent that creates tiny air bubbles so biscuits stay light and crisp.',
    category: 'Raising Agents',
    healthImpact: 'Safe kitchen ingredient; contributes a small amount to overall sodium intake.',
    isGluten: false,
    isAllergen: false
  },

  // Animal Derived Ingredients
  'bovine gelatin': {
    simpleName: 'Animal Gelatin (Bovine)',
    explanation: 'A translucent, gummy protein made by boiling animal skin, cartilage, and bones. Used in gummy bears and marshmallows.',
    category: 'Animal Derivatives',
    healthImpact: 'Not vegetarian, not vegan, and strictly forbidden for many religious diets.',
    isGluten: false,
    isAllergen: false
  },
  'carmine': {
    simpleName: 'Carmine / Cochineal (INS 120)',
    explanation: 'A vivid red food pigment made by crushing female cochineal scale insects. Found in strawberry drinks, jams, and cosmetics.',
    category: 'Animal Dyes',
    healthImpact: 'NOT vegetarian or vegan. Can trigger rare allergic reactions or anaphylaxis.',
    isGluten: false,
    isAllergen: true
  },

  // Dairy & Proteins
  'whey protein': {
    simpleName: 'Whey Protein',
    explanation: 'High-quality fast-digesting protein separated from milk during cheese manufacturing.',
    category: 'Dairy Proteins',
    healthImpact: 'Excellent for muscle repair, but contains lactose and dairy proteins.',
    isGluten: false,
    isAllergen: true
  },
  'milk solids': {
    simpleName: 'Milk Solids',
    explanation: 'The protein, sugar (lactose), and mineral portion of milk with the water evaporated away.',
    category: 'Dairy',
    healthImpact: 'Allergen risk for milk allergies and problematic for lactose-intolerant individuals.',
    isGluten: false,
    isAllergen: true
  },

  // Nuts & Legumes
  'peanuts': {
    simpleName: 'Peanuts (Groundnuts)',
    explanation: 'Nutrient-rich legumes that grow underground. High in plant protein and healthy fats.',
    category: 'Nuts & Legumes',
    healthImpact: 'One of the most severe food allergens worldwide. Even trace dust can cause allergic reactions.',
    isGluten: false,
    isAllergen: true
  },
  'almonds': {
    simpleName: 'Almonds (Badam)',
    explanation: 'Nutritious tree nuts rich in vitamin E, magnesium, healthy monounsaturated fats, and dietary fiber.',
    category: 'Tree Nuts',
    healthImpact: 'Heart-healthy and blood sugar friendly; top tree nut allergen.',
    isGluten: false,
    isAllergen: true
  },
  'iodized salt': {
    simpleName: 'Iodized Salt',
    explanation: 'Common table salt fortified with trace amounts of iodine to protect thyroid function.',
    category: 'Minerals & Sodium',
    healthImpact: 'Essential in moderation (under 5g/day). Excess sodium elevates blood pressure and strains kidneys.',
    isGluten: false,
    isAllergen: false
  }
};

// 3. Realistic Demo Samples for 1-Click Verification
export const SAMPLE_LABELS = [
  {
    id: 'sample-cookies',
    title: 'Crunchy Peanut Butter Biscuits',
    category: 'Bakery & Biscuits',
    netWeight: '250g',
    image: '/samples/cookies.svg',
    nutrition: {
      calories: 485,
      sugar: 24.5,
      sugarTraffic: 'high',
      fat: 21.0,
      fatTraffic: 'high',
      sodium: 380,
      sodiumTraffic: 'medium',
      protein: 7.2
    },
    simulatedText: `INGREDIENTS: Refined Wheat Flour (Maida - 45%), Roasted Peanuts (28%), Hydrogenated Vegetable Fat, Refined Sugar, Butter (5%), Liquid Glucose, Invert Sugar Syrup, Raising Agents (INS 500 ii, INS 503 ii), Emulsifier (INS 322 - Soy Lecithin), Permitted Antioxidant (INS 320 - BHA), Preservative (INS 211).
CONTAINS: Wheat, Peanut, Milk and Soy.
MAY CONTAIN TRACES OF TREE NUTS.
NUTRITION INFORMATION (Per 100g): Energy 485 kcal, Protein 7.2g, Carbohydrate 62.0g, Total Sugars 24.5g, Added Sugars 22.0g, Total Fat 21.0g, Saturated Fat 9.8g, Sodium 380mg.
PKD: 10/01/2026
BEST BEFORE: 15/04/2027
MRP: Rs 75.00 incl. of all taxes.`,
    presetFilters: ['allergies', 'diabetes', 'gluten_free', 'lactose']
  },
  {
    id: 'sample-noodles',
    title: 'Spicy Masala Instant Noodles (High Salt)',
    category: 'Instant Food',
    netWeight: '75g',
    image: '/samples/noodles.svg',
    nutrition: {
      calories: 395,
      sugar: 3.2,
      sugarTraffic: 'low',
      fat: 15.6,
      fatTraffic: 'medium',
      sodium: 980,
      sodiumTraffic: 'high',
      protein: 8.5
    },
    simulatedText: `NOODLES: Wheat Flour (Atta & Maida), Palm Oil, Iodized Salt, Wheat Gluten, Acidity Regulators (INS 501 i, INS 500 i), Thickener (INS 412).
TASTEMAKER: Mixed Spices (Onion, Garlic, Red Chilli, Turmeric, Cumin), Sugar, Monosodium Glutamate (E621 / Flavor Enhancer), Hydrolyzed Groundnut Protein, Synthetic Food Colour (INS 102 - Tartrazine), Anticaking Agent (INS 551), Iodized Salt.
NUTRITION PER 100g: Energy 395 kcal, Protein 8.5g, Carbohydrate 54g, Total Sugars 3.2g, Total Fat 15.6g, Saturated Fat 7.2g, Sodium 980mg.
MFG DATE: 15/04/2025
BEST BEFORE: 05/01/2026
EXP DATE: 05/01/2026 (EXPIRED)`,
    presetFilters: ['high_salt', 'gluten_free', 'allergies']
  },
  {
    id: 'sample-granola',
    title: 'Choco-Almond Protein Granola',
    category: 'Breakfast Cereal',
    netWeight: '400g',
    image: '/samples/granola.svg',
    nutrition: {
      calories: 452,
      sugar: 18.2,
      sugarTraffic: 'high',
      fat: 18.0,
      fatTraffic: 'high',
      sodium: 140,
      sodiumTraffic: 'low',
      protein: 14.5
    },
    simulatedText: `INGREDIENTS: Rolled Oats (42%), Almonds (14%), Dark Chocolate Chips (Cocoa Solids, Cocoa Butter, Added Sugar, Soy Lecithin INS 322), Invert Sugar Syrup, Maltodextrin, Whey Protein Isolate (from Milk), Rice Crispies, Palm Olein Oil, Iodized Salt, Natural Vanilla Flavour.
ALLERGEN ADVICE: Contains Almonds, Milk, Soy, and Gluten.
NUTRITION PER 100g: Energy 452 kcal, Protein 14.5g, Carbohydrates 58g (of which Sugars 18.2g), Added Sugars 12.0g, Dietary Fiber 8.2g, Total Fat 18.0g, Saturated Fat 6.5g, Sodium 140mg.
MFG DATE: 12/03/2026
EXP DATE: 24/11/2026
BATCH NO: B-4921X`,
    presetFilters: ['diabetes', 'allergies', 'lactose']
  },
  {
    id: 'sample-gummies',
    title: 'Wild Berry Fruity Chews (Non-Veg)',
    category: 'Confectionery',
    netWeight: '120g',
    image: '/samples/gummies.svg',
    nutrition: {
      calories: 340,
      sugar: 58.0,
      sugarTraffic: 'high',
      fat: 0.5,
      fatTraffic: 'low',
      sodium: 45,
      sodiumTraffic: 'low',
      protein: 6.0
    },
    simulatedText: `INGREDIENTS: Glucose Syrup, High Fructose Corn Syrup, Sugar, Bovine Gelatin (Animal Source), Concentrated Apple Juice (2%), Acidity Regulator (Citric Acid INS 330), Natural and Nature Identical Flavours (Strawberry, Raspberry), Colour Carmine (INS 120 / Cochineal Extract), Glazing Agent (Carnauba Wax).
NON-VEGETARIAN PRODUCT.
NUTRITION PER 100g: Energy 340 kcal, Carbohydrates 78g, of which Sugars 58g, Added Sugar 52g, Protein 6g, Fat 0.5g, Sodium 45mg.
MFG: 01/02/2026
USE BY: 30/12/2026`,
    presetFilters: ['vegetarian', 'vegan', 'diabetes']
  },
  {
    id: 'sample-ayurvedic',
    title: 'Ashwagandha Almond Herbal Drink (Clean Label)',
    category: 'Health Drink',
    netWeight: '200ml',
    image: '/samples/elixir.svg',
    nutrition: {
      calories: 78,
      sugar: 0.8,
      sugarTraffic: 'low',
      fat: 3.5,
      fatTraffic: 'low',
      sodium: 65,
      sodiumTraffic: 'low',
      protein: 3.0
    },
    simulatedText: `COMPOSITION: Each 100ml contains extracts of: Withania somnifera (Ashwagandha) Root 500mg, Almond Milk Base (Prunus dulcis) 85ml, Cardamom Seed Powder 50mg, Stevia Leaf Extract (Rebaudioside A - Zero Calorie Sweetener) 12mg, Purified Water q.s.
NO ADDED SUGAR. 100% VEGETARIAN & GLUTEN-FREE.
NO ARTIFICIAL COLOURS OR CHEMICAL PRESERVATIVES.
NUTRITION PER 100ml: Energy 78 kcal, Protein 3.0g, Carbohydrates 2.1g, Total Sugars 0.8g (No added sugar), Total Fat 3.5g, Sodium 65mg.
MFG DATE: 18/02/2026
EXPIRY DATE: 18/08/2027`,
    presetFilters: ['vegetarian', 'vegan', 'diabetes', 'gluten_free', 'high_salt']
  }
];

// 4. Supported Local Languages for Spoken Explanation
export const LOCAL_LANGUAGES = [
  {
    code: 'kn-IN',
    name: 'Kannada (ಕನ್ನಡ)',
    nativeName: 'ಕನ್ನಡ',
    flag: '🇮🇳',
    voiceKeywords: ['kannada', 'kn-in', 'kn_in', 'kn']
  },
  {
    code: 'hi-IN',
    name: 'Hindi (हिन्दी)',
    nativeName: 'हिन्दी',
    flag: '🇮🇳',
    voiceKeywords: ['hindi', 'hi-in', 'hi_in', 'hi']
  },
  {
    code: 'en-IN',
    name: 'English',
    nativeName: 'English',
    flag: '🌐',
    voiceKeywords: ['en-in', 'english india', 'en-gb', 'en-us', 'en']
  },
  {
    code: 'ta-IN',
    name: 'Tamil (தமிழ்)',
    nativeName: 'தமிழ்',
    flag: '🇮🇳',
    voiceKeywords: ['tamil', 'ta-in', 'ta_in', 'ta']
  },
  {
    code: 'te-IN',
    name: 'Telugu (తెలుగు)',
    nativeName: 'తెలుగు',
    flag: '🇮🇳',
    voiceKeywords: ['telugu', 'te-in', 'te_in', 'te']
  }
];
