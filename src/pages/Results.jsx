import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import Loader from '../components/Loader';
import PlatformCard from '../components/PlatformCard';
import SearchHistory from '../components/SearchHistory';
import SortBar from '../components/SortBar';
import PriceChart from '../components/PriceChart';
import { fetchPriceComparisons } from '../services/api';
import '../App.css'; // or Results.css if we split later

const HISTORY_KEY = 'fpc_search_history';

function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
  } catch {
    return [];
  }
}

function saveHistory(history) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

function sortResults(results, mode) {
  const copy = [...results];
  if (mode === 'cheapest') {
    return copy.sort((a, b) => {
      // If comparable unit metrics exist, prefer unit price
      if (a.unitPrice && b.unitPrice && a.unitMetric === b.unitMetric) {
        const unitDiff = a.unitPrice - b.unitPrice;
        if (Math.abs(unitDiff) > 0.01) return unitDiff;
      } else {
        // Fallback to absolute price
        if (a.price !== b.price) return a.price - b.price;
      }
      // Tie breaker: Fastest
      return a.deliveryTime - b.deliveryTime;
    });
  }
  if (mode === 'fastest') {
    return copy.sort((a, b) => {
      if (a.deliveryTime !== b.deliveryTime) return a.deliveryTime - b.deliveryTime;
      // Tie breaker: Cheapest
      const priceA = a.unitPrice && a.unitMetric ? a.unitPrice : a.price;
      const priceB = b.unitPrice && b.unitMetric ? b.unitPrice : b.price;
      return priceA - priceB;
    });
  }
  if (mode === 'best_value') {
    return copy.sort((a, b) => (a.price * a.deliveryTime) - (b.price * b.deliveryTime));
  }
  return copy;
}

function getBestDealItem(results = []) {
  if (!results.length) return null;

  const comparableByUnit = results.filter(
    (item) => item.unitPrice && item.unitMetric
  );

  if (comparableByUnit.length > 0) {
    return [...comparableByUnit].sort((a, b) => {
      if (a.unitMetric === b.unitMetric) {
        const unitDiff = a.unitPrice - b.unitPrice;
        if (Math.abs(unitDiff) > 0.01) return unitDiff;
      }

      if (a.price !== b.price) return a.price - b.price;
      return a.deliveryTime - b.deliveryTime;
    })[0];
  }

  return [...results].sort((a, b) => {
    if (a.price !== b.price) return a.price - b.price;
    return a.deliveryTime - b.deliveryTime;
  })[0];
}

