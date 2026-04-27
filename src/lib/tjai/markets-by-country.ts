/**
 * Country → grocery market chains.
 *
 * Used by TJAI v2 Stage 2 (local) intake to populate the "where do you
 * usually shop?" picker per country. The user can also type a custom
 * store, which we save into `tjai_market_writeins` (PR6 will add that
 * table). For now the picker is a single-select with a free-text
 * fallback when the user picks "Other".
 *
 * Stay opinionated about which chains are listed: only chains with
 * meaningful national footprint per country. Don't add boutique
 * regionals — that's what the write-in field is for.
 */

export type Country = {
  code: string; // ISO 3166-1 alpha-2
  name: string; // English short name
  currency: "TRY" | "AED" | "SAR" | "EUR" | "USD" | "GBP";
  /** Local-currency symbol for budget UI. */
  currencySymbol: string;
};

export type Market = {
  id: string; // stable slug — used as answer value
  label: string; // display label
};

/**
 * Top countries we serve actively. The full list of supported countries
 * is much larger (every country with a Latin-1 / Arabic locale we ship
 * to), but the markets dropdown is curated to the top 20-or-so.
 */
export const COUNTRIES: Country[] = [
  // Turkey + GCC + Spain + France first (our core launch markets)
  { code: "TR", name: "Türkiye", currency: "TRY", currencySymbol: "₺" },
  { code: "AE", name: "United Arab Emirates", currency: "AED", currencySymbol: "AED" },
  { code: "SA", name: "Saudi Arabia", currency: "SAR", currencySymbol: "SAR" },
  { code: "ES", name: "España", currency: "EUR", currencySymbol: "€" },
  { code: "FR", name: "France", currency: "EUR", currencySymbol: "€" },
  // Other supported countries with curated market lists
  { code: "DE", name: "Deutschland", currency: "EUR", currencySymbol: "€" },
  { code: "GB", name: "United Kingdom", currency: "GBP", currencySymbol: "£" },
  { code: "NL", name: "Nederland", currency: "EUR", currencySymbol: "€" },
  { code: "IT", name: "Italia", currency: "EUR", currencySymbol: "€" },
  { code: "PT", name: "Portugal", currency: "EUR", currencySymbol: "€" },
  { code: "BE", name: "Belgique", currency: "EUR", currencySymbol: "€" },
  { code: "CH", name: "Switzerland", currency: "EUR", currencySymbol: "CHF" },
  { code: "AT", name: "Österreich", currency: "EUR", currencySymbol: "€" },
  { code: "PL", name: "Polska", currency: "EUR", currencySymbol: "zł" },
  { code: "GR", name: "Ελλάδα", currency: "EUR", currencySymbol: "€" },
  { code: "QA", name: "Qatar", currency: "USD", currencySymbol: "QAR" },
  { code: "KW", name: "Kuwait", currency: "USD", currencySymbol: "KWD" },
  { code: "OM", name: "Oman", currency: "USD", currencySymbol: "OMR" },
  { code: "BH", name: "Bahrain", currency: "USD", currencySymbol: "BHD" },
  { code: "JO", name: "Jordan", currency: "USD", currencySymbol: "JOD" },
  { code: "EG", name: "Egypt", currency: "USD", currencySymbol: "EGP" },
  { code: "MA", name: "Maroc", currency: "EUR", currencySymbol: "MAD" },
  { code: "US", name: "United States", currency: "USD", currencySymbol: "$" },
  { code: "CA", name: "Canada", currency: "USD", currencySymbol: "CA$" },
  { code: "AU", name: "Australia", currency: "USD", currencySymbol: "A$" }
];

