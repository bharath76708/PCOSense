import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Navigation,
  Search,
  Filter,
  Star,
  Phone,
  Globe,
  ExternalLink,
  CheckCircle2,
  Sparkles,
  ShoppingBag,
  Store,
  RefreshCw,
  Locate,
  Info,
  Apple,
  Clock,
  Compass
} from 'lucide-react';
import { useLanguage } from '../translations';
import { NearbyGroceryStore } from '../types';
import { ConsolidatedGroceryList } from '../services/groceryListService';
import {
  fetchNearbyGroceryStores,
  getStoreIngredientRecommendations
} from '../services/nearbyGroceryService';

interface NearbyGroceryFinderProps {
  groceryList?: ConsolidatedGroceryList;
  onSelectStore?: (store: NearbyGroceryStore) => void;
}

const PRESET_LOCATIONS = [
  { label: 'Hyderabad (Banjara/Jubilee)', lat: 17.4156, lng: 78.4354 },
  { label: 'Bengaluru (Indiranagar)', lat: 12.9784, lng: 77.6408 },
  { label: 'Mumbai (Bandra)', lat: 19.0607, lng: 72.8362 },
  { label: 'Delhi NCR (South Ext)', lat: 28.5672, lng: 77.2244 },
  { label: 'San Francisco (Market St)', lat: 37.7749, lng: -122.4194 }
];

