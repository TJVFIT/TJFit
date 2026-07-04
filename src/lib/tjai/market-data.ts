import type { QuizOption } from "@/lib/tjai-types";

/**
 * Curated grocery-localization dataset for TJAI.
 *
 * Country → real supermarket chains the user can pick in the quiz, plus
 * regional staple foods and a budget tip. The staples/tips feed the plan
 * generator and grocery-list prompts so meals and shopping lists are built
 * from foods the user can actually buy at the store they shop at.
 *
 * Values are stable snake_case slugs stored in quiz answers / profile_json —
 * never rename an existing value, only add.
 */

type CountryMarketData = {
  label: string;
  markets: QuizOption[];
  /** Cheap, high-protein-friendly staples that are genuinely local + affordable. */
  staples: string;
  budgetTip: string;
};

const LOCAL_MARKET = (label: string): QuizOption => ({ label, value: "local_market" });
const OTHER_MARKET: QuizOption = { label: "Somewhere else / it varies", value: "other_market" };

export const GENERIC_MARKETS: QuizOption[] = [
  { label: "A large supermarket", value: "local_supermarket" },
  { label: "A discount grocery chain", value: "discount_chain" },
  LOCAL_MARKET("A local market / bazaar"),
  { label: "Online groceries", value: "online_groceries" },
  OTHER_MARKET
];

const GENERIC_STAPLES =
  "eggs, chicken (thighs are usually cheapest), canned tuna or sardines, lentils and beans, rice, oats, potatoes, seasonal vegetables and fruit, plain yogurt";
const GENERIC_BUDGET_TIP =
  "Buy whatever protein is on rotation/discount that week and build meals around it; frozen vegetables are as nutritious as fresh and usually cheaper.";

