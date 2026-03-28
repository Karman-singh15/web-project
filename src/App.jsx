import { useState } from 'react';
import './App.css';
import SearchBar from './components/SearchBar';
import Loader from './components/Loader';
import PlatformCard from './components/PlatformCard';
import { fetchPriceComparisons } from './services/api';

function App() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (query) => {
    setHasSearched(true);
    setLoading(true);
    setResults(null);

    try {
      const data = await fetchPriceComparisons(query);
      setResults(data);
    } catch (error) {
      console.error("Failed to fetch comparisons", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`app-container animate-fade-in ${hasSearched ? 'searched' : ''}`}>
      <header className="hero-section">
        <h1 className="hero-title">
          Find the <span className="text-gradient">Best Deal</span>
        </h1>
        <p className="hero-subtitle">Compare food prices across your favorite platforms.</p>
      </header>

      <main className="main-content">
        <SearchBar onSearch={handleSearch} />

        {loading && <Loader />}

        {results && !loading && (
          <div className="results-container animate-fade-in">
            <div className="results-header">
              <h2>Results for <span className="text-gradient">"{results.query}"</span></h2>
              <p className="results-count">Found {results.results.length} options</p>
            </div>

            <div className="platform-list">
              {results.results.map((item) => (
                <PlatformCard
                  key={item.id}
                  platform={item.platform}
                  price={item.price}
                  deliveryTime={item.deliveryTime}
                  isBestDeal={item.isBestDeal}
                />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
