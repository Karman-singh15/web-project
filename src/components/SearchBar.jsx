import { useState, useEffect } from 'react';
import './SearchBar.css';
import { fetchSuggestions } from '../services/api';

const SearchBar = ({ onSearch }) => {
    const [query, setQuery] = useState('');
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
                <button type="submit" className="search-btn">Compare</button>
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
