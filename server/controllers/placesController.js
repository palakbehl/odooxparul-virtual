// ==========================================
// Places Controller - OpenTripMap API Integration
// API Docs: https://dev.opentripmap.org/docs
// Endpoints used:
//   1. /en/places/geoname  → Get coordinates for a city name
//   2. /en/places/radius   → Get places within a radius of lat/lon
//   3. /en/places/autosuggest → Autosuggest places by partial name
//   4. /en/places/xid/{xid}   → Get full details of a single place
// ==========================================

const axios = require('axios');

const OTM_KEY = process.env.OPENTRIPMAP_API_KEY;
const OTM_BASE = 'https://api.opentripmap.com/0.1';

// Helper: call OpenTripMap
const otm = async (endpoint, params = {}) => {
  const url = `${OTM_BASE}${endpoint}`;
  const res = await axios.get(url, {
    params: { ...params, apikey: OTM_KEY },
    timeout: 15000
  });
  return res.data;
};

// ==========================================
// 1. GEONAME - Get lat/lon for a city name
// GET /api/places/geoname?name=Paris
// ==========================================
exports.getGeoname = async (req, res) => {
  try {
    const { name } = req.query;
    if (!name || name.length < 2) return res.json({ success: true, result: null });

    if (!OTM_KEY) {
      return res.json({ success: true, result: getFallbackGeoname(name), source: 'fallback' });
    }

    const data = await otm('/en/places/geoname', { name });
    // Returns: { name, country, lat, lon, population, timezone, status }
    res.json({ success: true, result: data, source: 'opentripmap' });
  } catch (error) {
    console.error('Geoname error:', error.message);
    const { name } = req.query;
    res.json({ success: true, result: getFallbackGeoname(name || ''), source: 'fallback' });
  }
};

// ==========================================
// 2. RADIUS - Get places within radius of lat/lon
// GET /api/places/radius?lat=48.85&lon=2.35&radius=5000&kinds=interesting_places&limit=20
// ==========================================
exports.getPlacesByRadius = async (req, res) => {
  try {
    const {
      lat, lon,
      radius = 10000,
      kinds = 'interesting_places',
      limit = 20,
      rate = '2',
      format = 'json'
    } = req.query;

    if (!lat || !lon) return res.json({ success: true, results: [] });

    if (!OTM_KEY) {
      return res.json({ success: true, results: getFallbackPlaces(kinds), source: 'fallback' });
    }

    const data = await otm('/en/places/radius', {
      lat: parseFloat(lat),
      lon: parseFloat(lon),
      radius: parseInt(radius),
      kinds,
      limit: parseInt(limit),
      rate,
      format
    });

    // data is an array of { xid, name, dist, rate, wikidata, kinds, point: {lat, lon}, osm }
    const results = (Array.isArray(data) ? data : []).filter(p => p.name).map(p => ({
      xid: p.xid,
      name: p.name,
      kinds: p.kinds,
      distance: Math.round(p.dist),
      rate: p.rate,
      lat: p.point?.lat,
      lon: p.point?.lon,
      wikidata: p.wikidata || null
    }));

    res.json({ success: true, results, source: 'opentripmap' });
  } catch (error) {
    console.error('Radius search error:', error.message);
    const { kinds } = req.query;
    res.json({ success: true, results: getFallbackPlaces(kinds || ''), source: 'fallback' });
  }
};

// ==========================================
// 3. AUTOSUGGEST - Search places by partial name + location
// GET /api/places/autosuggest?name=Eiffel&lat=48.85&lon=2.35&radius=50000
// ==========================================
exports.autosuggest = async (req, res) => {
  try {
    const {
      name,
      lat, lon,
      radius = 100000,
      kinds = '',
      limit = 15,
      rate = '2',
      format = 'json'
    } = req.query;

    if (!name || name.length < 2) return res.json({ success: true, results: [] });

    if (!OTM_KEY) {
      return res.json({ success: true, results: getFallbackPlaces(name), source: 'fallback' });
    }

    const params = { name, radius: parseInt(radius), limit: parseInt(limit), rate, format };
    if (lat && lon) {
      params.lat = parseFloat(lat);
      params.lon = parseFloat(lon);
    }
    if (kinds) params.kinds = kinds;

    const data = await otm('/en/places/autosuggest', params);

    const results = (Array.isArray(data) ? data : []).filter(p => p.name).map(p => ({
      xid: p.xid,
      name: p.name,
      kinds: p.kinds,
      distance: Math.round(p.dist || 0),
      rate: p.rate,
      lat: p.point?.lat,
      lon: p.point?.lon,
      wikidata: p.wikidata || null
    }));

    res.json({ success: true, results, source: 'opentripmap' });
  } catch (error) {
    console.error('Autosuggest error:', error.message);
    const { name } = req.query;
    res.json({ success: true, results: getFallbackPlaces(name || ''), source: 'fallback' });
  }
};

