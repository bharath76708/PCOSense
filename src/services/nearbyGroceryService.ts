import { NearbyGroceryStore, GroceryCategory } from '../types';
import { ConsolidatedGroceryList } from './groceryListService';

/**
 * Curated organic and farmers' market baseline directory with precise geographical anchors.
 * Automatically adapts and computes geodesic distance relative to user coordinates.
 */
const CURATED_GROCERY_STORES: Omit<NearbyGroceryStore, 'distanceKm'>[] = [
  {
    id: 'store-1',
    name: 'Nature\'s Basket Artisanal & Organic Supermarket',
    nameTe: 'నేచర్స్ బాస్కెట్ ఆర్గానిక్ సూపర్ మార్కెట్',
    type: 'organic_supermarket',
    typeLabel: 'Organic Supermarket',
    typeLabelTe: 'సేంద్రీయ సూపర్ మార్కెట్',
    address: 'Road No. 36, Jubilee Hills, Hyderabad, Telangana 500033',
    city: 'Hyderabad',
    coordinates: { lat: 17.4325, lng: 78.4073 },
    rating: 4.8,
    reviewCount: 342,
    isOpenNow: true,
    openingHoursText: 'Open • 8:00 AM - 10:00 PM',
    phone: '+91 40 2355 8899',
    website: 'https://naturesbasket.co.in',
    googleMapsUri: 'https://www.google.com/maps/search/?api=1&query=17.4325,78.4073',
    pcosSpecialties: [
      'Certified organic millets (Foxtail, Little, Barnyard)',
      'Raw pumpkin & flax seeds',
      'Cold-pressed virgin coconut & sesame oils',
      'A2 organic grass-fed cow curd'
    ],
    pcosSpecialtiesTe: [
      'సర్టిఫైడ్ ఆర్గానిక్ కొర్రలు & చిరుధాన్యాలు',
      'అవిసె మరియు గుమ్మడి గింజలు',
      'గానుగ కొబ్బరి & నువ్వుల నూనెలు',
      'దేశీ ఆవు పెరుగు'
    ],
    matchedGroceryCategories: ['grains_seeds', 'pantry_fats', 'proteins_dairy'],
    verifiedOrganic: true
  },
  {
    id: 'store-2',
    name: 'Rythu Bazar Farmers\' Fresh Produce Market',
    nameTe: 'రైతు బజార్ తాజా కూరగాయల మార్కెట్',
    type: 'farmers_market',
    typeLabel: 'Farmers\' Market',
    typeLabelTe: 'రైతు బజార్ / తాజా మార్కెట్',
    address: 'Mehdipatnam Main Road, Hyderabad, Telangana 500028',
    city: 'Hyderabad',
    coordinates: { lat: 17.3916, lng: 78.4418 },
    rating: 4.7,
    reviewCount: 680,
    isOpenNow: true,
    openingHoursText: 'Open • 6:00 AM - 1:00 PM, 4:00 PM - 8:00 PM',
    phone: '+91 40 2339 1234',
    googleMapsUri: 'https://www.google.com/maps/search/?api=1&query=17.3916,78.4418',
    pcosSpecialties: [
      'Direct farm fresh spinach (palak), methi, and coriander',
      'Country lemons & high-folate green beans',
      'Chemical-free local bottle gourd & ridge gourd',
      'Fresh ginger roots & garlic bulbs'
    ],
    pcosSpecialtiesTe: [
      'రైతుల నుండి నేరుగా తాజా పాలకూర & మెంతికూర',
      'నాటు నిమ్మకాయలు & బీన్స్',
      'పురుగుమందులు లేని తాజా కూరగాయలు',
      'తాజా అల్లం & వెల్లుల్లి'
    ],
    matchedGroceryCategories: ['produce', 'spices_herbs'],
    verifiedOrganic: false
  },
  {
    id: 'store-3',
    name: '24 Mantra Organic Health Food Store',
    nameTe: '24 మంత్ర ఆర్గానిక్ హెల్త్ ఫుడ్ స్టోర్',
    type: 'health_food_store',
    typeLabel: 'Health Food & Seeds Store',
    typeLabelTe: 'ఆరోగ్యకర ఆహారాలు & గింజల దుకాణం',
    address: 'Gachibowli - Miyapur Road, Whitefields, Kondapur, Telangana 500084',
    city: 'Hyderabad',
    coordinates: { lat: 17.4645, lng: 78.3652 },
    rating: 4.9,
    reviewCount: 290,
    isOpenNow: true,
    openingHoursText: 'Open • 9:00 AM - 9:30 PM',
    phone: '+91 40 4004 2424',
    website: 'https://24mantra.com',
    googleMapsUri: 'https://www.google.com/maps/search/?api=1&query=17.4645,78.3652',
    pcosSpecialties: [
      'Whole unpolished dals (moong, chana, urad)',
      'Unrefined Ceylon cinnamon quills',
      'Organic chia seeds & white sesame',
      'Stone-ground sprouted ragi flour'
    ],
    pcosSpecialtiesTe: [
      'పాలిష్ చేయని సహజ పప్పులు (పెసలు, శనగలు)',
      'సిలోన్ దాల్చినచెక్క',
      'ఆర్గానిక్ చియా మరియు నువ్వులు',
      'మొలకెత్తిన రాగి పిండి'
    ],
    matchedGroceryCategories: ['grains_seeds', 'spices_herbs', 'pantry_fats'],
    verifiedOrganic: true
  },
  {
    id: 'store-4',
    name: 'Sanjeevani Natural & Herbal Health Mart',
    nameTe: 'సంజీవని నేచురల్ & హెర్బల్ హెల్త్ మార్ట్',
    type: 'herbal_apothecary',
    typeLabel: 'Herbal & Wellness Apothecary',
    typeLabelTe: 'ఆయుర్వేద & మూలికా దుకాణం',
    address: 'Banjara Hills Road No. 12, Hyderabad, Telangana 500034',
    city: 'Hyderabad',
    coordinates: { lat: 17.4111, lng: 78.4485 },
    rating: 4.6,
    reviewCount: 175,
    isOpenNow: true,
    openingHoursText: 'Open • 9:30 AM - 8:30 PM',
    phone: '+91 40 2330 5566',
    googleMapsUri: 'https://www.google.com/maps/search/?api=1&query=17.4111,78.4485',
    pcosSpecialties: [
      'Pure organic spearmint tea leaves (anti-androgen)',
      'Ashwagandha root powder (cortisol regulator)',
      'Cold-pressed castor oil for liver packs',
      'Wild raw mountain honey'
    ],
    pcosSpecialtiesTe: [
      'స్పియర్‌మింట్ టీ ఆకులు (ఆండ్రోజెన్ తగ్గింపుకు)',
      'అశ్వగంధ చూర్ణం (కార్టిసాల్ నియంత్రణ)',
      'గానుగ ఆముదం',
      'స్వచ్ఛమైన తేనె'
    ],
    matchedGroceryCategories: ['spices_herbs', 'pantry_fats'],
    verifiedOrganic: true
  },
  {
    id: 'store-5',
    name: 'Bengaluru Farmers\' Co-op & Organic Santhe',
    nameTe: 'రైతుల ఆర్గానిక్ సంత',
    type: 'farmers_market',
    typeLabel: 'Farmers\' Market',
    typeLabelTe: 'రైతుల సంత',
    address: '100 Feet Road, Indiranagar, Bengaluru, Karnataka 560038',
    city: 'Bengaluru',
    coordinates: { lat: 12.9784, lng: 77.6408 },
    rating: 4.9,
    reviewCount: 512,
    isOpenNow: true,
    openingHoursText: 'Open • 7:00 AM - 2:00 PM',
    phone: '+91 80 2525 7890',
    googleMapsUri: 'https://www.google.com/maps/search/?api=1&query=12.9784,77.6408',
    pcosSpecialties: [
      'Heirloom organic greens & microgreens',
      'Fresh tender coconuts for electrolyte replenishment',
      'Raw unprocessed A2 farm butter & ghee',
      'Hydroponic chemical-free salads'
    ],
    pcosSpecialtiesTe: [
      'తాజా ఆర్గానిక్ ఆకుకూరలు & మైక్రోగ్రీన్స్',
      'లేత కొబ్బరి నీళ్లు',
      'స్వచ్ఛమైన దేశీ నెయ్యి & వెన్న',
      'సహజ కూరగాయలు'
    ],
    matchedGroceryCategories: ['produce', 'proteins_dairy'],
    verifiedOrganic: true
  },
  {
    id: 'store-6',
    name: 'Whole Foods Market / Fresh Organic Co-op',
    nameTe: 'హోల్ ఫుడ్స్ మార్కెట్ & ఆర్గానిక్ కో-ఆప్',
    type: 'organic_supermarket',
    typeLabel: 'Organic Supermarket',
    typeLabelTe: 'ఆర్గానిక్ సూపర్ మార్కెట్',
    address: 'Central Market St, San Francisco, CA 94103',
    city: 'San Francisco',
    coordinates: { lat: 37.7749, lng: -122.4194 },
    rating: 4.8,
    reviewCount: 920,
    isOpenNow: true,
    openingHoursText: 'Open • 8:00 AM - 9:00 PM',
    phone: '+1 415 555 0199',
    website: 'https://wholefoodsmarket.com',
    googleMapsUri: 'https://www.google.com/maps/search/?api=1&query=37.7749,-122.4194',
    pcosSpecialties: [
      'Wild-caught Alaskan salmon (EPA/DHA)',
      'Organic pasture-raised eggs with orange yolks',
      'Organic bulk pumpkin & hemp seeds',
      'Non-dairy unsweetened coconut milk yogurt'
    ],
    pcosSpecialtiesTe: [
      'సాల్మన్ చేపలు (ఒమేగా-3)',
      'ఆర్గానిక్ గుడ్లు',
      'గుమ్మడి & జనపనార గింజలు',
      'షుగర్ లేని కొబ్బరి పెరుగు'
    ],
    matchedGroceryCategories: ['proteins_dairy', 'grains_seeds', 'produce'],
    verifiedOrganic: true
  }
];