const MARKETS_BY_COUNTRY: Record<string, Market[]> = {
  TR: [
    { id: "migros", label: "Migros" },
    { id: "carrefoursa", label: "CarrefourSA" },
    { id: "bim", label: "BİM" },
    { id: "a101", label: "A101" },
    { id: "sok", label: "ŞOK" },
    { id: "macrocenter", label: "Macrocenter" },
    { id: "metro", label: "Metro" }
  ],
  AE: [
    { id: "carrefour-ae", label: "Carrefour" },
    { id: "lulu-ae", label: "Lulu Hypermarket" },
    { id: "spinneys-ae", label: "Spinneys" },
    { id: "waitrose-ae", label: "Waitrose" },
    { id: "choithrams-ae", label: "Choithrams" },
    { id: "union-coop", label: "Union Coop" }
  ],
  SA: [
    { id: "panda", label: "Panda" },
    { id: "tamimi", label: "Tamimi Markets" },
    { id: "danube", label: "Danube" },
    { id: "lulu-sa", label: "Lulu" },
    { id: "carrefour-sa", label: "Carrefour" },
    { id: "othaim", label: "Othaim" },
    { id: "alraya", label: "Al Raya" }
  ],
  ES: [
    { id: "mercadona", label: "Mercadona" },
    { id: "carrefour-es", label: "Carrefour" },
    { id: "lidl-es", label: "Lidl" },
    { id: "dia", label: "Dia" },
    { id: "el-corte-ingles", label: "El Corte Inglés" },
    { id: "alcampo", label: "Alcampo" },
    { id: "consum", label: "Consum" }
  ],
  FR: [
    { id: "carrefour-fr", label: "Carrefour" },
    { id: "leclerc", label: "E.Leclerc" },
    { id: "auchan", label: "Auchan" },
    { id: "intermarche", label: "Intermarché" },
    { id: "monoprix", label: "Monoprix" },
    { id: "lidl-fr", label: "Lidl" },
    { id: "casino", label: "Casino" }
  ],
  DE: [
    { id: "rewe", label: "REWE" },
    { id: "edeka", label: "EDEKA" },
    { id: "lidl-de", label: "Lidl" },
    { id: "aldi", label: "ALDI" },
    { id: "kaufland", label: "Kaufland" }
  ],
  GB: [
    { id: "tesco", label: "Tesco" },
    { id: "sainsburys", label: "Sainsbury's" },
    { id: "asda", label: "ASDA" },
    { id: "morrisons", label: "Morrisons" },
    { id: "waitrose-gb", label: "Waitrose" },
    { id: "lidl-gb", label: "Lidl" },
    { id: "aldi-gb", label: "ALDI" },
    { id: "marks-spencer", label: "M&S Food" }
  ],
  NL: [
    { id: "albert-heijn", label: "Albert Heijn" },
    { id: "jumbo", label: "Jumbo" },
    { id: "lidl-nl", label: "Lidl" },
    { id: "plus", label: "PLUS" }
  ],
  IT: [
    { id: "esselunga", label: "Esselunga" },
    { id: "coop-it", label: "Coop" },
    { id: "carrefour-it", label: "Carrefour" },
    { id: "conad", label: "Conad" },
    { id: "lidl-it", label: "Lidl" }
  ],
  PT: [
    { id: "continente", label: "Continente" },
    { id: "pingo-doce", label: "Pingo Doce" },
    { id: "lidl-pt", label: "Lidl" },
    { id: "auchan-pt", label: "Auchan" }
  ],
  BE: [
    { id: "delhaize", label: "Delhaize" },
    { id: "colruyt", label: "Colruyt" },
    { id: "carrefour-be", label: "Carrefour" },
    { id: "lidl-be", label: "Lidl" }
  ],
  CH: [
    { id: "migros-ch", label: "Migros" },
    { id: "coop-ch", label: "Coop" },
    { id: "lidl-ch", label: "Lidl" },
    { id: "aldi-ch", label: "ALDI" }
  ],
  AT: [
    { id: "billa", label: "BILLA" },
    { id: "spar-at", label: "SPAR" },
    { id: "hofer", label: "Hofer" },
    { id: "lidl-at", label: "Lidl" }
  ],
  PL: [
    { id: "biedronka", label: "Biedronka" },
    { id: "lidl-pl", label: "Lidl" },
    { id: "carrefour-pl", label: "Carrefour" },
    { id: "auchan-pl", label: "Auchan" }
  ],
  GR: [
    { id: "ab-vasilopoulos", label: "AB Βασιλόπουλος" },
    { id: "sklavenitis", label: "Σκλαβενίτης" },
    { id: "lidl-gr", label: "Lidl" }
  ],
  QA: [
    { id: "carrefour-qa", label: "Carrefour" },
    { id: "lulu-qa", label: "Lulu" },
    { id: "monoprix-qa", label: "Monoprix" }
  ],
  KW: [
    { id: "sultan-center", label: "The Sultan Center" },
    { id: "lulu-kw", label: "Lulu" },
    { id: "carrefour-kw", label: "Carrefour" }
  ],
  OM: [
    { id: "lulu-om", label: "Lulu" },
    { id: "carrefour-om", label: "Carrefour" }
  ],
  BH: [
    { id: "lulu-bh", label: "Lulu" },
    { id: "carrefour-bh", label: "Carrefour" }
  ],
  JO: [
    { id: "carrefour-jo", label: "Carrefour" },
    { id: "safeway-jo", label: "Safeway" },
    { id: "cozmo", label: "Cozmo" }
  ],
  EG: [
    { id: "carrefour-eg", label: "Carrefour" },
    { id: "spinneys-eg", label: "Spinneys" },
    { id: "metro-eg", label: "Metro" }
  ],
  MA: [
    { id: "carrefour-ma", label: "Carrefour" },
    { id: "marjane", label: "Marjane" },
    { id: "bim-ma", label: "BIM" }
  ],
  US: [
    { id: "walmart", label: "Walmart" },
    { id: "kroger", label: "Kroger" },
    { id: "trader-joes", label: "Trader Joe's" },
    { id: "whole-foods", label: "Whole Foods" },
    { id: "costco", label: "Costco" },
    { id: "publix", label: "Publix" },
    { id: "aldi-us", label: "ALDI" }
  ],
  CA: [
    { id: "loblaws", label: "Loblaws" },
    { id: "metro-ca", label: "Metro" },
    { id: "sobeys", label: "Sobeys" },
    { id: "no-frills", label: "No Frills" }
  ],
  AU: [
    { id: "coles", label: "Coles" },
    { id: "woolworths", label: "Woolworths" },
    { id: "aldi-au", label: "ALDI" },
    { id: "iga", label: "IGA" }
  ]
};

