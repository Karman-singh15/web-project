import './SearchHistory.css';

const SearchHistory = ({ history, onSearch, onRemove, onClearAll }) => {
  if (history.length === 0) return null;

  return (
    <div className="search-history glass-panel animate-slide-left">
      <div className="history-header">
        <span className="history-title">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          Recent
        </span>
        <button className="clear-all-btn" onClick={onClearAll}>Clear all</button>
      </div>
      <ul className="history-list">
        {history.map((item) => (
          <li key={item} className="history-item">
            <button className="history-search-btn" onClick={() => onSearch(item)}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="history-icon">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              {item}
            </button>
            <button className="history-remove-btn" onClick={() => onRemove(item)} title="Remove">×</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SearchHistory;