export const MARKET_DATA: Record<string, CountryMarketData> = {
  us: {
    label: "United States",
    markets: [
      { label: "Walmart", value: "walmart" },
      { label: "Costco", value: "costco" },
      { label: "Kroger (or affiliate)", value: "kroger" },
      { label: "Aldi", value: "aldi" },
      { label: "Trader Joe's", value: "trader_joes" },
      { label: "Whole Foods", value: "whole_foods" },
      { label: "Target", value: "target" },
      OTHER_MARKET
    ],
    staples:
      "eggs, chicken breast/thighs, ground turkey, canned tuna, Greek yogurt, cottage cheese, rice, oats, frozen vegetables, beans, peanut butter",
    budgetTip:
      "Rotisserie chicken, store-brand Greek yogurt, and bagged frozen vegetables are the best protein-per-dollar plays; buy rice and oats in bulk."
  },
  uk: {
    label: "United Kingdom",
    markets: [
      { label: "Tesco", value: "tesco" },
      { label: "Sainsbury's", value: "sainsburys" },
      { label: "Asda", value: "asda" },
      { label: "Morrisons", value: "morrisons" },
      { label: "Aldi", value: "aldi" },
      { label: "Lidl", value: "lidl" },
      OTHER_MARKET
    ],
    staples:
      "eggs, chicken thighs, tinned tuna, baked beans, skyr/Greek-style yogurt, porridge oats, potatoes, frozen peas and mixed veg, wholemeal bread, lentils",
    budgetTip:
      "Supermarket own-brand and 'wonky' veg ranges cut costs ~30%; Aldi/Lidl protein (skyr, chicken) is consistently cheapest per gram of protein."
  },
  canada: {
    label: "Canada",
    markets: [
      { label: "Loblaws / No Frills", value: "loblaws_no_frills" },
      { label: "Walmart", value: "walmart" },
      { label: "Costco", value: "costco" },
      { label: "Sobeys / FreshCo", value: "sobeys_freshco" },
      { label: "Metro", value: "metro" },
      OTHER_MARKET
    ],
    staples:
      "eggs, chicken thighs, ground beef, canned tuna, Greek yogurt, oats, rice, lentils, frozen vegetables, peanut butter",
    budgetTip: "No Frills/FreshCo price-match flyers; Costco bulk chicken and Greek yogurt win on protein per dollar."
  },
  australia: {
    label: "Australia",
    markets: [
      { label: "Woolworths", value: "woolworths" },
      { label: "Coles", value: "coles" },
      { label: "Aldi", value: "aldi" },
      { label: "IGA", value: "iga" },
      OTHER_MARKET
    ],
    staples:
      "eggs, chicken thighs, kangaroo mince (very lean), canned tuna, Greek yogurt, oats, rice, sweet potato, frozen vegetables, legumes",
    budgetTip: "Late-evening markdowns on meat at Woolies/Coles; Aldi protein staples are reliably cheapest."
  },
  ireland: {
    label: "Ireland",
    markets: [
      { label: "Tesco", value: "tesco" },
      { label: "Dunnes Stores", value: "dunnes" },
      { label: "SuperValu", value: "supervalu" },
      { label: "Aldi", value: "aldi" },
      { label: "Lidl", value: "lidl" },
      OTHER_MARKET
    ],
    staples:
      "eggs, chicken fillets, tinned tuna, porridge oats, potatoes, Irish yogurt/skyr, frozen vegetables, wholemeal bread, beans and lentils",
    budgetTip: "Aldi/Lidl super-6 style produce deals and own-brand skyr keep protein and produce cheap."
  },
  turkey: {
    label: "Türkiye",
    markets: [
      { label: "BİM", value: "bim" },
      { label: "A101", value: "a101" },
      { label: "Şok", value: "sok" },
      { label: "Migros", value: "migros" },
      { label: "CarrefourSA", value: "carrefoursa" },
      LOCAL_MARKET("Semt pazarı (weekly bazaar)"),
      OTHER_MARKET
    ],
    staples:
      "eggs (yumurta), chicken thighs (but), red lentils (kırmızı mercimek), bulgur, yogurt and ayran, white cheese in moderation, canned tuna, sardines, chickpeas (nohut), seasonal pazar produce, oats (yulaf)",
    budgetTip:
      "The weekly semt pazarı is by far the cheapest for produce and eggs — shop near closing for extra discounts. BİM/A101 own-brand dairy and legumes beat big chains. Red meat is expensive; build protein around eggs, chicken, legumes, and dairy."
  },
  saudi_arabia: {
    label: "Saudi Arabia",
    markets: [
      { label: "Panda", value: "panda" },
      { label: "Al Othaim", value: "othaim" },
      { label: "Danube", value: "danube" },
      { label: "Tamimi", value: "tamimi" },
      { label: "Carrefour", value: "carrefour" },
      { label: "Lulu Hypermarket", value: "lulu" },
      OTHER_MARKET
    ],
    staples:
      "eggs, chicken (whole birds are cheapest), frozen fish, laban and yogurt, lentils, chickpeas, rice, oats, dates (portion-controlled), cucumbers and tomatoes",
    budgetTip:
      "Othaim/Panda weekend offers on bulk chicken; frozen fish is far cheaper than fresh. Dates are great pre-workout carbs — count them, they're calorie-dense."
  },
  uae: {
    label: "United Arab Emirates",
    markets: [
      { label: "Carrefour", value: "carrefour" },
      { label: "Lulu Hypermarket", value: "lulu" },
      { label: "Union Coop", value: "union_coop" },
      { label: "Spinneys", value: "spinneys" },
      { label: "Nesto", value: "nesto" },
      OTHER_MARKET
    ],
    staples:
      "eggs, chicken, frozen fish, laban and Greek yogurt, lentils, chickpeas, rice, oats, frozen vegetables, seasonal produce from the vegetable souq",
    budgetTip: "Lulu/Nesto bulk chicken and rice deals; the fruit & vegetable souq beats supermarkets on produce."
  },
  egypt: {
    label: "Egypt",
    markets: [
      { label: "Kazyon", value: "kazyon" },
      { label: "Carrefour", value: "carrefour" },
      { label: "Spinneys", value: "spinneys" },
      { label: "Metro Market", value: "metro_market" },
      LOCAL_MARKET("Local souq / street market"),
      OTHER_MARKET
    ],
    staples:
      "eggs, chicken, ful medames (fava beans), lentils, koshari components (rice, pasta, lentils — portioned), baladi bread in moderation, white cheese, frozen vegetables, canned tuna",
    budgetTip:
      "Ful and lentils are the cheapest protein base in the country — pair with eggs or chicken to hit protein targets. Kazyon for pantry staples, souq for produce."
  },
  iraq: {
    label: "Iraq",
    markets: [
      LOCAL_MARKET("Local souq / bazaar"),
      { label: "Carrefour (malls)", value: "carrefour" },
      { label: "Neighborhood supermarket", value: "local_supermarket" },
      OTHER_MARKET
    ],
    staples:
      "eggs, chicken, lentils, chickpeas, rice (timman), bulgur, yogurt and laban, dates (portion-controlled), seasonal souq produce, canned tuna",
    budgetTip:
      "The souq is cheapest for produce, eggs, and legumes; buy rice and lentils in large bags. Build protein around eggs, chicken, yogurt, and legumes — red meat only when the budget allows."
  },
  jordan: {
    label: "Jordan",
    markets: [
      { label: "Carrefour", value: "carrefour" },
      { label: "Sameh Mall", value: "sameh_mall" },
      { label: "Cozmo", value: "cozmo" },
      LOCAL_MARKET("Local souq"),
      OTHER_MARKET
    ],
    staples:
      "eggs, chicken, lentils, chickpeas (hummus base), ful, labneh and yogurt, rice, bulgur, olive oil (measured), seasonal produce",
    budgetTip: "Souq produce midweek is cheapest; legumes + labneh keep protein affordable."
  },
  kuwait: {
    label: "Kuwait",
    markets: [
      { label: "Co-op Society (Jam'iya)", value: "coop_society" },
      { label: "Lulu Hypermarket", value: "lulu" },
      { label: "Carrefour", value: "carrefour" },
      { label: "The Sultan Center", value: "sultan_center" },
      OTHER_MARKET
    ],
    staples:
      "eggs, chicken, frozen fish, laban and yogurt, lentils, rice, oats, frozen vegetables, cucumbers and tomatoes",
    budgetTip: "Your district co-op (jam'iya) is usually cheapest for staples; check its weekly offers first."
  },
  qatar: {
    label: "Qatar",
    markets: [
      { label: "Al Meera", value: "al_meera" },
      { label: "Lulu Hypermarket", value: "lulu" },
      { label: "Carrefour", value: "carrefour" },
      { label: "Monoprix", value: "monoprix" },
      OTHER_MARKET
    ],
    staples:
      "eggs, chicken, frozen fish, laban and yogurt, lentils, chickpeas, rice, oats, frozen vegetables",
    budgetTip: "Al Meera neighborhood branches for staples; Lulu bulk deals on chicken and rice."
  },
  morocco: {
    label: "Morocco",
    markets: [
      { label: "Marjane", value: "marjane" },
      { label: "Carrefour", value: "carrefour" },
      { label: "BIM", value: "bim" },
      LOCAL_MARKET("Souk hebdomadaire"),
      OTHER_MARKET
    ],
    staples:
      "eggs, chicken, sardines (extremely cheap and protein-rich), lentils, chickpeas, couscous/semolina (portioned), khobz in moderation, seasonal souk produce, olives and olive oil (measured)",
    budgetTip:
      "Fresh sardines are the best protein-per-dirham in the country. The weekly souk beats supermarkets on produce; BIM for pantry basics."
  },
  spain: {
    label: "Spain",
    markets: [
      { label: "Mercadona", value: "mercadona" },
      { label: "Carrefour", value: "carrefour" },
      { label: "Lidl", value: "lidl" },
      { label: "Dia", value: "dia" },
      { label: "Alcampo", value: "alcampo" },
      OTHER_MARKET
    ],
    staples:
      "eggs (huevos), chicken and turkey (pechuga/contramuslos), canned tuna (atún al natural), sardines, lentils (lentejas), chickpeas (garbanzos), rice, potatoes, seasonal produce, yogur natural/queso fresco",
    budgetTip:
      "Mercadona's Hacendado line (tuna, yogur, legumbres en bote) is the cheapest clean protein; jarred legumes save cooking time for the same price."
  },
  mexico: {
    label: "Mexico",
    markets: [
      { label: "Bodega Aurrerá / Walmart", value: "bodega_aurrera" },
      { label: "Soriana", value: "soriana" },
      { label: "Chedraui", value: "chedraui" },
      { label: "Costco", value: "costco" },
      LOCAL_MARKET("Mercado local / tianguis"),
      OTHER_MARKET
    ],
    staples:
      "eggs (huevo), chicken (pierna y muslo), beans (frijol), corn tortillas (portioned), rice, nopales, canned tuna, queso panela, seasonal mercado produce, avocado (measured)",
    budgetTip:
      "Eggs + beans + tortilla is the cheapest complete-protein base; the tianguis beats supermarkets on produce. Choose panela over oaxaca/manchego to keep fat calories in check."
  },
  argentina: {
    label: "Argentina",
    markets: [
      { label: "Coto", value: "coto" },
      { label: "Carrefour", value: "carrefour" },
      { label: "Día", value: "dia" },
      { label: "Jumbo", value: "jumbo" },
      LOCAL_MARKET("Mercado / verdulería del barrio"),
      OTHER_MARKET
    ],
    staples:
      "eggs, chicken, cheaper beef cuts (roast beef, paleta — lean when trimmed), lentils, rice, oats (avena), yogur natural, seasonal verdulería produce",
    budgetTip:
      "The barrio verdulería and carnicería usually beat hypermarkets; ask for lean cuts trimmed. Watch liquid calories from mate cocido with sugar."
  },
  colombia: {
    label: "Colombia",
    markets: [
      { label: "Éxito", value: "exito" },
      { label: "D1", value: "d1" },
      { label: "Ara", value: "ara" },
      { label: "Olímpica", value: "olimpica" },
      LOCAL_MARKET("Plaza de mercado"),
      OTHER_MARKET
    ],
    staples:
      "eggs, chicken, beans (frijol), lentils, rice, plantain (portioned), canned tuna, queso campesino, seasonal plaza produce, arepas in moderation",
    budgetTip: "D1/Ara for pantry staples at hard-discount prices; the plaza de mercado for produce and eggs."
  },
  chile: {
    label: "Chile",
    markets: [
      { label: "Líder", value: "lider" },
      { label: "Jumbo", value: "jumbo" },
      { label: "Santa Isabel", value: "santa_isabel" },
      { label: "Unimarc", value: "unimarc" },
      LOCAL_MARKET("Feria libre"),
      OTHER_MARKET
    ],
    staples:
      "eggs, chicken, jurel (canned mackerel — cheap and high-protein), lentils, chickpeas, rice, oats, seasonal feria produce, yogur natural",
    budgetTip: "The feria libre is dramatically cheaper for produce; canned jurel is the best protein-per-peso."
  },
  france: {
    label: "France",
    markets: [
      { label: "E.Leclerc", value: "leclerc" },
      { label: "Carrefour", value: "carrefour" },
      { label: "Intermarché", value: "intermarche" },
      { label: "Auchan", value: "auchan" },
      { label: "Lidl", value: "lidl" },
      { label: "Monoprix", value: "monoprix" },
      OTHER_MARKET
    ],
    staples:
      "œufs, escalopes/hauts de cuisse de poulet, thon en boîte, sardines, fromage blanc 0% (excellent protein), lentilles, pois chiches, riz, flocons d'avoine, légumes surgelés, yaourt nature",
    budgetTip:
      "Fromage blanc and œufs are the cheapest quality proteins; Leclerc/Lidl own-brand tinned fish and frozen vegetables keep costs down."
  },
  belgium: {
    label: "Belgium",
    markets: [
      { label: "Colruyt", value: "colruyt" },
      { label: "Delhaize", value: "delhaize" },
      { label: "Carrefour", value: "carrefour" },
      { label: "Aldi", value: "aldi" },
      { label: "Lidl", value: "lidl" },
      OTHER_MARKET
    ],
    staples:
      "eggs, chicken fillet, tinned tuna, fromage blanc/plattekaas, lentils, oats, potatoes, frozen vegetables, rice",
    budgetTip: "Colruyt's lowest-price guarantee makes it the default; plattekaas is the cheap protein workhorse."
  },
  germany: {
    label: "Germany",
    markets: [
      { label: "Aldi", value: "aldi" },
      { label: "Lidl", value: "lidl" },
      { label: "Rewe", value: "rewe" },
      { label: "Edeka", value: "edeka" },
      { label: "Kaufland", value: "kaufland" },
      OTHER_MARKET
    ],
    staples:
      "eggs, chicken, Magerquark (the best cheap protein in Germany), tinned tuna, lentils, oats (Haferflocken), rice, potatoes, frozen vegetables, whole-grain bread in moderation",
    budgetTip: "Magerquark + Haferflocken is the classic budget bulking/cutting base; Aldi/Lidl own brands win on price."
  },
  netherlands: {
    label: "Netherlands",
    markets: [
      { label: "Albert Heijn", value: "albert_heijn" },
      { label: "Jumbo", value: "jumbo" },
      { label: "Lidl", value: "lidl" },
      { label: "Aldi", value: "aldi" },
      { label: "Plus", value: "plus" },
      OTHER_MARKET
    ],
    staples:
      "eggs, chicken, kwark (quark — cheap high protein), tinned tuna, lentils, oats, potatoes, frozen vegetables, brown bread in moderation",
    budgetTip: "Kwark and AH/Jumbo own-brand chicken are the staples; bonus/aanbieding cycles reward flexible protein choice."
  },
  india: {
    label: "India",
    markets: [
      { label: "DMart", value: "dmart" },
      { label: "Reliance Fresh / Smart", value: "reliance" },
      { label: "BigBasket (online)", value: "bigbasket" },
      { label: "More Supermarket", value: "more" },
      LOCAL_MARKET("Local mandi / kirana store"),
      OTHER_MARKET
    ],
    staples:
      "eggs, chicken (where eaten), paneer, dal (toor/moong/masoor — the protein backbone), chana, rajma, curd/dahi, rice, atta rotis (portioned), oats, seasonal mandi vegetables, soya chunks (extremely high protein per rupee)",
    budgetTip:
      "Soya chunks and dal are the best protein-per-rupee; eggs where acceptable. The mandi beats supermarkets on produce. Watch cooking oil quantity — it's the hidden calorie source in most Indian kitchens."
  },
  pakistan: {
    label: "Pakistan",
    markets: [
      { label: "Imtiaz", value: "imtiaz" },
      { label: "Carrefour", value: "carrefour" },
      { label: "Metro", value: "metro" },
      { label: "Al-Fatah", value: "al_fatah" },
      LOCAL_MARKET("Local bazaar / kiryana store"),
      OTHER_MARKET
    ],
    staples:
      "eggs, chicken, daal (masoor/moong/chana), chana, dahi (yogurt), rice, atta rotis (portioned), seasonal bazaar vegetables, canned tuna where available",
    budgetTip:
      "Daal + eggs + dahi is the affordable protein base; the bazaar is cheapest for produce. Measure ghee/oil — it decides whether the same curry is a cut or a bulk."
  },
  nigeria: {
    label: "Nigeria",
    markets: [
      { label: "Shoprite", value: "shoprite" },
      { label: "Spar", value: "spar" },
      { label: "Justrite", value: "justrite" },
      LOCAL_MARKET("Local open-air market"),
      OTHER_MARKET
    ],
    staples:
      "eggs, chicken, mackerel/titus fish, beans (the protein backbone), moi moi/akara base, rice, garri and fufu (strictly portioned), groundnuts (measured), seasonal market vegetables, plantain (portioned)",
    budgetTip:
      "Beans, eggs, and titus fish are the best protein value; the open-air market beats supermarkets on almost everything. Swallow portions (garri/fufu) are where calories hide — measure them."
  },
  philippines: {
    label: "Philippines",
    markets: [
      { label: "SM Supermarket", value: "sm" },
      { label: "Puregold", value: "puregold" },
      { label: "Robinsons", value: "robinsons" },
      { label: "WalterMart", value: "waltermart" },
      LOCAL_MARKET("Palengke (wet market)"),
      OTHER_MARKET
    ],
    staples:
      "eggs, chicken, bangus and tilapia (cheap fish protein), canned tuna/sardines, monggo (mung beans), rice (measured — the main calorie lever), seasonal palengke vegetables, tofu",
    budgetTip:
      "The palengke wins on fish, eggs, and produce. Rice portions decide the diet — measure cups, don't eyeball. Canned sardines in tomato are a legit cheap protein."
  },
  other: {
    label: "Somewhere else",
    markets: GENERIC_MARKETS,
    staples: GENERIC_STAPLES,
    budgetTip: GENERIC_BUDGET_TIP
  }
};

