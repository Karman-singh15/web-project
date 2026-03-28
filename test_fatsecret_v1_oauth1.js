import crypto from 'crypto';
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const CONSUMER_KEY = (process.env.FATSECRET_CLIENT_ID || '').trim();
const CONSUMER_SECRET = (process.env.FATSECRET_CLIENT_SECRET || '').trim();

function generateOAuth1Header(method, url, params) {
    const oauthParams = {
        oauth_consumer_key: CONSUMER_KEY,
        oauth_signature_method: 'HMAC-SHA1',
        oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
        oauth_nonce: crypto.randomBytes(16).toString('hex'),
        oauth_version: '1.0',
        ...params
    };

    // Sort params
    const sortedKeys = Object.keys(oauthParams).sort();
    const baseStringParams = sortedKeys.map(key => 
        `${encodeURIComponent(key)}=${encodeURIComponent(oauthParams[key])}`
    ).join('&');

    const baseString = `${method.toUpperCase()}&${encodeURIComponent(url)}&${encodeURIComponent(baseStringParams)}`;
    const signingKey = `${encodeURIComponent(CONSUMER_SECRET)}&`;
    const signature = crypto.createHmac('sha1', signingKey).update(baseString).digest('base64');

    oauthParams.oauth_signature = signature;
    
    // Construct the Authorization header
    const header = 'OAuth ' + Object.keys(oauthParams)
        .sort()
        .map(key => `${encodeURIComponent(key)}="${encodeURIComponent(oauthParams[key])}"`)
        .join(', ');
    
    return header;
}

async function testOAuth1(query) {
    const url = 'https://platform.fatsecret.com/rest/foods/search/v1';
    const params = {
        search_expression: query,
        format: 'json',
        max_results: '5'
    };

    try {
        const authHeader = generateOAuth1Header('GET', url, params);
        console.log('Using OAuth 1.0 Authorization Header.');
        
        const response = await axios.get(url, {
            headers: { 'Authorization': authHeader },
            params: params
        });

        console.log('API Response (OAuth 1.0):');
        console.log(JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.error('API Error (OAuth 1.0):', error.response?.data || error.message);
    }
}

const query = process.argv[2] || 'Pizza';
testOAuth1(query);
