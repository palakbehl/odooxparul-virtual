// ==========================================
// Destination Controller - Traveloop
// ==========================================

const Destination = require('../models/Destination');

// ==========================================
// @desc    Get all destinations (with filters)
// @route   GET /api/destinations
// @access  Public
// ==========================================
exports.getDestinations = async (req, res) => {
  try {
    const { category, search, sort = '-rating', page = 1, limit = 20 } = req.query;

    const query = {};
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { country: { $regex: search, $options: 'i' } }
      ];
    }

    const destinations = await Destination.find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Destination.countDocuments(query);

    res.json({
      success: true,
      destinations,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get destinations error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ==========================================
// @desc    Get top/featured destinations
// @route   GET /api/destinations/featured
// @access  Public
// ==========================================
exports.getFeaturedDestinations = async (req, res) => {
  try {
    const popular = await Destination.find({ category: 'popular' }).sort('-rating').limit(5);
    const trending = await Destination.find({ category: 'trending' }).sort('-createdAt').limit(5);
    const hiddenGems = await Destination.find({ category: 'hidden-gem' }).sort('-rating').limit(5);

    res.json({
      success: true,
      featured: { popular, trending, hiddenGems }
    });
  } catch (error) {
    console.error('Get featured destinations error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ==========================================
// @desc    Get single destination
// @route   GET /api/destinations/:id
// @access  Public
// ==========================================
exports.getDestination = async (req, res) => {
  try {
    const destination = await Destination.findById(req.params.id);
    if (!destination) {
      return res.status(404).json({ success: false, message: 'Destination not found' });
    }
    res.json({ success: true, destination });
  } catch (error) {
    console.error('Get destination error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ==========================================
// @desc    Seed default destinations
// @route   POST /api/destinations/seed
// @access  Public (dev only)
// ==========================================
exports.seedDestinations = async (req, res) => {
  try {
    const count = await Destination.countDocuments();
    if (count > 0) {
      return res.json({ success: true, message: 'Destinations already seeded', count });
    }

    const defaultDestinations = [
      {
        name: 'Santorini',
        country: 'Greece',
        description: 'Iconic white-washed buildings overlooking the Aegean Sea, breathtaking sunsets, and volcanic beaches.',
        image: 'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=800&q=80',
        rating: 4.9,
        category: 'popular',
        tags: ['beach', 'romantic', 'island'],
        averageBudget: 2500,
        bestTimeToVisit: 'June - September',
        highlights: ['Oia Sunset', 'Red Beach', 'Fira Town', 'Wine Tasting']
      },
      {
        name: 'Krabi',
        country: 'Thailand',
        description: 'Stunning limestone cliffs, crystal-clear waters, and hidden lagoons in southern Thailand.',
        image: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800&q=80',
        rating: 4.7,
        category: 'popular',
        tags: ['beach', 'adventure', 'budget'],
        averageBudget: 1200,
        bestTimeToVisit: 'November - April',
        highlights: ['Railay Beach', 'Four Islands Tour', 'Tiger Cave Temple', 'Phi Phi Islands']
      },
      {
        name: 'Tokyo',
        country: 'Japan',
        description: 'A mesmerizing blend of ultramodern skyscrapers, ancient temples, and world-renowned cuisine.',
        image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80',
        rating: 4.8,
        category: 'trending',
        tags: ['city', 'culture', 'food'],
        averageBudget: 3000,
        bestTimeToVisit: 'March - May, October - November',
        highlights: ['Shibuya Crossing', 'Senso-ji Temple', 'Tsukiji Market', 'Mount Fuji Day Trip']
      },
      {
        name: 'Banff',
        country: 'Canada',
        description: 'Pristine mountain landscapes, turquoise lakes, and world-class hiking in the Canadian Rockies.',
        image: 'https://images.unsplash.com/photo-1503614472-8c93d56e92ce?w=800&q=80',
        rating: 4.8,
        category: 'popular',
        tags: ['nature', 'hiking', 'mountains'],
        averageBudget: 2200,
        bestTimeToVisit: 'June - September',
        highlights: ['Lake Louise', 'Moraine Lake', 'Johnston Canyon', 'Icefields Parkway']
      },
      {
        name: 'Cartagena',
        country: 'Colombia',
        description: 'Vibrant colonial architecture, Caribbean beaches, and rich cultural heritage on the Colombian coast.',
        image: 'https://images.unsplash.com/photo-1583997052103-b4a1cb974ce5?w=800&q=80',
        rating: 4.6,
        category: 'trending',
        tags: ['culture', 'beach', 'history'],
        averageBudget: 1500,
        bestTimeToVisit: 'December - April',
        highlights: ['Old Walled City', 'Rosario Islands', 'Castillo San Felipe', 'Street Food Tours']
      },
      {
        name: 'Bali',
        country: 'Indonesia',
        description: 'Lush rice terraces, ancient temples, world-class surfing, and spiritual retreats.',
        image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80',
        rating: 4.7,
        category: 'popular',
        tags: ['beach', 'culture', 'wellness'],
        averageBudget: 1400,
        bestTimeToVisit: 'April - October',
        highlights: ['Ubud Rice Terraces', 'Uluwatu Temple', 'Seminyak Beach', 'Mount Batur Sunrise']
      },
      {
        name: 'Iceland',
        country: 'Iceland',
        description: 'Land of fire and ice featuring geysers, waterfalls, northern lights, and volcanic landscapes.',
        image: 'https://images.unsplash.com/photo-1504893524553-b855bce32c67?w=800&q=80',
        rating: 4.9,
        category: 'trending',
        tags: ['nature', 'adventure', 'unique'],
        averageBudget: 3500,
        bestTimeToVisit: 'June - August, Sept - March for Northern Lights',
        highlights: ['Golden Circle', 'Blue Lagoon', 'Northern Lights', 'Glacier Hiking']
      },
      {
        name: 'Marrakech',
        country: 'Morocco',
        description: 'Bustling souks, ornate palaces, vibrant gardens, and the gateway to the Sahara Desert.',
        image: 'https://images.unsplash.com/photo-1597212618440-806262de4f6b?w=800&q=80',
        rating: 4.5,
        category: 'hidden-gem',
        tags: ['culture', 'adventure', 'food'],
        averageBudget: 1100,
        bestTimeToVisit: 'March - May, September - November',
        highlights: ['Jemaa el-Fnaa', 'Majorelle Garden', 'Bahia Palace', 'Sahara Desert Tour']
      },
      {
        name: 'Dubrovnik',
        country: 'Croatia',
        description: 'Stunning medieval walled city on the Adriatic coast, the real-life King\'s Landing.',
        image: 'https://images.unsplash.com/photo-1555990793-da11153b2473?w=800&q=80',
        rating: 4.7,
        category: 'hidden-gem',
        tags: ['history', 'beach', 'culture'],
        averageBudget: 1800,
        bestTimeToVisit: 'May - June, September',
        highlights: ['City Walls Walk', 'Lokrum Island', 'Old Town', 'Cable Car Ride']
      },
      {
        name: 'Kyoto',
        country: 'Japan',
        description: 'Ancient capital of Japan with thousands of temples, stunning gardens, and geisha districts.',
        image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80',
        rating: 4.9,
        category: 'hidden-gem',
        tags: ['culture', 'temples', 'nature'],
        averageBudget: 2800,
        bestTimeToVisit: 'March - May, October - November',
        highlights: ['Fushimi Inari', 'Arashiyama Bamboo Grove', 'Kinkaku-ji', 'Gion District']
      }
    ];

    await Destination.insertMany(defaultDestinations);

    res.status(201).json({
      success: true,
      message: `${defaultDestinations.length} destinations seeded successfully!`,
      count: defaultDestinations.length
    });
  } catch (error) {
    console.error('Seed destinations error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
