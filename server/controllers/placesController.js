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
const Destination = require('../models/Destination');

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
// Suggestion endpoint (Dynamic from DB)
// GET /api/places/suggestions?category=Popular
// ==========================================
exports.getSuggestions = async (req, res) => {
  try {
    const { category = 'Popular' } = req.query;
    
    // Convert to case-insensitive search or tag search
    let dbQuery = {};
    const catLower = category.toLowerCase();
    
    if (catLower === 'popular') {
      dbQuery = { category: 'popular' };
    } else if (catLower === 'beaches') {
      dbQuery = { tags: { $in: ['beach', 'beaches', 'island'] } };
    } else if (catLower === 'mountains') {
      dbQuery = { tags: { $in: ['mountains', 'hiking', 'nature'] } };
    } else if (catLower === 'heritage') {
      dbQuery = { tags: { $in: ['history', 'culture', 'temples'] } };
    } else {
      // Fallback: search by tags or name
      dbQuery = { $or: [{ tags: catLower }, { category: catLower }] };
    }

    let destinations = await Destination.find(dbQuery).sort('-rating').limit(8);
    
    // If not enough results, just get top rated
    if (destinations.length === 0) {
      destinations = await Destination.find({}).sort('-rating').limit(8);
    }

    const results = destinations.map(d => ({
      name: d.name,
      country: d.country,
      rating: d.rating,
      tags: d.tags,
      image: d.image
    }));

    res.json({ success: true, results });
  } catch (error) {
    console.error('Suggestions error:', error.message);
    res.json({ success: true, results: [] });
  }
};

