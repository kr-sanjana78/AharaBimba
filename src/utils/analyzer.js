// AharaBimba Advanced Food Label Understanding Engine
// Multi-modal Analysis: Dates, Nutrition Extraction, Ingredient Plain-Language Explanations,
// Personalized Filters (Meesho-style), and Native Multilingual Voice Script Generation.

import { PERSONALIZED_FILTERS, INGREDIENT_EXPLANATIONS } from '../data/ingredientsData';

const MONTHS = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
  jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
  january: 0, february: 1, march: 2, april: 3, may: 4, june: 5,
  july: 6, august: 7, september: 8, october: 9, november: 10, december: 11
};

/**
 * Parses Dates from OCR text with support for Indian & Global packaged food date formats
 */
export function parseDateInformation(rawText) {
  if (!rawText || typeof rawText !== 'string') {
    return { expiryDate: null, mfgDate: null, hasDates: false };
  }

  const text = rawText.toUpperCase();

  const expPattern = /(?:EXP(?:IRY)?|EXP\.?\s*DATE|BEST\s*BEFORE|USE\s*BY|VALID\s*TILL|EXPIRES)[\s\:\-]+([0-9]{1,2}[\/\.\-][0-9]{1,2}[\/\.\-][0-9]{2,4}|[0-9]{1,2}\s+[A-Z]{3,9}\s+[0-9]{2,4}|[A-Z]{3,9}\s+[0-9]{2,4}|[0-9]{1,2}[\/\.\-][0-9]{2,4})/i;
  const mfgPattern = /(?:MFG(?:DATE)?|MFD|PKD|PACKED|PACKAGING\s*DATE|MFR)[\s\:\-]+([0-9]{1,2}[\/\.\-][0-9]{1,2}[\/\.\-][0-9]{2,4}|[0-9]{1,2}\s+[A-Z]{3,9}\s+[0-9]{2,4}|[A-Z]{3,9}\s+[0-9]{2,4}|[0-9]{1,2}[\/\.\-][0-9]{2,4})/i;

  const expMatch = text.match(expPattern);
  const mfgMatch = text.match(mfgPattern);

  const expiryInfo = expMatch ? interpretDateString(expMatch[1].trim(), 'EXPIRY') : null;
  const mfgInfo = mfgMatch ? interpretDateString(mfgMatch[1].trim(), 'MFG') : null;

  return {
    rawExpString: expMatch ? expMatch[0] : null,
    rawMfgString: mfgMatch ? mfgMatch[0] : null,
    expiryDate: expiryInfo,
    mfgDate: mfgInfo,
    hasDates: Boolean(expiryInfo || mfgInfo)
  };
}

function interpretDateString(dateStr, type) {
  const now = new Date();
  let parsedDate = null;
  let isAmbiguous = false;
  let formatDesc = '';

  const slashParts = dateStr.split(/[\/\.\-]/);
  if (slashParts.length === 3) {
    const p1 = parseInt(slashParts[0], 10);
    const p2 = parseInt(slashParts[1], 10);
    let yr = parseInt(slashParts[2], 10);
    if (yr < 100) yr += 2000;

    if (p1 <= 12 && p2 <= 12 && p1 !== p2) {
      isAmbiguous = true;
    }

    const day = p1;
    const month = p2 - 1;
    parsedDate = new Date(yr, month, day);
    formatDesc = 'DD/MM/YYYY';
  } else if (slashParts.length === 2) {
    const m = parseInt(slashParts[0], 10) - 1;
    let y = parseInt(slashParts[1], 10);
    if (y < 100) y += 2000;
    parsedDate = new Date(y, m + 1, 0); // End of month
    formatDesc = 'MM/YYYY';
  } else {
    const spaceParts = dateStr.toLowerCase().split(/\s+/);
    if (spaceParts.length >= 2) {
      let d = 28;
      let mName = '';
      let y = now.getFullYear();

      for (const part of spaceParts) {
        if (/^\d{1,2}$/.test(part)) {
          d = parseInt(part, 10);
        } else if (/^\d{4}$/.test(part)) {
          y = parseInt(part, 10);
        } else if (MONTHS[part] !== undefined) {
          mName = part;
        }
      }

      if (mName && MONTHS[mName] !== undefined) {
        parsedDate = new Date(y, MONTHS[mName], d);
        formatDesc = 'Month Year';
      }
    }
  }

  if (!parsedDate || isNaN(parsedDate.getTime())) {
    return {
      raw: dateStr,
      formatted: dateStr,
      status: 'unverified',
      isAmbiguous: true,
      message: 'Date format could not be verified automatically.'
    };
  }

  const diffMs = parsedDate.getTime() - now.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  let status = 'valid';
  let message = `Valid (${diffDays > 0 ? diffDays + ' days remaining' : 'Expires today'})`;

  if (type === 'EXPIRY') {
    if (diffDays < 0) {
      status = 'expired';
      message = `EXPIRED ${Math.abs(diffDays)} days ago! Do not consume.`;
    } else if (diffDays <= 30) {
      status = 'expiring_soon';
      message = `Expiring soon! Only ${diffDays} days left.`;
    } else {
      status = 'fresh';
      message = `Good to consume (${diffDays} days remaining)`;
    }
  }

  return {
    raw: dateStr,
    date: parsedDate,
    formatted: parsedDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    diffDays,
    status,
    isAmbiguous,
    formatDesc,
    message
  };
}

