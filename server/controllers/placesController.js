// ==========================================
// Places Controller - Outscraper API Proxy
// ==========================================

const axios = require('axios');

const OUTSCRAPER_KEY = process.env.OUTSCRAPER_API_KEY;
const OUTSCRAPER_BASE = 'https://api.app.outscraper.com';

// Helper to call Outscraper
const outscraper = async (endpoint, params) => {
  const res = await axios.get(`${OUTSCRAPER_BASE}${endpoint}`, {
    headers: { 'X-API-KEY': OUTSCRAPER_KEY },
    params,
    timeout: 15000
  });
  return res.data;
};

// @desc    Search places / city autocomplete
// @route   GET /api/places/search?q=Paris
exports.searchPlaces = async (req, res) => {
  try {
    const { q, limit = 8 } = req.query;
    if (!q || q.length < 2) return res.json({ success: true, results: [] });

    if (!OUTSCRAPER_KEY) {
      // Fallback static suggestions when no API key
      return res.json({ success: true, results: getFallbackCities(q), source: 'fallback' });
    }

    const data = await outscraper('/maps/search-v3', {
      query: q,
      limit,
      language: 'en',
      region: 'us'
    });

    const results = (data.data || []).flat().map(p => ({
      name: p.name || p.query,
      address: p.full_address || p.address || '',
      rating: p.rating || 0,
      reviews: p.reviews || 0,
      category: p.type || p.subtypes?.[0] || '',
      image: p.photo || p.main_photo || '',
      lat: p.latitude,
      lng: p.longitude,
      placeId: p.place_id || ''
    }));

    res.json({ success: true, results, source: 'outscraper' });
  } catch (error) {
    console.error('Places search error:', error.message);
    const { q } = req.query;
    res.json({ success: true, results: getFallbackCities(q || ''), source: 'fallback' });
  }
};

// @desc    Get tourist attractions for a destination
// @route   GET /api/places/attractions?destination=Paris&category=tourist
exports.getAttractions = async (req, res) => {
  try {
    const { destination, category = 'tourist attractions', limit = 12 } = req.query;
    if (!destination) return res.json({ success: true, results: [] });

    if (!OUTSCRAPER_KEY) {
      return res.json({ success: true, results: getFallbackAttractions(destination, category), source: 'fallback' });
    }

    const query = `${category} in ${destination}`;
    const data = await outscraper('/maps/search-v3', {
      query,
      limit,
      language: 'en'
    });

    const results = (data.data || []).flat().map(p => ({
      name: p.name || '',
      address: p.full_address || p.address || '',
      rating: p.rating || 0,
      reviews: p.reviews || 0,
      category: p.type || p.subtypes?.[0] || category,
      image: p.photo || p.main_photo || '',
      estimatedPrice: p.price_level ? p.price_level * 500 : 0,
      lat: p.latitude,
      lng: p.longitude,
      placeId: p.place_id || '',
      website: p.site || ''
    }));

    res.json({ success: true, results, source: 'outscraper' });
  } catch (error) {
    console.error('Attractions error:', error.message);
    const { destination, category } = req.query;
    res.json({ success: true, results: getFallbackAttractions(destination || '', category || ''), source: 'fallback' });
  }
};

// @desc    Get activity suggestions (popular, beaches, mountains, etc.)
// @route   GET /api/places/suggestions?category=Popular
exports.getSuggestions = async (req, res) => {
  try {
    const { category = 'Popular' } = req.query;
    // Return curated destination suggestions by category
    res.json({ success: true, results: getCuratedSuggestions(category) });
  } catch (error) {
    console.error('Suggestions error:', error.message);
    res.json({ success: true, results: [] });
  }
};

