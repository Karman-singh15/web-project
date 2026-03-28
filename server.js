import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Helper to parse Netscape cookie file
function parseNetscapeCookies(filePath) {
    try {
        if (!fs.existsSync(filePath)) {
            console.warn(`Cookie file not found at ${filePath}`);
            return [];
        }
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');
        const cookies = [];

        for (const line of lines) {
            if (!line || line.startsWith('#') || line.trim() === '') continue;

            const parts = line.split('\t');
            if (parts.length < 7) continue;

            const [domain, flag, pathValue, secure, expiration, name, value] = parts;
            
            // Include blinkit.com and grofers.com
            if (domain.includes('blinkit.com') || domain.includes('grofers.com')) {
                cookies.push({
                    name: name.trim(),
                    value: value.trim(),
                    domain: domain.startsWith('.') ? domain : `.${domain}`,
                    path: pathValue || '/',
                    expires: parseInt(expiration, 10) || -1,
                    httpOnly: false,
                    secure: secure === 'TRUE',
                    sameSite: 'Lax'
                });
            }
        }
        return cookies;
    } catch (error) {
        console.error('Error parsing cookies:', error.message);
        return [];
    }
}

async function scrapeBlinkitPrice(query) {
    let browser;
    try {
        browser = await chromium.launch({ headless: true });
        const context = await browser.newContext({
            userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            viewport: { width: 1280, height: 800 }
        });
        
        // Load cookies from cookies.txt (preferred) or blinkit.txt
        const cookiePath = fs.existsSync(path.join(process.cwd(), 'cookies.txt')) 
            ? path.join(process.cwd(), 'cookies.txt')
            : path.join(process.cwd(), 'blinkit.txt');
            
        const cookies = parseNetscapeCookies(cookiePath);
        if (cookies.length > 0) {
            await context.addCookies(cookies);
            console.log(`Successfully loaded ${cookies.length} cookies from ${path.basename(cookiePath)}`);
        }

        const page = await context.newPage();
        const url = `https://blinkit.com/s/?q=${encodeURIComponent(query)}`;
        console.log(`Navigating to ${url}`);
        
        await page.goto(url, { waitUntil: 'load', timeout: 60000 });

        // Wait for the price element
        const priceSelector = '.tw-text-200.tw-font-semibold';
        console.log(`Waiting for selector: ${priceSelector}`);
        
        try {
            await page.waitForSelector(priceSelector, { timeout: 30000 });
        } catch (e) {
            console.warn(`Timeout waiting for ${priceSelector}, taking screenshot and trying fallback...`);
            await page.screenshot({ path: '/tmp/blinkit_error.png' });
            // Check if there are any results or if we are blocked
            const html = await page.content();
            if (html.includes('Access Denied') || html.includes('Detection')) {
                throw new Error('Blocked by anti-bot measures');
            }
            throw e;
        }

        const firstPrice = await page.$eval(priceSelector, el => el.innerText);
        
        // Try to get product name
        const productName = await page.$eval('div[data-pf="reset"] h3, .tw-text-400', el => el.innerText).catch(() => query);

        const numericPrice = parseInt(firstPrice.replace(/[^\d]/g, ''), 10);
        console.log(`Found price: ₹${numericPrice} for ${productName}`);

        await browser.close();
        return { price: numericPrice, name: productName };
    } catch (error) {
        console.error('Scraping error:', error.message);
        if (browser) await browser.close();
        return null;
    }
}

app.get('/api/search', async (req, res) => {
    const query = req.query.query;
    if (!query) {
        return res.status(400).json({ error: 'Search query is required' });
    }

    try {
        console.log(`Search request for: ${query}`);
        const scrapedData = await scrapeBlinkitPrice(query);
        
        let basePrice = 100;
        let foodName = query;

        if (scrapedData) {
            basePrice = scrapedData.price;
            foodName = scrapedData.name;
        } else {
            console.warn("Scraping failed, using fallback logic");
            let charSum = 0;
            for(let i=0; i<query.length; i++) charSum += query.charCodeAt(i);
            basePrice = 50 + (charSum % 300);
        }

        const MOCK_PLATFORMS = [
            { id: 'amazon_fresh', name: 'Amazon Fresh', deliveryTimeBase: 120 },
            { id: 'blinkit', name: 'Blinkit', deliveryTimeBase: 11 },
            { id: 'zepto', name: 'Zepto', deliveryTimeBase: 180 },
        ];

        let results = MOCK_PLATFORMS.map(platform => {
            if (platform.id === 'blinkit' && scrapedData) {
                return {
                    id: platform.id,
                    platform: platform.name,
                    price: basePrice,
                    deliveryTime: 11,
                    isBestDeal: false,
                };
            }

            const pseudoRandom = Math.sin(basePrice * platform.id.length) * 0.15;
            const platformPrice = Math.round(basePrice * (1 + pseudoRandom));
            
            return {
                id: platform.id,
                platform: platform.name,
                price: platformPrice,
                deliveryTime: platform.deliveryTimeBase,
                isBestDeal: false,
            };
        });

        if (results.length > 0) {
            results.sort((a, b) => a.price - b.price);
            results[0].isBestDeal = true;
        }

        res.json({ query: foodName, results: results });

    } catch (error) {
        console.error('Error in search endpoint:', error.message);
        res.status(500).json({ error: 'Internal server error while searching' });
    }
});

app.get('/api/suggestions', async (req, res) => {
    const query = req.query.query;
    if (!query || query.length < 2) {
        return res.json({ suggestions: [] });
    }

    const suggestions = [
        query.toLowerCase(),
        `${query.toLowerCase()} fresh`,
        `${query.toLowerCase()} pack`,
        `${query.toLowerCase()} 500g`,
        `${query.toLowerCase()} organic`
    ];
    res.json({ suggestions });
});

app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
});