// ==========================================
// 4. PLACE DETAILS - Full info for a single place by xid
// GET /api/places/details/:xid
// ==========================================
exports.getPlaceDetails = async (req, res) => {
  try {
    const { xid } = req.params;
    if (!xid) return res.json({ success: true, result: null });

    if (!OTM_KEY) {
      return res.json({ success: true, result: { xid, name: 'Sample Place', kinds: 'interesting_places' }, source: 'fallback' });
    }

    const data = await otm(`/en/places/xid/${xid}`);
    // Returns: { xid, name, address, rate, wikidata, kinds, sources, bbox, point, wikipedia, image, preview, wikipedia_extracts, info }
    const result = {
      xid: data.xid,
      name: data.name,
      address: data.address || {},
      rate: data.rate,
      kinds: data.kinds,
      wikipedia: data.wikipedia || '',
      image: data.image || data.preview?.source || '',
      description: data.wikipedia_extracts?.text || data.info?.descr || '',
      lat: data.point?.lat,
      lon: data.point?.lon,
      url: data.url || data.otm || '',
      wikidata: data.wikidata || ''
    };

    res.json({ success: true, result, source: 'opentripmap' });
  } catch (error) {
    console.error('Place details error:', error.message);
    res.json({ success: true, result: null, source: 'fallback' });
  }
};

// ==========================================
// 5. SEARCH FLOW - Combined geoname + radius in one call (convenience)
// GET /api/places/search?q=Paris&kinds=cultural&limit=20&radius=10000
// This is the main endpoint used by the Discover page
// ==========================================
exports.searchPlaces = async (req, res) => {
  try {
    const {
      q,
      kinds = 'interesting_places',
      limit = 20,
      radius = 20000,
      rate = '2'
    } = req.query;

    if (!q || q.length < 2) return res.json({ success: true, results: [], total: 0 });

    if (!OTM_KEY) {
      return res.json({ success: true, results: getFallbackPlaces(q), total: getFallbackPlaces(q).length, source: 'fallback' });
    }

    // Step 1: Get coordinates for the city/place name
    const geo = await otm('/en/places/geoname', { name: q });
    if (!geo || !geo.lat || !geo.lon) {
      // If geoname fails, try autosuggest instead
      const suggest = await otm('/en/places/autosuggest', {
        name: q, radius: 100000, limit: parseInt(limit), rate, format: 'json'
      });
      const results = (Array.isArray(suggest) ? suggest : []).filter(p => p.name).map(p => ({
        xid: p.xid,
        name: p.name,
        kinds: p.kinds,
        distance: Math.round(p.dist || 0),
        rate: p.rate,
        lat: p.point?.lat,
        lon: p.point?.lon
      }));
      return res.json({ success: true, results, total: results.length, source: 'opentripmap', method: 'autosuggest' });
    }

    // Step 2: Get places within the radius of the geoname coordinates
    const data = await otm('/en/places/radius', {
      lat: geo.lat,
      lon: geo.lon,
      radius: parseInt(radius),
      kinds,
      limit: parseInt(limit),
      rate,
      format: 'json'
    });

    const results = (Array.isArray(data) ? data : []).filter(p => p.name).map(p => ({
      xid: p.xid,
      name: p.name,
      kinds: p.kinds,
      distance: Math.round(p.dist),
      rate: p.rate,
      lat: p.point?.lat,
      lon: p.point?.lon
    }));

    res.json({
      success: true,
      results,
      total: results.length,
      location: { name: geo.name, country: geo.country, lat: geo.lat, lon: geo.lon },
      source: 'opentripmap',
      method: 'geoname+radius'
    });
  } catch (error) {
    console.error('Combined search error:', error.message);
    const { q } = req.query;
    res.json({ success: true, results: getFallbackPlaces(q || ''), total: 0, source: 'fallback' });
  }
};