export function getMarketsForCountry(countryCode: string): Market[] {
  return MARKETS_BY_COUNTRY[countryCode.toUpperCase()] ?? [];
}

export function getCountryByCode(countryCode: string): Country | undefined {
  return COUNTRIES.find((c) => c.code === countryCode.toUpperCase());
}

/**
 * Grocery delivery deeplink targets per country. Used by the grocery
 * list output (PR6) to surface a "Shop online" button next to each
 * grocery list.
 */
export const DELIVERY_LINKS: Record<string, Array<{ id: string; label: string; url: string }>> = {
  TR: [
    { id: "getir", label: "Getir", url: "https://getir.com" },
    { id: "migros-sanal", label: "Migros Sanal Market", url: "https://www.migros.com.tr" }
  ],
  AE: [
    { id: "talabat-ae", label: "talabat Mart", url: "https://www.talabat.com" },
    { id: "carrefour-app-ae", label: "Carrefour", url: "https://www.carrefouruae.com" },
    { id: "instashop", label: "InstaShop", url: "https://www.instashop.com" }
  ],
  SA: [
    { id: "hungerstation", label: "HungerStation", url: "https://hungerstation.com" },
    { id: "panda-app", label: "Panda", url: "https://panda.com.sa" },
    { id: "carrefour-sa-app", label: "Carrefour", url: "https://www.carrefourksa.com" }
  ],
  ES: [
    { id: "glovo", label: "Glovo", url: "https://glovoapp.com" },
    { id: "mercadona-online", label: "Mercadona Online", url: "https://tienda.mercadona.es" }
  ],
  FR: [
    { id: "carrefour-drive-fr", label: "Carrefour Drive", url: "https://www.carrefour.fr" },
    { id: "leclerc-drive", label: "Leclerc Drive", url: "https://www.leclercdrive.fr" }
  ],
  GB: [
    { id: "tesco-online", label: "Tesco", url: "https://www.tesco.com/groceries" },
    { id: "sainsburys-online", label: "Sainsbury's", url: "https://www.sainsburys.co.uk" }
  ],
  US: [
    { id: "instacart", label: "Instacart", url: "https://www.instacart.com" },
    { id: "amazon-fresh", label: "Amazon Fresh", url: "https://www.amazon.com/alm/storefront" }
  ]
};

export function getDeliveryLinks(countryCode: string): Array<{ id: string; label: string; url: string }> {
  return DELIVERY_LINKS[countryCode.toUpperCase()] ?? [];
}