const Results = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const rawQuery = searchParams.get('q') || '';

  const [loading, setLoading] = useState(false);
  const [resultsJSON, setResultsJSON] = useState(null);
  const [sortMode, setSortMode] = useState('cheapest');
  const [history, setHistory] = useState(loadHistory);

  useEffect(() => {
    if (!rawQuery) {
      navigate('/');
      return;
    }

    const runSearch = async () => {
      setLoading(true);
      setResultsJSON(null);
      setSortMode('cheapest');

      // Update history
      const newHistory = [rawQuery, ...history.filter(h => h.toLowerCase() !== rawQuery.toLowerCase())].slice(0, 8);
      setHistory(newHistory);
      saveHistory(newHistory);

      try {
        const data = await fetchPriceComparisons(rawQuery);
        setResultsJSON(data);
      } catch (error) {
        console.error('Failed to fetch comparisons', error);
        setResultsJSON({ query: rawQuery, results: [] }); // fallback on error
      } finally {
        setLoading(false);
      }
    };

    runSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawQuery]);

  const handleSearch = (newQuery) => {
    if (!newQuery) return;
    setSearchParams({ q: newQuery });
  };

  const removeFromHistory = (item) => {
    const updated = history.filter((h) => h !== item);
    setHistory(updated);
    saveHistory(updated);
  };

  const clearHistory = () => {
    setHistory([]);
    saveHistory([]);
  };

  const sortedResults = resultsJSON && resultsJSON.results ? sortResults(resultsJSON.results, sortMode) : [];

  const bestDealItem = resultsJSON?.results?.length > 0
    ? getBestDealItem(resultsJSON.results)
    : null;
  const cheapestItem = resultsJSON?.results?.length > 0
    ? [...resultsJSON.results].sort((a, b) => {
        if (a.price !== b.price) return a.price - b.price;
        return a.deliveryTime - b.deliveryTime;
      })[0]
    : null;
  const cheapestPrice = cheapestItem ? cheapestItem.price : null;

  return (
    <div className="app-container searched animate-fade-in">
      {/* Top Header Area for Results */}
      <header className="results-header glass-panel">
        <div className="results-header-content">
          <Link to="/" className="brand-link">
            <span className="brand-logo">🍏</span>
            <span className="brand-text">FPC</span>
          </Link>
          <div className="header-search-wrapper">
             <SearchBar onSearch={handleSearch} initialQuery={rawQuery} isLoading={loading} />
          </div>
        </div>
      </header>

      <main className="main-content">
        {loading && <Loader />}

        {resultsJSON && !loading && (
          <div className="results-layout animate-fade-in">
            {/* Sidebar: history */}
            <aside className="history-sidebar">
              {history.length > 0 && (
                <SearchHistory 
                  history={history} 
                  onSelect={handleSearch} 
                  onRemove={removeFromHistory}
                  onClear={clearHistory}
                />
              )}
            </aside>

            {/* Main results panel */}
            <div className="results-main">

              {/* Product info banner */}
              {sortedResults.length === 0 ? (
                <div className="product-banner glass-panel animate-fade-in" style={{ justifyContent: 'center' }}>
                  <div className="product-banner-info" style={{ alignItems: 'center' }}>
                    <h2 className="product-banner-name" style={{ color: 'var(--text-muted)' }}>
                      No results found for "{resultsJSON.query}"
                    </h2>
                    <p className="product-banner-meta">Try searching for a different item or checking your pincode.</p>
                  </div>
                </div>
              ) : (() => {
                const ref = sortedResults.find(r => r.image) || sortedResults[0];
                return (
                  <div className="product-banner glass-panel animate-fade-in">
                    {ref?.image && (
                      <img src={ref.image} alt={ref.productName} className="product-banner-img" loading="lazy" />
                    )}
                    <div className="product-banner-info">
                      <p className="product-banner-label">Comparing prices for</p>
                      <h2 className="product-banner-name">
                        {ref?.productName || resultsJSON.query}
                      </h2>
                      {(ref?.brand || ref?.quantity) && (
                        <p className="product-banner-meta">
                          {[ref?.brand, ref?.quantity].filter(Boolean).join(' · ')}
                        </p>
                      )}
                      <p className="results-count">{resultsJSON.results.length} platforms · live prices</p>
                    </div>
                  </div>
                );
              })()}

              {/* Sort controls */}
              {sortedResults.length > 0 && (
                <SortBar currentSort={sortMode} onSortChange={setSortMode} />
              )}

              {/* Platform cards */}
              {sortedResults.map((item) => (
                <PlatformCard
                  key={item.id}
                  platformId={item.id}
                  platform={item.platform}
                  price={item.price}
                  mrp={item.mrp}
                  deliveryTime={item.deliveryTime}
                  deliverySLA={item.deliverySLA}
                  isBestDeal={bestDealItem && item.id === bestDealItem.id}
                  cheapestPrice={cheapestPrice}
                  dataSource={item.dataSource}
                  productName={item.productName}
                  brand={item.brand}
                  quantity={item.quantity}
                  image={item.image}
                  rating={item.rating}
                  ratingCount={item.ratingCount}
                  deeplink={item.deeplink}
                  available={item.available}
                  unitPrice={item.unitPrice}
                  unitMetric={item.unitMetric}
                />
              ))}

              {/* Price Chart */}
              <PriceChart results={sortedResults} />

              {/* Savings summary */}
              {sortedResults.length > 1 && (
                <div className="savings-summary glass-panel">
                  <span className="savings-icon">💡</span>
                  <p>
                    You save <strong className="savings-amount">₹{Number(Math.max(...sortedResults.map(r => Number(r.price || 0))) - Number(cheapestPrice || 0)).toFixed(0)}</strong> by choosing{' '}
                    <strong>{sortedResults.find(r => r.price === cheapestPrice)?.platform}</strong> over the most expensive option.
                  </p>
                </div>
              )}

            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Results;