// ==========================================
// 8. ATTRACTIONS - Get attractions for a destination + category
// GET /api/places/attractions?destination=Paris&category=tourist+attractions
// ==========================================
exports.getAttractions = async (req, res) => {
  try {
    const { destination, category = 'tourist attractions' } = req.query;
    if (!destination || destination.length < 2) return res.json({ success: true, results: [] });

    // Build fallback data based on destination and category
    const destLower = destination.toLowerCase().trim();
    const catLower = (category || '').toLowerCase();

    const attractionsByCity = {
      paris: [
        { name: 'Eiffel Tower Visit', address: 'Champ de Mars, Paris', rating: 4.8, reviews: 342, category: 'Activity', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&q=80', estimatedPrice: 2500 },
        { name: 'Louvre Museum', address: 'Rue de Rivoli, Paris', rating: 4.7, reviews: 512, category: 'Activity', image: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=400&q=80', estimatedPrice: 2200 },
        { name: 'Notre-Dame Cathedral', address: 'Île de la Cité, Paris', rating: 4.6, reviews: 280, category: 'Heritage', image: 'https://images.unsplash.com/photo-1478391679764-b2d8b3cd1e94?w=400&q=80', estimatedPrice: 0 },
        { name: 'Montmartre Walking Tour', address: 'Montmartre, Paris', rating: 4.5, reviews: 198, category: 'Activity', image: 'https://images.unsplash.com/photo-1431274172761-fca41d930114?w=400&q=80', estimatedPrice: 1500 },
        { name: 'Seine River Cruise', address: 'Port de la Bourdonnais, Paris', rating: 4.7, reviews: 320, category: 'Activity', image: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=400&q=80', estimatedPrice: 1800 },
        { name: 'Le Bistro Parisien', address: 'Port de la Bourdonnais, Paris', rating: 4.3, reviews: 156, category: 'Food', image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=80', estimatedPrice: 3500 },
      ],
      tokyo: [
        { name: 'Sensoji Temple', address: 'Asakusa, Tokyo', rating: 4.7, reviews: 890, category: 'Heritage', image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&q=80', estimatedPrice: 0 },
        { name: 'Shibuya Crossing Walk', address: 'Shibuya, Tokyo', rating: 4.5, reviews: 450, category: 'Activity', image: 'https://images.unsplash.com/photo-1532236204992-f5e85c024202?w=400&q=80', estimatedPrice: 0 },
        { name: 'Tsukiji Fish Market', address: 'Tsukiji, Tokyo', rating: 4.8, reviews: 678, category: 'Food', image: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=400&q=80', estimatedPrice: 2000 },
        { name: 'Tokyo Tower', address: 'Minato, Tokyo', rating: 4.4, reviews: 320, category: 'Activity', image: 'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?w=400&q=80', estimatedPrice: 1200 },
        { name: 'Meiji Shrine', address: 'Shibuya, Tokyo', rating: 4.6, reviews: 540, category: 'Heritage', image: 'https://images.unsplash.com/photo-1590559899731-a382839e5549?w=400&q=80', estimatedPrice: 0 },
        { name: 'Ramen Street Experience', address: 'Tokyo Station, Tokyo', rating: 4.7, reviews: 380, category: 'Food', image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&q=80', estimatedPrice: 1500 },
      ],
      dubai: [
        { name: 'Burj Khalifa Visit', address: 'Downtown Dubai', rating: 4.9, reviews: 1200, category: 'Activity', image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400&q=80', estimatedPrice: 4500 },
        { name: 'Desert Safari', address: 'Dubai Desert', rating: 4.8, reviews: 980, category: 'Adventure', image: 'https://images.unsplash.com/photo-1546412414-8035e1776c92?w=400&q=80', estimatedPrice: 6000 },
        { name: 'Dubai Mall & Fountain Show', address: 'Downtown Dubai', rating: 4.6, reviews: 750, category: 'Activity', image: 'https://images.unsplash.com/photo-1608159473859-0097780f2eb1?w=400&q=80', estimatedPrice: 0 },
        { name: 'Palm Jumeirah Tour', address: 'Palm Jumeirah', rating: 4.5, reviews: 420, category: 'Activity', image: 'https://images.unsplash.com/photo-1526495124232-a04e1849168c?w=400&q=80', estimatedPrice: 3500 },
      ],
      london: [
        { name: 'Tower of London', address: 'Tower Hill, London', rating: 4.7, reviews: 890, category: 'Heritage', image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400&q=80', estimatedPrice: 3000 },
        { name: 'British Museum', address: 'Great Russell St, London', rating: 4.8, reviews: 1100, category: 'Activity', image: 'https://images.unsplash.com/photo-1505761671935-60b3a7427bad?w=400&q=80', estimatedPrice: 0 },
        { name: 'Buckingham Palace', address: 'Westminster, London', rating: 4.5, reviews: 670, category: 'Heritage', image: 'https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=400&q=80', estimatedPrice: 3200 },
      ],
      japan: [
        { name: 'Fushimi Inari Shrine', address: 'Kyoto, Japan', rating: 4.8, reviews: 920, category: 'Heritage', image: 'https://images.unsplash.com/photo-1478436127897-769e1b3f0f36?w=400&q=80', estimatedPrice: 0 },
        { name: 'Mount Fuji Day Trip', address: 'Shizuoka, Japan', rating: 4.9, reviews: 650, category: 'Adventure', image: 'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=400&q=80', estimatedPrice: 8500 },
        { name: 'Osaka Street Food Tour', address: 'Dotonbori, Osaka', rating: 4.7, reviews: 480, category: 'Food', image: 'https://images.unsplash.com/photo-1590559899731-a382839e5549?w=400&q=80', estimatedPrice: 3000 },
        { name: 'Hiroshima Peace Memorial', address: 'Hiroshima, Japan', rating: 4.6, reviews: 350, category: 'Heritage', image: 'https://images.unsplash.com/photo-1526481280693-3bfa7568e0f3?w=400&q=80', estimatedPrice: 200 },
      ],
      india: [
        { name: 'Taj Mahal Visit', address: 'Agra, India', rating: 4.9, reviews: 2500, category: 'Heritage', image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=400&q=80', estimatedPrice: 1100 },
        { name: 'Rajasthan Heritage Tour', address: 'Jaipur, India', rating: 4.7, reviews: 680, category: 'Heritage', image: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?w=400&q=80', estimatedPrice: 2500 },
        { name: 'Kerala Backwaters Cruise', address: 'Alleppey, India', rating: 4.6, reviews: 520, category: 'Activity', image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=400&q=80', estimatedPrice: 3500 },
      ],
    };

    // Try exact match, then partial
    let results = attractionsByCity[destLower];
    if (!results) {
      const key = Object.keys(attractionsByCity).find(k => destLower.includes(k) || k.includes(destLower));
      results = key ? attractionsByCity[key] : [];
    }

    // Filter by category if specified
    if (results.length > 0 && catLower && catLower !== 'tourist attractions') {
      const filtered = results.filter(r => r.category?.toLowerCase().includes(catLower.split(' ')[0]));
      if (filtered.length > 0) results = filtered;
    }

    // If still empty, generate generic results
    if (results.length === 0) {
      results = [
        { name: `${destination} City Tour`, address: destination, rating: 4.5, reviews: 200, category: 'Activity', image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&q=80', estimatedPrice: 2000 },
        { name: `${destination} Food Walk`, address: destination, rating: 4.3, reviews: 150, category: 'Food', image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=80', estimatedPrice: 1500 },
        { name: `${destination} Heritage Walk`, address: destination, rating: 4.4, reviews: 180, category: 'Heritage', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80', estimatedPrice: 800 },
        { name: `${destination} Adventure Tour`, address: destination, rating: 4.6, reviews: 120, category: 'Adventure', image: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=400&q=80', estimatedPrice: 3500 },
      ];
    }

    res.json({ success: true, results });
  } catch (error) {
    console.error('Attractions error:', error.message);
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
  
  const cityImages = {
    dubai: [
      'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400&q=80', // burj
      'https://images.unsplash.com/photo-1582672060624-cb83e580eec9?w=400&q=80', // skyline
      'https://images.unsplash.com/photo-1526495124232-a04e1849168c?w=400&q=80', // palm
      'https://images.unsplash.com/photo-1546412414-8035e1776c92?w=400&q=80', // desert
      'https://images.unsplash.com/photo-1608159473859-0097780f2eb1?w=400&q=80', // mall
      'https://images.unsplash.com/photo-1541905389647-75e9275b2ce0?w=400&q=80'  // marina
    ],
    paris: [
      'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&q=80',
      'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=400&q=80',
      'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=400&q=80',
      'https://images.unsplash.com/photo-1431274172761-fca41d930114?w=400&q=80'
    ]
  };

  const defaultImages = [
    'https://images.unsplash.com/photo-1488646953014-c8cb1968032f?w=400&q=80',
    'https://images.unsplash.com/photo-1503614472-8c93d56e92ce?w=400&q=80',
    'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=400&q=80',
    'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=400&q=80',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80',
    'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=400&q=80'
  ];

  const images = cityImages[q] || defaultImages;

  const places = [
    { xid: 'fb1', name: 'Walking Tour',     kinds: 'interesting_places,cultural', rate: 3, distance: 500, lat: 0, lon: 0, image: images[0 % images.length] },
    { xid: 'fb2', name: 'Historic Museum',   kinds: 'museums,cultural',            rate: 3, distance: 1200, lat: 0, lon: 0, image: images[1 % images.length] },
    { xid: 'fb3', name: 'City Park',         kinds: 'natural,parks',               rate: 2, distance: 800, lat: 0, lon: 0, image: images[2 % images.length] },
    { xid: 'fb4', name: 'Famous Cathedral',  kinds: 'religion,architecture',       rate: 3, distance: 1500, lat: 0, lon: 0, image: images[3 % images.length] },
    { xid: 'fb5', name: 'Local Market',      kinds: 'shops,foods',                 rate: 2, distance: 350, lat: 0, lon: 0, image: images[4 % images.length] },
    { xid: 'fb6', name: 'Tower Viewpoint',   kinds: 'architecture,towers',         rate: 3, distance: 2100, lat: 0, lon: 0, image: images[5 % images.length] },
    { xid: 'fb7', name: 'Adventure Sports',  kinds: 'sport,amusements',            rate: 2, distance: 3000, lat: 0, lon: 0, image: images[0 % images.length] },
    { xid: 'fb8', name: 'Botanical Garden',  kinds: 'gardens,natural',             rate: 2, distance: 1800, lat: 0, lon: 0, image: images[1 % images.length] },
  ];
  if (q) return places.map(p => ({ ...p, name: `${q.charAt(0).toUpperCase() + q.slice(1)} ${p.name}` }));
  return places;
}
