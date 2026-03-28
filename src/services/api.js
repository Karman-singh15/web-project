// API service to connect to the backend
export const fetchPriceComparisons = async (query) => {
    try {
        const response = await fetch(`/api/search?query=${encodeURIComponent(query)}`);
        if (!response.ok) {
            throw new Error(`API error: ${response.statusText}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Failed to fetch price comparisons:', error);
        return {
            query: query,
            results: []
        };
    }
};

export const fetchSuggestions = async (query) => {
    try {
        if (!query || query.length < 2) return [];
        const response = await fetch(`/api/suggestions?query=${encodeURIComponent(query)}`);
        if (!response.ok) {
            throw new Error(`API error: ${response.statusText}`);
        }
        const data = await response.json();
        return data.suggestions || [];
    } catch (error) {
        console.error('Failed to fetch suggestions:', error);
        return [];
    }
};