// ==========================================
// 6. BATCH DETAILS - Get details for multiple xids
// POST /api/places/batch-details  body: { xids: ['xid1','xid2',...] }
// ==========================================
exports.batchDetails = async (req, res) => {
  try {
    const { xids } = req.body;
    if (!xids || !Array.isArray(xids) || xids.length === 0) {
      return res.json({ success: true, results: [] });
    }

    if (!OTM_KEY) {
      return res.json({ success: true, results: [], source: 'fallback' });
    }

    // Fetch details in parallel (max 10 to avoid rate-limiting)
    const batch = xids.slice(0, 10);
    const promises = batch.map(xid =>
      otm(`/en/places/xid/${xid}`).catch(() => null)
    );
    const details = await Promise.all(promises);

    const results = details.filter(Boolean).map(data => ({
      xid: data.xid,
      name: data.name,
      address: data.address || {},
      rate: data.rate,
      kinds: data.kinds,
      image: data.image || data.preview?.source || '',
      description: data.wikipedia_extracts?.text || data.info?.descr || '',
      lat: data.point?.lat,
      lon: data.point?.lon,
      wikipedia: data.wikipedia || ''
    }));

    res.json({ success: true, results, source: 'opentripmap' });
  } catch (error) {
    console.error('Batch details error:', error.message);
    res.json({ success: true, results: [], source: 'fallback' });
  }
};

// ==========================================
// KEEP: Original suggestion endpoint (curated)
// GET /api/places/suggestions?category=Popular
// ==========================================
exports.getSuggestions = async (req, res) => {
  try {
    const { category = 'Popular' } = req.query;
    res.json({ success: true, results: getCuratedSuggestions(category) });
  } catch (error) {
    console.error('Suggestions error:', error.message);
    res.json({ success: true, results: [] });
  }
};

// ==========================================
// Fallback Data (when API key is not configured)
// ==========================================
function getFallbackGeoname(name) {
  const cities = {
    paris:       { name: 'Paris',      country: 'FR', lat: 48.8566, lon: 2.3522, population: 2161000 },
    tokyo:       { name: 'Tokyo',      country: 'JP', lat: 35.6762, lon: 139.6503, population: 13960000 },
    london:      { name: 'London',     country: 'GB', lat: 51.5074, lon: -0.1278, population: 8982000 },
    'new york':  { name: 'New York',   country: 'US', lat: 40.7128, lon: -74.0060, population: 8336000 },
    dubai:       { name: 'Dubai',      country: 'AE', lat: 25.2048, lon: 55.2708, population: 3331000 },
    rome:        { name: 'Rome',       country: 'IT', lat: 41.9028, lon: 12.4964, population: 2873000 },
    bali:        { name: 'Bali',       country: 'ID', lat: -8.3405, lon: 115.092, population: 4320000 },
    barcelona:   { name: 'Barcelona',  country: 'ES', lat: 41.3874, lon: 2.1686, population: 1620000 },
    singapore:   { name: 'Singapore',  country: 'SG', lat: 1.3521, lon: 103.8198, population: 5686000 },
    santorini:   { name: 'Santorini',  country: 'GR', lat: 36.3932, lon: 25.4615, population: 15550 },
    interlaken:  { name: 'Interlaken', country: 'CH', lat: 46.6863, lon: 7.8632, population: 5500 },
    jaipur:      { name: 'Jaipur',     country: 'IN', lat: 26.9124, lon: 75.7873, population: 3046000 },
    sydney:      { name: 'Sydney',     country: 'AU', lat: -33.8688, lon: 151.2093, population: 5312000 },
    maldives:    { name: 'Maldives',   country: 'MV', lat: 3.2028, lon: 73.2207, population: 557000 },
    istanbul:    { name: 'Istanbul',   country: 'TR', lat: 41.0082, lon: 28.9784, population: 15460000 },
    pokhara:     { name: 'Pokhara',    country: 'NP', lat: 28.2096, lon: 83.9856, population: 264991 },
    'cape town': { name: 'Cape Town',  country: 'ZA', lat: -33.9249, lon: 18.4241, population: 4618000 },
    mumbai:      { name: 'Mumbai',     country: 'IN', lat: 19.0760, lon: 72.8777, population: 20411000 },
    delhi:       { name: 'Delhi',      country: 'IN', lat: 28.7041, lon: 77.1025, population: 16787941 },
    goa:         { name: 'Goa',        country: 'IN', lat: 15.2993, lon: 74.124, population: 1458545 },
    manali:      { name: 'Manali',     country: 'IN', lat: 32.2396, lon: 77.1887, population: 8096 },
  };
  const key = name.toLowerCase().trim();
  return cities[key] || { name, country: '', lat: 0, lon: 0, population: 0, status: 'NOT_FOUND' };
}

