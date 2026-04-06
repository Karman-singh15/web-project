import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const API_KEY = process.env.QUICKCOMMERCE_API_KEY;
const LAT = process.env.DELIVERY_LAT || '12.9021';
const LON = process.env.DELIVERY_LON || '77.6639';
const PINCODE = process.env.DELIVERY_PINCODE || '560103';
const BASE_URL = 'https://api.quickcommerceapi.com';

app.use(cors());
app.use(express.json());

const PLATFORMS = ['BlinkIt', 'Zepto', 'Swiggy', 'BigBasket', 'JioMart'];

const PLATFORM_ID_MAP = {
  BlinkIt: 'blinkit',
  Zepto: 'zepto',
  Swiggy: 'swiggy',
  BigBasket: 'bigbasket',
  JioMart: 'jiomart',
};

// ── Fetch ETA for all platforms ───────────────────────────────────────────────
async function fetchGroupETA() {
  try {
    const url = `${BASE_URL}/v1/groupeta?lat=${LAT}&lon=${LON}&pincode=${PINCODE}&platforms=${PLATFORMS.join(',')}`;
    const res = await fetch(url, { headers: { 'X-API-Key': API_KEY } });
    if (!res.ok) return {};
    const json = await res.json();
    const etaMap = {};
    for (const r of json?.data?.results || []) {
      etaMap[r.platform] = r.eta; // e.g. "14 mins"
    }
    return etaMap;
  } catch {
    return {};
  }
}

function extractUnitInfo(name, quantityStr, price) {
  const combined = `${quantityStr || ''} ${name || ''}`.toLowerCase();
  const regex = /(\d+(?:\.\d+)?)\s*(kg|g|ml|l|liter|liters|pc|pcs|piece|pieces|pages|page|gm|gms)\b/i;
  const match = combined.match(regex);
  if (!match) return null;
  
  const amount = parseFloat(match[1]);
  let unit = match[2].toLowerCase();
  
  if (!amount || amount <= 0 || !price) return null;

  if (['g', 'gm', 'gms'].includes(unit)) return { unitPrice: (price / amount) * 100, unitMetric: '100g' };
  if (['kg'].includes(unit)) return { unitPrice: price / amount, unitMetric: 'kg' };
  if (['ml'].includes(unit)) return { unitPrice: (price / amount) * 100, unitMetric: '100ml' };
  if (['l', 'liter', 'liters'].includes(unit)) return { unitPrice: price / amount, unitMetric: 'L' };
  if (['pc', 'pcs', 'piece', 'pieces'].includes(unit)) return { unitPrice: price / amount, unitMetric: 'pc' };
  if (['page', 'pages'].includes(unit)) return { unitPrice: (price / amount) * 100, unitMetric: '100 pgs' };

  return null;
}

// ── Search endpoint ───────────────────────────────────────────────────────────
app.get('/api/search', async (req, res) => {
  const query = req.query.query;
  if (!query) return res.status(400).json({ error: 'Search query is required' });

  console.log(`\n=== Search: "${query}" ===`);

  // Run group search + group ETA in parallel
  const searchUrl = `${BASE_URL}/v1/groupsearch?q=${encodeURIComponent(query)}&lat=${LAT}&lon=${LON}&pincode=${PINCODE}&platforms=${PLATFORMS.join(',')}`;

  const [searchRes, etaMap] = await Promise.all([
    fetch(searchUrl, { headers: { 'X-API-Key': API_KEY } }).then(r => r.json()),
    fetchGroupETA(),
  ]);

  if (searchRes.status !== 'success') {
    console.error('API error:', searchRes);
    return res.status(502).json({ error: 'Failed to fetch prices from QuickCommerce API' });
  }

  const platformResults = searchRes.data?.results || {};
  const results = [];

  for (const platformName of PLATFORMS) {
    const products = platformResults[platformName] || [];
    if (products.length === 0) continue;

    const top = products[0]; // best match
    const etaString = top?.platform?.sla || etaMap[platformName] || '—';
    const deliveryMins = parseInt(etaString) || 60;
    const finalPrice = top.offer_price ?? top.mrp ?? 0;
    const unitInfo = extractUnitInfo(top.name, top.quantity, finalPrice);

    results.push({
      id: PLATFORM_ID_MAP[platformName] || platformName.toLowerCase(),
      platform: platformName === 'Swiggy' ? 'Swiggy Instamart' : platformName,
      price: finalPrice,
      mrp: top.mrp ?? null,
      deliveryTime: deliveryMins,
      deliverySLA: etaString,
      isBestDeal: false,
      dataSource: 'live',
      productName: top.name,
      brand: top.brand || null,
      quantity: top.quantity || null,
      unitPrice: unitInfo ? unitInfo.unitPrice : null,
      unitMetric: unitInfo ? unitInfo.unitMetric : null,
      image: top.images?.[0] || null,
      rating: top.rating || null,
      ratingCount: top.rating_count || null,
      deeplink: top.deeplink || null,
      available: top.available !== false,
    });
  }

  if (results.length === 0) {
    return res.status(404).json({ error: 'No products found' });
  }

  // Sort by price, mark best deal
  results.sort((a, b) => a.price - b.price);
  results[0].isBestDeal = true;

  // Use the matched product name from the cheapest result as the display query
  const displayName = results[0].productName || query;

  console.log(`Found ${results.length} platforms. Credits remaining: ${searchRes.credits_remaining}`);
  res.json({ query: displayName, results });
});

// ── Suggestions endpoint ──────────────────────────────────────────────────────
app.get('/api/suggestions', async (req, res) => {
  const query = req.query.query;
  if (!query || query.length < 2) return res.json({ suggestions: [] });

  const POPULAR = [
    'Milk', 'Eggs', 'Bread', 'Bananas', 'Coffee', 'Tea',
    'Onions', 'Tomatoes', 'Potatoes', 'Rice', 'Atta', 'Dal',
    'Cooking Oil', 'Butter', 'Paneer', 'Chicken', 'Fish', 'Curd',
    'Lemon', 'Spinach', 'Biscuits', 'Noodles', 'Soap', 'Shampoo',
  ];

  const q = query.toLowerCase();
  const matched = POPULAR.filter(p => p.toLowerCase().includes(q));
  const suggestions = matched.length > 0
    ? matched.slice(0, 6)
    : [`${query} fresh`, `${query} pack`, `${query} 500g`, `${query} organic`];

  res.json({ suggestions });
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
  console.log(`Using location: ${LAT}, ${LON}`);
  console.log(`Platforms: ${PLATFORMS.join(', ')}`);
});