export const TJAI_COUNTRY_OPTIONS: QuizOption[] = Object.entries(MARKET_DATA).map(([value, data]) => ({
  label: data.label,
  value
}));

export function normalizeCountry(raw: unknown): string {
  const value = typeof raw === "string" ? raw.trim().toLowerCase() : "";
  return MARKET_DATA[value] ? value : "other";
}

export function getMarketQuizOptions(country: unknown): QuizOption[] {
  return MARKET_DATA[normalizeCountry(country)].markets;
}

export function normalizeMarket(country: unknown, raw: unknown): string {
  const value = typeof raw === "string" ? raw.trim().toLowerCase() : "";
  const markets = getMarketQuizOptions(country);
  return markets.some((option) => option.value === value) ? value : "other_market";
}

export function countryLabel(country: unknown): string {
  return MARKET_DATA[normalizeCountry(country)].label;
}

export function marketLabel(country: unknown, market: unknown): string {
  const normalizedMarket = normalizeMarket(country, market);
  const match = getMarketQuizOptions(country).find((option) => option.value === normalizedMarket);
  return match ? match.label : "their usual store";
}

/**
 * Prompt block shared by plan generation and grocery-list extraction so the
 * AI grounds meals and shopping lists in what this user can actually buy.
 */
export function buildShoppingContext(country: unknown, market: unknown): string {
  const normalizedCountry = normalizeCountry(country);
  const data = MARKET_DATA[normalizedCountry];
  const store = marketLabel(normalizedCountry, market);
  const where = normalizedCountry === "other" ? "" : ` in ${data.label}`;
  return `SHOPPING CONTEXT:
- The user shops at ${store}${where}.
- Build meals and grocery items around foods reliably available there. Use the names/forms the user would find in that store.
- Regional staples to prefer (affordable + available): ${data.staples}.
- Budget guidance for this region: ${data.budgetTip}`;
}