/**
 * Extracts Nutritional Values ONLY when reliably present on the label
 * Computes WHO / FSSAI Traffic Light Scores (Low, Medium, High)
 */
export function extractNutritionInformation(rawText) {
  if (!rawText) return { hasNutrition: false };

  const text = rawText.replace(/\r?\n/g, ' ');

  // 1. Calories / Energy (kcal)
  const energyMatch = text.match(/(?:energy|calories|caloric\s*value)[\s\:\-]*([0-9]+(?:\.[0-9]+)?)\s*(?:kcal|k\s*cal|calories)?/i);

  // 2. Total Sugars & Added Sugars (g)
  const sugarMatch = text.match(/(?:total\s*sugars?|sugars?)[\s\:\-]*([0-9]+(?:\.[0-9]+)?)\s*g/i);
  const addedSugarMatch = text.match(/(?:added\s*sugars?)[\s\:\-]*([0-9]+(?:\.[0-9]+)?)\s*g/i);

  // 3. Total Fat & Saturated Fat (g)
  const fatMatch = text.match(/(?:total\s*fat|fat)[\s\:\-]*([0-9]+(?:\.[0-9]+)?)\s*g/i);
  const satFatMatch = text.match(/(?:saturated\s*(?:fat|fatty\s*acids?))[\s\:\-]*([0-9]+(?:\.[0-9]+)?)\s*g/i);

  // 4. Sodium (mg) & Salt (g)
  const sodiumMatch = text.match(/(?:sodium)[\s\:\-]*([0-9]+(?:\.[0-9]+)?)\s*mg/i);
  const saltMatch = text.match(/(?:salt)[\s\:\-]*([0-9]+(?:\.[0-9]+)?)\s*g/i);

  // 5. Protein (g)
  const proteinMatch = text.match(/(?:protein)[\s\:\-]*([0-9]+(?:\.[0-9]+)?)\s*g/i);

  const hasAnyValue = Boolean(energyMatch || sugarMatch || fatMatch || sodiumMatch || proteinMatch);

  if (!hasAnyValue) {
    return {
      hasNutrition: false,
      message: 'Nutritional breakdown table was not detected on this part of the label.'
    };
  }

  const energy = energyMatch ? parseFloat(energyMatch[1]) : null;
  const sugar = sugarMatch ? parseFloat(sugarMatch[1]) : null;
  const addedSugar = addedSugarMatch ? parseFloat(addedSugarMatch[1]) : null;
  const fat = fatMatch ? parseFloat(fatMatch[1]) : null;
  const satFat = satFatMatch ? parseFloat(satFatMatch[1]) : null;

  let sodium = sodiumMatch ? parseFloat(sodiumMatch[1]) : null;
  if (!sodium && saltMatch) {
    // 1g salt ≈ 400mg sodium
    sodium = Math.round(parseFloat(saltMatch[1]) * 400);
  }
  const protein = proteinMatch ? parseFloat(proteinMatch[1]) : null;

  // Traffic Light Benchmarks (per 100g standard):
  // Sugar: High > 15g, Med 5-15g, Low <= 5g
  let sugarTraffic = 'unknown';
  if (sugar !== null) {
    sugarTraffic = sugar > 15 ? 'high' : sugar >= 5 ? 'medium' : 'low';
  }

  // Saturated Fat: High > 5g, Med 1.5-5g, Low <= 1.5g
  let satFatTraffic = 'unknown';
  if (satFat !== null) {
    satFatTraffic = satFat > 5 ? 'high' : satFat >= 1.5 ? 'medium' : 'low';
  } else if (fat !== null) {
    satFatTraffic = fat > 17.5 ? 'high' : fat >= 3 ? 'medium' : 'low';
  }

  // Sodium: High > 600mg, Med 120-600mg, Low <= 120mg
  let sodiumTraffic = 'unknown';
  if (sodium !== null) {
    sodiumTraffic = sodium > 600 ? 'high' : sodium >= 120 ? 'medium' : 'low';
  }

  return {
    hasNutrition: true,
    energy,
    sugar,
    addedSugar,
    sugarTraffic,
    fat,
    satFat,
    satFatTraffic,
    sodium,
    sodiumTraffic,
    protein
  };
}

