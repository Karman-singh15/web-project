import { useState, useEffect } from 'react';
import './SearchBar.css';
import { fetchSuggestions } from '../services/api';

const SearchBar = ({ onSearch, initialQuery = '', isLoading = false }) => {
    const [query, setQuery] = useState(initialQuery);
    const [isFocused, setIsFocused] = useState(false);
    const [suggestions, setSuggestions] = useState(['Milk', 'Eggs', 'Bread', 'Bananas', 'Coffee']);
    const [showSuggestions, setShowSuggestions] = useState(false);

    useEffect(() => {
        const fetchAutoSuggestions = async () => {
            if (query.trim().length >= 2) {
                const results = await fetchSuggestions(query);
                if (results && results.length > 0) {
                    setSuggestions(results);
                } else {
                    setSuggestions([query]); // Fallback if no matching hits
                }
            } else {
                setSuggestions(['Milk', 'Eggs', 'Bread', 'Bananas', 'Coffee']);
            }
        };

        const timerId = setTimeout(() => {
            fetchAutoSuggestions();
        }, 300); // 300ms debounce

        return () => clearTimeout(timerId);
    }, [query]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (query.trim()) {
            onSearch(query);
            setIsFocused(false);
            setShowSuggestions(false);
        }
    };

    return (
        <div className={`search-container ${isFocused ? 'focused' : ''}`}>
            <form className="search-box glass-panel" onSubmit={handleSubmit}>
                <div className="search-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                </div>
                <input
                    type="text"
                    className="search-input"
                    placeholder="Search for groceries..."
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setShowSuggestions(true);
                    }}
                    onFocus={() => {
                        setIsFocused(true);
                        setShowSuggestions(true);
                    }}
                    onBlur={() => {
                        setIsFocused(false);
                        // Delay hiding so clicks on suggestions can register
                        setTimeout(() => setShowSuggestions(false), 200);
                    }}
                />
                <button type="submit" className="search-btn" disabled={isLoading}>
                    {isLoading ? (
                        <svg className="spinner-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="2" x2="12" y2="6"></line>
                            <line x1="12" y1="18" x2="12" y2="22"></line>
                            <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
                            <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
                            <line x1="2" y1="12" x2="6" y2="12"></line>
                            <line x1="18" y1="12" x2="22" y2="12"></line>
                            <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
                            <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
                        </svg>
                    ) : (
                        'Compare'
                    )}
                </button>
            </form>

            {showSuggestions && (query.length === 0 || suggestions.length > 0) && (
                <div className="search-suggestions glass-panel animate-fade-in">
                    <p className="suggestions-title">{query.length >= 2 ? 'Suggestions based on typing:' : 'Trending Searches'}</p>
                    <div className="suggestion-tags">
                        {suggestions.map((item, index) => (
                            <span key={`${item}-${index}`} className="suggestion-tag" onMouseDown={(e) => {
                                e.preventDefault();
                                setQuery(item);
                                onSearch(item);
                                setShowSuggestions(false);
                            }}>
                                {item}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchBar;