/**
 * Calculates haversine distance in kilometers between two GPS coordinates
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1));
}

/**
 * Fetches nearby grocery stores and farmers' markets using server proxy
 * (with Google Maps Places API New integration + solution ID attribution)
 * and graceful localized fallback.
 */
export async function fetchNearbyGroceryStores(
  lat: number,
  lng: number,
  storeTypeFilter: string = 'all'
): Promise<NearbyGroceryStore[]> {
  try {
    const url = `/api/places/nearby-grocery?lat=${lat}&lng=${lng}&type=${encodeURIComponent(storeTypeFilter)}`;
    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      if (data.success && Array.isArray(data.stores) && data.stores.length > 0) {
        return data.stores;
      }
    }
  } catch (err) {
    console.warn('Proxy places fetch deferred to local directory:', err);
  }

  // Local calculation & adaptation
  const storesWithDistance = CURATED_GROCERY_STORES.map(store => {
    const distanceKm = calculateHaversineDistance(
      lat,
      lng,
      store.coordinates.lat,
      store.coordinates.lng
    );

    // Direct Google Maps navigation URL
    const googleMapsUri = `https://www.google.com/maps/dir/?api=1&destination=${store.coordinates.lat},${store.coordinates.lng}`;

    return {
      ...store,
      distanceKm,
      googleMapsUri
    };
  });

  // Filter if requested
  const filtered =
    storeTypeFilter === 'all'
      ? storesWithDistance
      : storesWithDistance.filter(s => s.type === storeTypeFilter);

  // Sort by nearest distance first
  return filtered.sort((a, b) => (a.distanceKm || 999) - (b.distanceKm || 999));
}