/**
 * Identifies Major Ingredients and matches with Plain-Language Explanations
 */
export function identifyMajorIngredients(rawText) {
  if (!rawText) return [];

  const lowerText = rawText.toLowerCase();
  const detected = [];

  for (const [key, info] of Object.entries(INGREDIENT_EXPLANATIONS)) {
    // Regex boundary check
    const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(?:\\b|_)${escaped}(?:\\b|_|s|,|\\.)`, 'i');

    if (regex.test(lowerText)) {
      detected.push({
        keyword: key,
        simpleName: info.simpleName,
        explanation: info.explanation,
        category: info.category,
        healthImpact: info.healthImpact,
        isAllergen: info.isAllergen,
        isGluten: info.isGluten
      });
    }
  }

  return detected;
}

/**
 * Main Label Analysis Orchestrator
 */
export function analyzeLabelText(rawText, selectedFilterIds = []) {
  if (!rawText || rawText.trim().length < 8) {
    return {
      success: false,
      status: 'unclear',
      verdict: 'Could Not Identify Food Label',
      confidence: 10,
      reason: 'The uploaded image is blurry, poorly lit, or does not contain readable text. Please retake the photo or upload a clearer image.',
      rawText: rawText || '',
      flaggedWarnings: [],
      majorIngredients: [],
      nutrition: { hasNutrition: false },
      dateInfo: { hasDates: false },
      uncertaintyDisclaimer: 'Label text is insufficient. Do not consume without verifying physical packaging.',
      speechScripts: {
        'kn-IN': 'ಆಹಾರಬಿಂಬ: ಲೇಬಲ್ ಸ್ಪಷ್ಟವಾಗಿ ಓದಲು ಸಾಧ್ಯವಾಗುತ್ತಿಲ್ಲ. ದಯವಿಟ್ಟು ಬೆಳಕಿರುವ ಜಾಗದಲ್ಲಿ ಸ್ಪಷ್ಟವಾದ ಫೋಟೋ ತೆಗೆದುಕೊಳ್ಳಿ.',
        'hi-IN': 'आहारबिंब: लेबल स्पष्ट नहीं पढ़ा जा सका। कृपया अच्छी रोशनी में साफ़ फोटो लें या फिर से अपलोड करें।',
        'en-IN': 'AharaBimba: The food label could not be read clearly. Please retake the photo under good lighting or upload a sharper image.',
        'ta-IN': 'ஆஹாரபிம்பா: லேபிளை தெளிவாகப் படிக்க முடியவில்லை. தயவுசெய்து நல்ல வெளிச்சத்தில் தெளிவான புகைப்படம் எடுக்கவும்.',
        'te-IN': 'ఆహారబింబ: లేబుల్ స్పష్టంగా లేదు. దయచేసి మంచి వెలుతురులో స్పష్టమైన ఫోటో తీయండి.'
      }
    };
  }

  const normalizedText = rawText.toLowerCase();

  // 1. Date Analysis
  const dateInfo = parseDateInformation(rawText);

  // 2. Nutrition Analysis (extracted only when reliably present)
  const nutrition = extractNutritionInformation(rawText);

  // 3. Plain-Language Major Ingredient Breakdown
  const majorIngredients = identifyMajorIngredients(rawText);

  // 4. Personalized Filter Matching (Meesho-style filters)
  const flaggedWarnings = [];
  const safeFilters = [];

  for (const filter of PERSONALIZED_FILTERS) {
    const isSelected = selectedFilterIds.includes(filter.id);
    if (!isSelected) continue;

    const matchedAliases = [];

    // Check textual aliases
    for (const alias of filter.aliases) {
      const escaped = alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(?:\\b|_)${escaped}(?:\\b|_|s|,|\\.)`, 'i');
      if (regex.test(normalizedText)) {
        matchedAliases.push(alias);
      }
    }

    // Special condition: Diabetes filter checks numeric high sugar from nutrition
    const hasNutritionalHighSugar = filter.id === 'diabetes' && nutrition.hasNutrition && nutrition.sugarTraffic === 'high';
    // Special condition: High salt filter checks numeric high sodium from nutrition
    const hasNutritionalHighSodium = filter.id === 'high_salt' && nutrition.hasNutrition && nutrition.sodiumTraffic === 'high';

    const isTriggered = matchedAliases.length > 0 || hasNutritionalHighSugar || hasNutritionalHighSodium;

    if (isTriggered) {
      // Find context snippet if textual
      let contextSnippet = '';
      if (matchedAliases.length > 0) {
        const first = matchedAliases[0];
        const idx = normalizedText.indexOf(first);
        const start = Math.max(0, idx - 20);
        const end = Math.min(normalizedText.length, idx + first.length + 25);
        contextSnippet = `"...${rawText.substring(start, end).replace(/\n/g, ' ').trim()}..."`;
      }

      flaggedWarnings.push({
        filterId: filter.id,
        filterName: filter.name,
        icon: filter.icon,
        badgeColor: filter.badgeColor,
        warningMessage: filter.warningMessage,
        warningMessageKn: filter.warningMessageKn,
        warningMessageHi: filter.warningMessageHi,
        warningMessageTa: filter.warningMessageTa,
        warningMessageTe: filter.warningMessageTe,
        matchedKeywords: Array.from(new Set(matchedAliases)),
        contextSnippet,
        isNutritionalTrigger: hasNutritionalHighSugar || hasNutritionalHighSodium
      });
    } else {
      safeFilters.push({
        filterId: filter.id,
        filterName: filter.name,
        icon: filter.icon
      });
    }
  }

  // 5. OCR Confidence & Ambiguity Assessment
  const wordCount = rawText.split(/\s+/).filter((w) => w.length > 2).length;
  let confidence = Math.min(95, Math.max(30, Math.floor(wordCount * 2.1)));
  if (majorIngredients.length > 2 || dateInfo.hasDates || nutrition.hasNutrition) {
    confidence = Math.max(75, confidence);
  }

  // 6. Overall Status Verdict
  let status = 'clear'; // 'clear' | 'flagged' | 'warning' | 'unclear'
  let verdict = 'No Immediate Filter Concerns Detected';

  if (flaggedWarnings.length > 0) {
    status = 'flagged';
    verdict = `${flaggedWarnings.length} Dietary Filter Concern${flaggedWarnings.length > 1 ? 's' : ''} Detected`;
  } else if (dateInfo.expiryDate && dateInfo.expiryDate.status === 'expired') {
    status = 'warning';
    verdict = 'Attention: Product Has Expired';
  } else if (confidence < 40) {
    status = 'unclear';
    verdict = 'Label Information Incomplete or Uncertain';
  }

  // 7. Explicit Uncertainty & Safety Notice
  const uncertaintyDisclaimer =
    'Informational note: AharaBimba extracts readable text from your image. Never assume a product is 100% allergen-free or completely safe based only on incomplete label text. Always confirm physical packaging and manufacturer allergy notices.';

  // 8. Generate Local Voice Scripts in Kannada, Hindi, English, Tamil, and Telugu
  const speechScripts = generateMultiLanguageVoiceScripts({
    status,
    flaggedWarnings,
    majorIngredients,
    nutrition,
    dateInfo
  });

  return {
    success: true,
    status,
    verdict,
    confidence,
    rawText,
    flaggedWarnings,
    safeFilters,
    majorIngredients,
    nutrition,
    dateInfo,
    uncertaintyDisclaimer,
    speechScripts
  };
}