function getFallbackPlaces(query) {
  const q = (query || '').toLowerCase();
  const places = [
    { xid: 'fb1', name: 'Walking Tour',     kinds: 'interesting_places,cultural', rate: 3, distance: 500, lat: 0, lon: 0 },
    { xid: 'fb2', name: 'Historic Museum',   kinds: 'museums,cultural',            rate: 3, distance: 1200, lat: 0, lon: 0 },
    { xid: 'fb3', name: 'City Park',         kinds: 'natural,parks',               rate: 2, distance: 800, lat: 0, lon: 0 },
    { xid: 'fb4', name: 'Famous Cathedral',  kinds: 'religion,architecture',       rate: 3, distance: 1500, lat: 0, lon: 0 },
    { xid: 'fb5', name: 'Local Market',      kinds: 'shops,foods',                 rate: 2, distance: 350, lat: 0, lon: 0 },
    { xid: 'fb6', name: 'Tower Viewpoint',   kinds: 'architecture,towers',         rate: 3, distance: 2100, lat: 0, lon: 0 },
    { xid: 'fb7', name: 'Adventure Sports',  kinds: 'sport,amusements',            rate: 2, distance: 3000, lat: 0, lon: 0 },
    { xid: 'fb8', name: 'Botanical Garden',  kinds: 'gardens,natural',             rate: 2, distance: 1800, lat: 0, lon: 0 },
  ];
  if (q) return places.map(p => ({ ...p, name: `${q.charAt(0).toUpperCase() + q.slice(1)} ${p.name}` }));
  return places;
}

function getCuratedSuggestions(category) {
  const suggestions = {
    Popular: [
      { name: 'Krabi', country: 'Thailand', rating: 4.8, tags: ['Beaches', 'Island', 'Nature'], image: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=400&q=80' },
      { name: 'Tokyo', country: 'Japan', rating: 4.7, tags: ['Culture', 'City Life', 'Food'], image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&q=80' },
      { name: 'Interlaken', country: 'Switzerland', rating: 4.6, tags: ['Mountains', 'Adventure', 'Nature'], image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80' },
      { name: 'Santorini', country: 'Greece', rating: 4.8, tags: ['Beach', 'Views', 'Romance'], image: 'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=400&q=80' },
      { name: 'New York', country: 'USA', rating: 4.6, tags: ['City Life', 'Shopping', 'Culture'], image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&q=80' },
      { name: 'Dubai', country: 'UAE', rating: 4.6, tags: ['Luxury', 'City Life', 'Adventure'], image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400&q=80' },
    ],
    Beaches: [
      { name: 'Krabi', country: 'Thailand', rating: 4.8, tags: ['Beaches', 'Island'], image: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=400&q=80' },
      { name: 'Maldives', country: 'Maldives', rating: 4.9, tags: ['Beach', 'Luxury'], image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=400&q=80' },
      { name: 'Bali', country: 'Indonesia', rating: 4.7, tags: ['Beach', 'Culture'], image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&q=80' },
    ],
    Mountains: [
      { name: 'Interlaken', country: 'Switzerland', rating: 4.6, tags: ['Mountains', 'Adventure'], image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80' },
      { name: 'Banff', country: 'Canada', rating: 4.7, tags: ['Mountains', 'Lakes'], image: 'https://images.unsplash.com/photo-1503614472-8c93d56e92ce?w=400&q=80' },
      { name: 'Manali', country: 'India', rating: 4.5, tags: ['Mountains', 'Trekking'], image: 'https://images.unsplash.com/photo-1626621331169-5f34be280ed9?w=400&q=80' },
    ],
  };
  return suggestions[category] || suggestions.Popular;
}