// ==========================================
// Fallback Data (when API key is not set)
// ==========================================
function getFallbackCities(query) {
  const cities = [
    { name: 'Paris', address: 'Paris, France', rating: 4.8, category: 'City', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&q=80' },
    { name: 'Tokyo', address: 'Tokyo, Japan', rating: 4.7, category: 'City', image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&q=80' },
    { name: 'New York', address: 'New York, USA', rating: 4.6, category: 'City', image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&q=80' },
    { name: 'London', address: 'London, UK', rating: 4.7, category: 'City', image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400&q=80' },
    { name: 'Dubai', address: 'Dubai, UAE', rating: 4.6, category: 'City', image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400&q=80' },
    { name: 'Bali', address: 'Bali, Indonesia', rating: 4.8, category: 'Island', image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&q=80' },
    { name: 'Rome', address: 'Rome, Italy', rating: 4.7, category: 'City', image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=400&q=80' },
    { name: 'Barcelona', address: 'Barcelona, Spain', rating: 4.6, category: 'City', image: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=400&q=80' },
    { name: 'Singapore', address: 'Singapore', rating: 4.7, category: 'City', image: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=400&q=80' },
    { name: 'Santorini', address: 'Santorini, Greece', rating: 4.8, category: 'Island', image: 'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=400&q=80' },
    { name: 'Interlaken', address: 'Interlaken, Switzerland', rating: 4.6, category: 'Mountains', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80' },
    { name: 'Jaipur', address: 'Jaipur, India', rating: 4.5, category: 'Heritage', image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=400&q=80' },
    { name: 'Sydney', address: 'Sydney, Australia', rating: 4.7, category: 'City', image: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=400&q=80' },
    { name: 'Maldives', address: 'Maldives', rating: 4.9, category: 'Beach', image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=400&q=80' },
    { name: 'Krabi', address: 'Krabi, Thailand', rating: 4.8, category: 'Beach', image: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=400&q=80' },
  ];
  const q = query.toLowerCase();
  return cities.filter(c => c.name.toLowerCase().includes(q) || c.address.toLowerCase().includes(q)).slice(0, 8);
}

function getFallbackAttractions(destination, category) {
  const base = [
    { name: `${destination} Walking Tour`, category: 'Tour', rating: 4.5, reviews: 320, image: '', estimatedPrice: 1500 },
    { name: `${destination} Food Experience`, category: 'Food', rating: 4.7, reviews: 215, image: '', estimatedPrice: 2000 },
    { name: `Top Museums in ${destination}`, category: 'Museum', rating: 4.6, reviews: 450, image: '', estimatedPrice: 800 },
    { name: `${destination} Night Tour`, category: 'Tour', rating: 4.4, reviews: 180, image: '', estimatedPrice: 1200 },
    { name: `Adventure Sports - ${destination}`, category: 'Adventure', rating: 4.3, reviews: 95, image: '', estimatedPrice: 3500 },
    { name: `${destination} Local Market`, category: 'Shopping', rating: 4.2, reviews: 650, image: '', estimatedPrice: 500 },
  ];
  return base;
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
      { name: 'Banff', country: 'Canada', rating: 4.7, tags: ['Mountains', 'Lakes', 'Nature'], image: 'https://images.unsplash.com/photo-1503614472-8c93d56e92ce?w=400&q=80' },
      { name: 'Jaipur', country: 'India', rating: 4.5, tags: ['Heritage', 'Culture', 'History'], image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=400&q=80' },
    ],
    Beaches: [
      { name: 'Krabi', country: 'Thailand', rating: 4.8, tags: ['Beaches', 'Island', 'Nature'], image: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=400&q=80' },
      { name: 'Maldives', country: 'Maldives', rating: 4.9, tags: ['Beach', 'Luxury', 'Diving'], image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=400&q=80' },
      { name: 'Santorini', country: 'Greece', rating: 4.8, tags: ['Beach', 'Views', 'Romance'], image: 'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=400&q=80' },
      { name: 'Bali', country: 'Indonesia', rating: 4.7, tags: ['Beach', 'Culture', 'Surfing'], image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&q=80' },
      { name: 'Cancún', country: 'Mexico', rating: 4.5, tags: ['Beach', 'Nightlife', 'Resorts'], image: 'https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?w=400&q=80' },
      { name: 'Phuket', country: 'Thailand', rating: 4.6, tags: ['Beach', 'Nightlife', 'Island'], image: 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=400&q=80' },
    ],
    Mountains: [
      { name: 'Interlaken', country: 'Switzerland', rating: 4.6, tags: ['Mountains', 'Adventure', 'Nature'], image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80' },
      { name: 'Banff', country: 'Canada', rating: 4.7, tags: ['Mountains', 'Lakes', 'Nature'], image: 'https://images.unsplash.com/photo-1503614472-8c93d56e92ce?w=400&q=80' },
      { name: 'Manali', country: 'India', rating: 4.5, tags: ['Mountains', 'Trekking', 'Snow'], image: 'https://images.unsplash.com/photo-1626621331169-5f34be280ed9?w=400&q=80' },
      { name: 'Queenstown', country: 'New Zealand', rating: 4.8, tags: ['Mountains', 'Adventure', 'Bungee'], image: 'https://images.unsplash.com/photo-1589871973318-9ca1258faa5d?w=400&q=80' },
      { name: 'Patagonia', country: 'Argentina', rating: 4.7, tags: ['Mountains', 'Hiking', 'Glaciers'], image: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=400&q=80' },
      { name: 'Zermatt', country: 'Switzerland', rating: 4.6, tags: ['Mountains', 'Skiing', 'Matterhorn'], image: 'https://images.unsplash.com/photo-1529973625058-a665431e23f0?w=400&q=80' },
    ],
    Heritage: [
      { name: 'Jaipur', country: 'India', rating: 4.5, tags: ['Heritage', 'Culture', 'History'], image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=400&q=80' },
      { name: 'Rome', country: 'Italy', rating: 4.7, tags: ['Heritage', 'History', 'Art'], image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=400&q=80' },
      { name: 'Athens', country: 'Greece', rating: 4.5, tags: ['Heritage', 'History', 'Culture'], image: 'https://images.unsplash.com/photo-1555993539-1732b0258235?w=400&q=80' },
      { name: 'Cairo', country: 'Egypt', rating: 4.4, tags: ['Heritage', 'Pyramids', 'History'], image: 'https://images.unsplash.com/photo-1539768942893-daf53e736495?w=400&q=80' },
      { name: 'Kyoto', country: 'Japan', rating: 4.7, tags: ['Heritage', 'Temples', 'Gardens'], image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400&q=80' },
      { name: 'Petra', country: 'Jordan', rating: 4.8, tags: ['Heritage', 'Ancient', 'Desert'], image: 'https://images.unsplash.com/photo-1579606032821-4e6161c81571?w=400&q=80' },
    ],
    Adventure: [
      { name: 'Queenstown', country: 'New Zealand', rating: 4.8, tags: ['Adventure', 'Bungee', 'Nature'], image: 'https://images.unsplash.com/photo-1589871973318-9ca1258faa5d?w=400&q=80' },
      { name: 'Costa Rica', country: 'Costa Rica', rating: 4.6, tags: ['Adventure', 'Rainforest', 'Wildlife'], image: 'https://images.unsplash.com/photo-1518259102261-b40117eabbc9?w=400&q=80' },
      { name: 'Iceland', country: 'Iceland', rating: 4.7, tags: ['Adventure', 'Northern Lights', 'Volcanoes'], image: 'https://images.unsplash.com/photo-1504829857797-ddff29c27927?w=400&q=80' },
      { name: 'Nepal', country: 'Nepal', rating: 4.6, tags: ['Adventure', 'Trekking', 'Himalayas'], image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=400&q=80' },
      { name: 'Cape Town', country: 'South Africa', rating: 4.5, tags: ['Adventure', 'Safari', 'Nature'], image: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=400&q=80' },
      { name: 'Patagonia', country: 'Argentina', rating: 4.7, tags: ['Adventure', 'Hiking', 'Glaciers'], image: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=400&q=80' },
    ],
    'Food & Culture': [
      { name: 'Tokyo', country: 'Japan', rating: 4.7, tags: ['Food', 'Culture', 'City Life'], image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&q=80' },
      { name: 'Bangkok', country: 'Thailand', rating: 4.5, tags: ['Food', 'Culture', 'Temples'], image: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=400&q=80' },
      { name: 'Barcelona', country: 'Spain', rating: 4.6, tags: ['Food', 'Architecture', 'Beach'], image: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=400&q=80' },
      { name: 'Istanbul', country: 'Turkey', rating: 4.6, tags: ['Food', 'Culture', 'Markets'], image: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=400&q=80' },
      { name: 'Marrakech', country: 'Morocco', rating: 4.4, tags: ['Food', 'Culture', 'Markets'], image: 'https://images.unsplash.com/photo-1597212618440-806262de4f6b?w=400&q=80' },
      { name: 'Lima', country: 'Peru', rating: 4.5, tags: ['Food', 'Culture', 'History'], image: 'https://images.unsplash.com/photo-1531968455001-5c5272a67c71?w=400&q=80' },
    ],
  };
  return suggestions[category] || suggestions.Popular;
}