/**
 * Generates natural spoken explanations in Kannada, Hindi, English, Tamil, and Telugu
 * Strictly communicates:
 * 1. Major ingredients and what they mean
 * 2. Nutritional values (sugar, salt, fats)
 * 3. Potential allergens & dietary concerns
 * 4. Which selected filters triggered a warning and why
 * 5. Unclear or missing information disclaimer
 */
function generateMultiLanguageVoiceScripts({ status, flaggedWarnings, majorIngredients, nutrition, dateInfo }) {
  const ingNames = majorIngredients.slice(0, 4).map((i) => i.simpleName).join(', ');

  // Nutrition text
  let nutrEn = '';
  let nutrKn = '';
  let nutrHi = '';
  let nutrTa = '';
  let nutrTe = '';

  if (nutrition.hasNutrition) {
    const partsEn = [];
    const partsKn = [];
    const partsHi = [];
    const partsTa = [];
    const partsTe = [];

    if (nutrition.sugar !== null) {
      partsEn.push(`Sugar is ${nutrition.sugar} grams (${nutrition.sugarTraffic} level)`);
      partsKn.push(`ಸಕ್ಕರೆ ${nutrition.sugar} ಗ್ರಾಂ`);
      partsHi.push(`चीनी ${nutrition.sugar} ग्राम`);
      partsTa.push(`சர்க்கரை ${nutrition.sugar} கிராம்`);
      partsTe.push(`చక్కెర ${nutrition.sugar} గ్రాములు`);
    }
    if (nutrition.sodium !== null) {
      partsEn.push(`Sodium is ${nutrition.sodium} milligrams (${nutrition.sodiumTraffic} level)`);
      partsKn.push(`ಸೋಡಿಯಂ ${nutrition.sodium} ಮಿಲಿಗ್ರಾಂ`);
      partsHi.push(`सोडियम ${nutrition.sodium} मिलीग्राम`);
      partsTa.push(`சோடியம் ${nutrition.sodium} மில்லிகிராம்`);
      partsTe.push(`సోడియం ${nutrition.sodium} మిల్లీగ్రాములు`);
    }
    if (nutrition.fat !== null) {
      partsEn.push(`Total fat is ${nutrition.fat} grams`);
      partsKn.push(`ಒಟ್ಟು ಕೊಬ್ಬು ${nutrition.fat} ಗ್ರಾಂ`);
      partsHi.push(`कुल वसा ${nutrition.fat} ग्राम`);
      partsTa.push(`கொழுப்பு ${nutrition.fat} கிராம்`);
      partsTe.push(`మొత్తం కొవ్వు ${nutrition.fat} గ్రాములు`);
    }

    if (partsEn.length > 0) {
      nutrEn = `Nutritional values per 100 grams: ${partsEn.join(', ')}. `;
      nutrKn = `ಪ್ರತಿ 100 ಗ್ರಾಂಗೆ ಪೌಷ್ಟಿಕಾಂಶ ಮಾಹಿತಿ: ${partsKn.join(', ')}. `;
      nutrHi = `प्रति 100 ग्राम पोषण मूल्य: ${partsHi.join(', ')}। `;
      nutrTa = `100 கிராமுக்கான ஊட்டச்சத்து மதிப்பு: ${partsTa.join(', ')}. `;
      nutrTe = `ప్రతి 100 గ్రాములకు పోషక విలువలు: ${partsTe.join(', ')}. `;
    }
  }

  // Filter warnings
  const filterWarnsEn = flaggedWarnings.map((w) => w.warningMessage).join(' ');
  const filterWarnsKn = flaggedWarnings.map((w) => w.warningMessageKn).join(' ');
  const filterWarnsHi = flaggedWarnings.map((w) => w.warningMessageHi).join(' ');
  const filterWarnsTa = flaggedWarnings.map((w) => w.warningMessageTa).join(' ');
  const filterWarnsTe = flaggedWarnings.map((w) => w.warningMessageTe).join(' ');

  // Expiry date text
  let dateTextEn = '';
  let dateTextKn = '';
  let dateTextHi = '';
  let dateTextTa = '';
  let dateTextTe = '';

  if (dateInfo.expiryDate) {
    if (dateInfo.expiryDate.status === 'expired') {
      dateTextEn = `Warning: This product expired on ${dateInfo.expiryDate.formatted}. Do not consume. `;
      dateTextKn = `ಎಚ್ಚರಿಕೆ! ಉತ್ಪನ್ನವು ${dateInfo.expiryDate.formatted} ರಂದು ಮುಕ್ತಾಯಗೊಂಡಿದೆ. ಇದನ್ನು ಸೇವಿಸಬೇಡಿ. `;
      dateTextHi = `सावधान! यह उत्पाद ${dateInfo.expiryDate.formatted} को समाप्त हो चुका है। कृपया इसे न खाएं। `;
      dateTextTa = `எச்சரிக்கை! இந்த தயாரிப்பு ${dateInfo.expiryDate.formatted} அன்று காலாவதியாகிவிட்டது. உட்கொள்ள வேண்டாம். `;
      dateTextTe = `హెచ్చరిక! ఈ ఉత్పత్తి ${dateInfo.expiryDate.formatted} న ముగిసింది. దయచేసి తినవద్దు. `;
    } else {
      dateTextEn = `Best before ${dateInfo.expiryDate.formatted}, valid for ${dateInfo.expiryDate.diffDays} more days. `;
      dateTextKn = `ಉತ್ಪನ್ನವು ${dateInfo.expiryDate.formatted} ರವರೆಗೆ ಮಾನ್ಯವಾಗಿದೆ. ಇನ್ನೂ ${dateInfo.expiryDate.diffDays} ದಿನಗಳು ಬಾಕಿ ಇವೆ. `;
      dateTextHi = `समाप्ति तिथि ${dateInfo.expiryDate.formatted} है। यह अभी ${dateInfo.expiryDate.diffDays} दिनों तक सुरक्षित है। `;
      dateTextTa = `காலாவதி தேதி ${dateInfo.expiryDate.formatted}. இன்னும் ${dateInfo.expiryDate.diffDays} நாட்கள் உள்ளன. `;
      dateTextTe = `ఉపయోగ గడువు ${dateInfo.expiryDate.formatted}. ఇంకా ${dateInfo.expiryDate.diffDays} రోజులు మిగిలి ఉన్నాయి. `;
    }
  }

  // Kannada Speech (Model prompt example: “ಈ ಆಹಾರದಲ್ಲಿ ಸಕ್ಕರೆಯ ಪ್ರಮಾಣ ಹೆಚ್ಚಾಗಿದೆ ಎಂದು ಲೇಬಲ್ನಲ್ಲಿ ಕಾಣಿಸುತ್ತದೆ...”)
  let kn = '';
  let hi = '';
  let en = '';
  let ta = '';
  let te = '';

  if (status === 'flagged') {
    kn = `ನಮಸ್ಕಾರ! ಆಹಾರಬಿಂಬ ಆಹಾರ ಲೇಬಲ್ ವಿವರಣೆ: ${filterWarnsKn || 'ನೀವು ಗಮನಿಸಲು ಬಯಸಿದ ಅಂಶಗಳು ಈ ಉತ್ಪನ್ನದಲ್ಲಿ ಕಂಡುಬಂದಿವೆ.'} ${nutrKn}${dateTextKn}ಕಂಡುಬಂದ ಪ್ರಮುಖ ಪದಾರ್ಥಗಳು: ${ingNames || 'ಪ್ಯಾಕೆಟ್‌ನಲ್ಲಿ ನಮೂದಿಸಲಾಗಿದೆ'}. ಪ್ಯಾಕೆಟ್‌ನಲ್ಲಿರುವ ಸಂಪೂರ್ಣ ಮಾಹಿತಿಯನ್ನು ದಯವಿಟ್ಟು ಖಚಿತಪಡಿಸಿಕೊಳ್ಳಿ.`;
    hi = `नमस्ते! आहारबिंब खाद्य विश्लेषण: ${filterWarnsHi || 'इस उत्पाद में आपकी चुनी गई सावधानियां पाई गई हैं।'} ${nutrHi}${dateTextHi}पहचाने गए मुख्य घटक: ${ingNames || 'पैकेट पर सूचीबद्ध'}। कृपया उपभोग से पहले पैकेट की जांच करें।`;
    en = `Hello! AharaBimba Food Label Report. ${filterWarnsEn || 'Selected dietary concerns were detected in this product.'} ${nutrEn}${dateTextEn}Identified major ingredients: ${ingNames || 'listed on packaging'}. Please inspect original physical packaging before consuming.`;
    ta = `வணக்கம்! ஆஹாரபிம்பா உணவு அறிக்கை: ${filterWarnsTa || 'நீங்கள் சோதித்த எச்சரிக்கைகள் இந்த உணவில் உள்ளன.'} ${nutrTa}${dateTextTa}கண்டறியப்பட்ட முக்கிய பொருட்கள்: ${ingNames || 'பேக்கில் குறிப்பிடப்பட்டுள்ளது'}.`;
    te = `నమస్కారం! ఆహారబింబ ఆహార నివేదిక: ${filterWarnsTe || 'మీరు ఎంచుకున్న జాగ్రత్తలు ఇందులో గుర్తించబడ్డాయి.'} ${nutrTe}${dateTextTe}గుర్తించిన ముఖ్య పదార్థాలు: ${ingNames || 'ప్యాకెట్‌పై పేర్కొనబడింది'}.`;
  } else if (status === 'warning') {
    kn = `ಗಮನಿಸಿ! ${dateTextKn} ಲೇಬಲ್‌ನಲ್ಲಿ ಮುಕ್ತಾಯ ದಿನಾಂಕ ಅಥವಾ ಗುಣಮಟ್ಟದ ಎಚ್ಚರಿಕೆ ಕಂಡುಬಂದಿದೆ. ದಯವಿಟ್ಟು ಪ್ಯಾಕೆಟ್ ಪರಿಶೀಲಿಸಿ.`;
    hi = `ध्यान दें! ${dateTextHi} उत्पाद की समाप्ति तिथि समाप्त हो चुकी है। कृपया इसे न खाएं।`;
    en = `Attention! ${dateTextEn} Product shelf-life has elapsed or requires review. Please inspect physical packaging.`;
    ta = `கவனம்! ${dateTextTa} தயாரிப்பு காலாவதியாகிவிட்டது. எச்சரிக்கையுடன் இருக்கவும்.`;
    te = `గమనిక! ${dateTextTe} ఈ ఉత్పత్తి గడువు ముగిసింది. దయచేసి తినవద్దు.`;
  } else {
    // Clear
    kn = `ಉತ್ತಮ ಸುದ್ದಿ! ಆಹಾರಬಿಂಬ ಪರಿಶೀಲನೆ ಪ್ರಕಾರ, ನೀವು ಆಯ್ಕೆ ಮಾಡಿದ ಫಿಲ್ಟರ್‌ಗಳಿಗೆ ಈ ಆಹಾರ ಸೂಕ್ತವಾಗಿ ಕಂಡುಬರುತ್ತದೆ. ${nutrKn}${dateTextKn}ಪ್ರಮುಖ ಪದಾರ್ಥಗಳು: ${ingNames || 'ನೈಸರ್ಗಿಕ ಪದಾರ್ಥಗಳು'}. ಅಪೂರ್ಣ ಮುದ್ರಣವಿದ್ದರೆ ಪ್ಯಾಕೆಟ್ ಪರಿಶೀಲಿಸಿ.`;
    hi = `अच्छी खबर! आहारबिंब जांच के अनुसार, आपके द्वारा चुने गए आहार प्राथमिकताओं के अनुसार यह उत्पाद सुरक्षित प्रतीत होता है। ${nutrHi}${dateTextHi}मुख्य सामग्री: ${ingNames || 'प्राकृतिक घटक'}।`;
    en = `Great news! According to AharaBimba, no conflicts were found for your selected dietary filters. ${nutrEn}${dateTextEn}Key ingredients: ${ingNames || 'natural wholesome ingredients'}. Always confirm physical packaging if information appears incomplete.`;
    ta = `நல்ல செய்தி! நீங்கள் தேர்ந்தெடுத்த உணவு விருப்பங்களுக்கு இந்த தயாரிப்பு உகந்ததாக உள்ளது. ${nutrTa}${dateTextTa}முக்கிய பொருட்கள்: ${ingNames || 'இயற்கை பொருட்கள்'}.`;
    te = `మంచి వార్త! మీరు ఎంచుకున్న ఆహార ప్రాధాన్యతలకు ఈ ఆహారంలో ఎటువంటి ఆందోళనలు లేవు. ${nutrTe}${dateTextTe}ముఖ్య పదార్థాలు: ${ingNames || 'సహజ పదార్థాలు'}.`;
  }

  return {
    'kn-IN': kn,
    'hi-IN': hi,
    'en-IN': en,
    'ta-IN': ta,
    'te-IN': te
  };
}