export const NearbyGroceryFinder: React.FC<NearbyGroceryFinderProps> = ({
  groceryList,
  onSelectStore
}) => {
  const { isTelugu } = useLanguage();
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number }>({
    lat: 17.4156,
    lng: 78.4354
  });
  const [locationName, setLocationName] = useState<string>('Hyderabad, India');
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const [filterType, setFilterType] = useState<string>('all');
  const [stores, setStores] = useState<NearbyGroceryStore[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Detect GPS
  const detectUserLocation = () => {
    if (!navigator.geolocation) {
      setLocationError(isTelugu ? 'మీ బ్రౌజర్ లొకేషన్‌ను సపోర్ట్ చేయదు.' : 'Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      pos => {
        setIsLocating(false);
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setCurrentCoords({ lat, lng });
        setLocationName(
          isTelugu
            ? `మీ ప్రస్తుత GPS లొకేషన్ (${lat.toFixed(2)}, ${lng.toFixed(2)})`
            : `Your Current Location (${lat.toFixed(2)}°, ${lng.toFixed(2)}°)`
        );
      },
      err => {
        setIsLocating(false);
        console.warn('Geolocation denied or timed out:', err);
        setLocationError(
          isTelugu
            ? 'లొకేషన్ యాక్సెస్ తిరస్కరించబడింది. క్రింద నగరాల్లో ఒకదాన్ని ఎంచుకోండి.'
            : 'Location access was not granted. Select a city preset below.'
        );
      },
      { timeout: 10000, enableHighAccuracy: false }
    );
  };

  // Load stores whenever coords or filterType change
  useEffect(() => {
    let isCancelled = false;
    setIsLoading(true);

    fetchNearbyGroceryStores(currentCoords.lat, currentCoords.lng, filterType)
      .then(results => {
        if (!isCancelled) {
          setStores(results);
          setIsLoading(false);
        }
      })
      .catch(err => {
        if (!isCancelled) {
          console.error('Error fetching nearby stores:', err);
          setIsLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [currentCoords, filterType]);

  const filteredStores = stores.filter(store => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      store.name.toLowerCase().includes(q) ||
      store.address.toLowerCase().includes(q) ||
      store.pcosSpecialties.some(s => s.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-4" id="nearby-grocery-finder-widget">
      {/* Top Controls: Location detector & Preset Chips */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0 border border-teal-500/20">
              <MapPin className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                {isTelugu ? 'లొకేషన్ శోధన' : 'Search Location'}
              </span>
              <span className="text-xs sm:text-sm font-extrabold text-slate-800 dark:text-slate-100">
                {locationName}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={detectUserLocation}
            disabled={isLocating}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-xs shrink-0"
            id="detect-my-location-btn"
          >
            {isLocating ? (
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Locate className="h-3.5 w-3.5" />
            )}
            <span>{isLocating ? (isTelugu ? 'లొకేషన్ గుర్తిస్తోంది...' : 'Detecting...') : (isTelugu ? 'నా ప్రస్తుత లొకేషన్ ఉపయోగించు' : 'Detect My Location')}</span>
          </button>
        </div>

        {locationError && (
          <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-800 dark:text-amber-300 font-medium">
            {locationError}
          </div>
        )}

        {/* Preset Location Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
          <span className="text-[10px] font-bold text-slate-400 mr-1">
            {isTelugu ? 'త్వరిత నగరాలు:' : 'Quick Areas:'}
          </span>
          {PRESET_LOCATIONS.map(preset => (
            <button
              key={preset.label}
              type="button"
              onClick={() => {
                setCurrentCoords({ lat: preset.lat, lng: preset.lng });
                setLocationName(preset.label);
                setLocationError(null);
              }}
              className={`px-2 py-0.5 rounded-md text-[11px] font-semibold transition-all border ${
                currentCoords.lat === preset.lat
                  ? 'bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-200 border-teal-300 dark:border-teal-700 font-bold'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300'
              }`}
            >
              {preset.label.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        {/* Type Filter Tabs */}
        <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700 text-xs font-bold overflow-x-auto">
          <button
            type="button"
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
              filterType === 'all'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {isTelugu ? 'అన్ని దుకాణాలు' : 'All Stores'}
          </button>
          <button
            type="button"
            onClick={() => setFilterType('farmers_market')}
            className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
              filterType === 'farmers_market'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {isTelugu ? 'రైతు బజార్లు / సంతలు' : "Farmers' Markets"}
          </button>
          <button
            type="button"
            onClick={() => setFilterType('health_food_store')}
            className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
              filterType === 'health_food_store'
                ? 'bg-amber-600 text-white shadow-2xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {isTelugu ? 'హెల్త్ ఫుడ్ & గింజలు' : 'Health Food & Seeds'}
          </button>
          <button
            type="button"
            onClick={() => setFilterType('organic_supermarket')}
            className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
              filterType === 'organic_supermarket'
                ? 'bg-teal-600 text-white shadow-2xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {isTelugu ? 'ఆర్గానిక్ మార్కెట్లు' : 'Organic Supermarkets'}
          </button>
        </div>

        {/* Text Search */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={isTelugu ? 'దుకాణం పేరు లేదా వస్తువు...' : 'Search store or specialty...'}
            className="w-full pl-8.5 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20"
          />
        </div>
      </div>

      {/* Informational Guidance Banner */}
      <div className="p-3 rounded-xl bg-teal-50/70 dark:bg-teal-950/30 border border-teal-200/70 dark:border-teal-800/60 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2.5">
        <Sparkles className="h-4 w-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          {isTelugu ? (
            <>
              <strong>PCOS డైట్ సలహా:</strong> తాజా ఆకుకూరలు (పాలకూర, మెంతికూర) మరియు దేశీ నిమ్మకాయల కోసం <strong>రైతు బజార్లను</strong> సందర్శించండి. కొర్రలు, చియా గింజలు, మరియు అవిసె గింజల కోసం <strong>హెల్త్ ఫుడ్ దుకాణాలను</strong> ఉపయోగించండి.
            </>
          ) : (
            <>
              <strong>Fresh Ingredient Sourcing:</strong> Use <strong>Farmers' Markets</strong> for chemical-free dark greens (palak, methi) and high-folate produce. Visit <strong>Health Food Stores</strong> for unpolished millets, raw seeds (flax, pumpkin), and pure Ceylon cinnamon.
            </>
          )}
        </p>
      </div>

      {/* Stores Grid */}
      {isLoading ? (
        <div className="py-12 text-center text-xs text-slate-500 dark:text-slate-400 space-y-2">
          <RefreshCw className="h-6 w-6 animate-spin mx-auto text-teal-600" />
          <p>{isTelugu ? 'సమీపంలోని ఆర్గానిక్ దుకాణాలను శోధిస్తోంది...' : 'Locating nearby organic stores and farmers\' markets...'}</p>
        </div>
      ) : filteredStores.length === 0 ? (
        <div className="p-8 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 space-y-2 text-xs text-slate-500">
          <Store className="h-8 w-8 mx-auto text-slate-400" />
          <p className="font-bold text-slate-700 dark:text-slate-300">
            {isTelugu ? 'ఎంచుకున్న శోధనకు సరిపోయే దుకాణాలు కనిపించలేదు.' : 'No stores matched your current search filters.'}
          </p>
          <button
            type="button"
            onClick={() => {
              setFilterType('all');
              setSearchQuery('');
            }}
            className="text-teal-600 dark:text-teal-400 font-bold hover:underline"
          >
            {isTelugu ? 'ఫిల్టర్లు రీసెట్ చేయండి' : 'Reset filters'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredStores.map(store => {
            const recommendations = getStoreIngredientRecommendations(store.type, groceryList);

            return (
              <div
                key={store.id}
                className="rounded-2xl p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs hover:shadow-md transition-all space-y-3 flex flex-col justify-between"
                id={`grocery-store-card-${store.id}`}
              >
                <div className="space-y-2.5">
                  {/* Store Header: Name, Distance, Type Badge */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                            store.type === 'farmers_market'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                              : store.type === 'health_food_store'
                              ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800'
                              : 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/60 dark:text-teal-300 dark:border-teal-800'
                          }`}
                        >
                          {isTelugu && store.typeLabelTe ? store.typeLabelTe : store.typeLabel}
                        </span>
                        {store.verifiedOrganic && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center gap-0.5">
                            <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                            <span>{isTelugu ? 'ఆర్గానిక్ సర్టిఫైడ్' : 'Organic Verified'}</span>
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white mt-1">
                        {isTelugu && store.nameTe ? store.nameTe : store.name}
                      </h4>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="inline-flex items-center gap-1 text-xs font-black text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/50 px-2 py-0.5 rounded-lg border border-teal-200 dark:border-teal-800">
                        <Navigation className="h-3 w-3" />
                        <span>{store.distanceKm} km</span>
                      </span>
                    </div>
                  </div>

                  {/* Rating & Opening Hours */}
                  <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-1 font-bold text-amber-600 dark:text-amber-400">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      <span>{store.rating}</span>
                      <span className="text-slate-400 font-normal">({store.reviewCount})</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1 text-[11px] font-semibold">
                      <span
                        className={`h-2 w-2 rounded-full ${
                          store.isOpenNow ? 'bg-emerald-500' : 'bg-slate-400'
                        }`}
                      />
                      <span>{store.openingHoursText}</span>
                    </div>
                  </div>

                  {/* Address */}
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-snug flex items-start gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span>{store.address}</span>
                  </p>

                  {/* Anti-PCOS Specialties */}
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-1.5 text-xs">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
                      {isTelugu ? 'లభ్యమయ్యే ప్రత్యేక PCOS సరుకులు:' : 'PCOS Key Ingredients Sourced Here:'}
                    </span>
                    <ul className="space-y-1 text-[11px] text-slate-700 dark:text-slate-300">
                      {(isTelugu && store.pcosSpecialtiesTe ? store.pcosSpecialtiesTe : store.pcosSpecialties).map((spec, sIdx) => (
                        <li key={sIdx} className="flex items-center gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-teal-500 shrink-0" />
                          <span>{spec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Matches From Your Grocery List */}
                  {recommendations.recommendedItems.length > 0 && (
                    <div className="text-[11px] text-teal-800 dark:text-teal-300 bg-teal-50/50 dark:bg-teal-950/20 p-2 rounded-lg border border-teal-200/50 dark:border-teal-900/40">
                      <span className="font-bold block text-[10px] uppercase tracking-wider text-teal-900 dark:text-teal-200">
                        {isTelugu ? 'మీ కిరాణా జాబితా నుండి మ్యాచ్ అయినవి:' : 'Matches from your weekly list:'}
                      </span>
                      <span>{recommendations.recommendedItems.slice(0, 4).join(', ')}</span>
                    </div>
                  )}
                </div>

                {/* Card Action Buttons */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                  <a
                    href={store.googleMapsUri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-1.5 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5"
                    id={`open-directions-store-${store.id}`}
                  >
                    <Compass className="h-3.5 w-3.5" />
                    <span>{isTelugu ? 'గూగుల్ మ్యాప్స్ డైరెక్షన్స్' : 'Directions in Maps'}</span>
                    <ExternalLink className="h-3 w-3 opacity-75" />
                  </a>

                  {store.phone && (
                    <a
                      href={`tel:${store.phone}`}
                      className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all text-xs"
                      title="Call store"
                    >
                      <Phone className="h-3.5 w-3.5" />
                    </a>
                  )}

                  {store.website && (
                    <a
                      href={store.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all text-xs"
                      title="Store website"
                    >
                      <Globe className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
