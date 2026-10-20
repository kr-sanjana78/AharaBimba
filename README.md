# AharaBimba (ಆಹಾರಬಿಂಬ) — Smart Food-Label Understanding Assistant

> **“AharaBimba — Know What You Eat, Before You Eat!”**  
> Modern, accessible, fully responsive website designed to help ordinary people understand packaged food labels without requiring technical or nutritional knowledge.

---

## 🎨 Visual Identity & Theme

- **Colour Combination:** Clean **white and blue** palette.
  - **Light Mode:** Crisp white background, rich royal blue headings (`#2563EB` / `#1D4ED8`), soft blue cards, and dark readable text.
  - **Dark Mode:** Deep navy background (`#020617` / `#0f172a`), lighter blue/navy cards, white text, and accessible contrast.
- **Theme Toggle:** Clearly visible button in the top navigation bar with smooth transition across all sections.
- **Aesthetics:** Smooth animations, subtle 3D elements (Three.js), rounded cards, and readable typography (`Outfit`, `Plus Jakarta Sans`, and `Noto Sans Kannada`).

---

## 🧭 Website Layout & Navigation

The navigation bar includes:
- **Home:** Hero section with problem statement and 3D food packaging visualizer.
- **Scan Food:** Direct scroll to the 3-stage interactive scanner wizard.
- **Food Filters:** Quick scroll to the Meesho-inspired personal dietary filter cards.
- **How It Works:** 3-stage breakdown of the process.
- **Language:** Instant access to multilingual voice explanation in 5 local languages.
- **Light / Dark Mode Switch:** One-click toggle between crisp white and deep navy modes.
- **Saved Scans Drawer:** View and restore previous label scans.

---

## 🚀 3 Main Stages Flow

### 1. CAPTURE IT — Scan or Upload

- **Option A: Capture Image**
  - Open device camera with live viewfinder.
  - Photograph food label with guide alignment.
  - Image preview with **Retake Photo** and **Remove** options.
- **Option B: Upload Image**
  - Select image from phone or computer.
  - Supports common formats: **JPG, JPEG, PNG**.
  - Image preview before analysis.
  - Dedicated **Upload Image** button and drag-and-drop support.
- **Instant Demo Shelf:** 5 one-click sample food packages (Chips, Energy Bar, Instant Noodles, Fruit Gummies, Ayurvedic Elixir) for immediate testing without taking photos.
- **Pre-Analysis Filters:** Select personal dietary preferences before running analysis.
- **OCR Engine:** Client-side optical character recognition powered by **Tesseract.js** with contrast enhancement.
- **Blurry / Unreadable Detection:** If image is blurry or text cannot be identified, the system alerts the user and offers 1-tap options to retake or upload a clearer photo.
- **“Understand My Food” Button:** Prominent call-to-action button to initiate analysis.

---

### 2. KNOW YOUR FOOD — Personalized Analysis

Results are presented in simple, colourful cards with everyday language:

- **Understand the Ingredients:**
  - Identifies major ingredients and explains what they mean in plain words.
  - Highlights sugar, salt (sodium), and saturated fats.
  - Nutrition table is displayed **only when reliably extracted** from the label (energy, sugar, fats, sodium with traffic-light badges).
- **Personalised Food Filters (Meesho-Style Cards & Switches):**
  - 🩺 **Diabetes / Sugar Awareness:** Flags added sucrose, corn syrup, invert syrup, and high sugar content.
  - 🛡️ **Food Allergies:** Alerts for peanuts, tree nuts, soy, eggs, and shellfish.
  - 🥛 **Lactose Intolerance:** Alerts for milk solids, whey, casein, cheese, and dairy derivatives.
  - 🌾 **Gluten-Free Preference:** Flags maida (refined wheat), atta, barley, rye, and malt.
  - 🟢 **Vegetarian Preference:** Detects animal gelatin, carmine (E120 cochineal), and animal fats.
  - 🌱 **Vegan Preference:** Flags dairy, honey, eggs, and animal-derived additives.
  - 🧂 **High-Salt / BP Awareness:** Flags high sodium, MSG (E621), and sodium preservatives.
- **Contextual Warnings with Exact Feedback:**
  - *“High sugar content detected. Check whether this product fits your dietary needs.”*
  - *“Allergen alert: Milk is listed in the ingredients.”*
- **Safety & Uncertainty Notice:** Clearly explains that filters are informational preferences, not medical diagnoses. If an ingredient cannot be confirmed from incomplete label text, the information remains uncertain.

---

### 3. LISTEN IN YOUR LANGUAGE — Local Voice Assistant

- **Prominent “Listen to Explanation” Button:** Full speech playback with live audio soundwave visualizer.
- **Supported Local Languages:**
  - 🇮🇳 **Kannada (ಕನ್ನಡ)**
  - 🇮🇳 **Hindi (हिन्दी)**
  - 🌐 **English**
  - 🇮🇳 **Tamil (தமிழ்)**
  - 🇮🇳 **Telugu (తెలుగు)**
- **What the Voice Explains:**
  - Major ingredients and what they mean.
  - Important nutritional highlights (sugar, salt, fats).
  - Potential allergens and dietary concerns.
  - Which selected filters triggered a warning and why.
  - Missing or unclear label information.
- **Example Kannada Explanation:**
  > *“ಈ ಆಹಾರದಲ್ಲಿ ಸಕ್ಕರೆಯ ಪ್ರಮಾಣ ಹೆಚ್ಚಾಗಿದೆ ಎಂದು ಲೇಬಲ್ನಲ್ಲಿ ಕಾಣಿಸುತ್ತದೆ. ನಿಮಗೆ ಮಧುಮೇಹ ಇದ್ದರೆ, ನಿಮ್ಮ ಆಹಾರ ನಿಯಮಗಳಿಗೆ ಇದು ಸೂಕ್ತವೇ ಎಂದು ಪರಿಶೀಲಿಸಿ.”*
- **Audio Controls:**
  - **Play** / **Pause** / **Replay** buttons.
  - Speed adjustments: **0.8x**, **1.0x**, **1.2x**.
  - Synchronized transcript displayed on screen in local script (`Noto Sans Kannada`).

---

## 🛠️ Technology Stack

| Technology | Purpose |
|------------|---------|
| **React 19** | Modern UI framework with hooks and reactive state |
| **Vite 8** | Ultra-fast build tool and development server |
| **Tailwind CSS v4** | Clean white and royal blue theme, dark mode styling |
| **Three.js** | Interactive 3D packaged food, laser scanning ring, and orbiting food elements |
| **Tesseract.js** | Client-side OCR extracting ingredients and nutrition from images |
| **Web Speech API** | Multilingual text-to-speech engine (Kannada, Hindi, English, Tamil, Telugu) |
| **Lucide React** | Clean, accessible iconography |
| **Canvas Confetti** | Celebration visual when a food passes all selected filters |

---

## 💻 Getting Started Locally

```bash
# 1. Install dependencies
npm install

# 2. Run the development server
npm run dev

# 3. Build for production
npm run build

# 4. Preview production build
npm run preview
```

Open `http://localhost:5173/` in your browser. No sign-in or account creation required!
