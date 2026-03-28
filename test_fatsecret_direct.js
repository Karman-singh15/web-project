import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const CLIENT_ID = (process.env.FATSECRET_CLIENT_ID || '').trim();
const CLIENT_SECRET = (process.env.FATSECRET_CLIENT_SECRET || '').trim();

console.log('Using Client ID (first 5 chars):', CLIENT_ID.substring(0, 5) + '...');

async function getAccessToken() {
    try {
        const credentials = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
        const response = await axios.post('https://oauth.fatsecret.com/connect/token', 
            'grant_type=client_credentials&scope=premier', {
            headers: {
                'Authorization': `Basic ${credentials}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        return response.data.access_token;
    } catch (error) {
        console.error('Error fetching access token (premier scope):', error.response?.data || error.message);
        
        // Try basic scope if premier fails
        try {
            console.log('Retrying with basic scope...');
            const credentials = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
            const response = await axios.post('https://oauth.fatsecret.com/connect/token', 
                'grant_type=client_credentials&scope=basic', {
                headers: {
                    'Authorization': `Basic ${credentials}`,
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });
            return response.data.access_token;
        } catch (innerError) {
            console.error('Error fetching access token (basic scope):', innerError.response?.data || innerError.message);
            process.exit(1);
        }
    }
}

async function testSearch(query) {
    try {
        const token = await getAccessToken();
        console.log('Access Token obtained successfully.');
        
        const response = await axios.get('https://platform.fatsecret.com/rest/foods/search/v1', {
            headers: { 'Authorization': `Bearer ${token}` },
            params: { 
                search_expression: query, 
                format: 'json', 
                max_results: 5 
            }
        });

        console.log('API Response for query:', query);
        console.log(JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.error('API Error:', error.response?.data || error.message);
    }
}

const query = process.argv[2] || 'Pizza';
testSearch(query);