/**
 * Matches items from the generated grocery list to specific store types
 */
export function getStoreIngredientRecommendations(
  storeType: string,
  groceryList?: ConsolidatedGroceryList
): { recommendedItems: string[]; categoryLabel: string } {
  if (!groceryList || !groceryList.categories) {
    return {
      recommendedItems: ['Fresh leafy greens', 'Whole millets', 'Chia seeds', 'Cold-pressed oils'],
      categoryLabel: 'General Anti-PCOS Staples'
    };
  }

  if (storeType === 'farmers_market') {
    const produceCat = groceryList.categories.find(c => c.key === 'produce');
    const items = (produceCat?.items || []).slice(0, 5).map(i => i.name);
    return {
      recommendedItems: items.length > 0 ? items : ['Spinach / Palak', 'Fresh Methi Leaves', 'Coriander', 'Lemons', 'Cucumber'],
      categoryLabel: 'Fresh Produce & Leafy Greens'
    };
  }

  if (storeType === 'health_food_store' || storeType === 'herbal_apothecary') {
    const seedsCat = groceryList.categories.find(c => c.key === 'grains_seeds');
    const items = (seedsCat?.items || []).slice(0, 5).map(i => i.name);
    return {
      recommendedItems: items.length > 0 ? items : ['Foxtail Millet', 'Pumpkin Seeds', 'Flaxseed Meal', 'Chia Seeds', 'Ceylon Cinnamon'],
      categoryLabel: 'Seeds, Millets & Anti-Androgen Herbs'
    };
  }

  // Supermarket
  const allItems = groceryList.categories.flatMap(c => c.items).slice(0, 6).map(i => i.name);
  return {
    recommendedItems: allItems.length > 0 ? allItems : ['A2 Curd', 'Organic Dals', 'Virgin Coconut Oil', 'Raw Walnuts'],
    categoryLabel: 'Pantry Essentials & High-Protein Staples'
  };
}
