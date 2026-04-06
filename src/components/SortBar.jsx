import './SortBar.css';

const SORT_OPTIONS = [
  { id: 'cheapest', label: '💰 Cheapest' },
  { id: 'fastest', label: '⚡ Fastest' },
  { id: 'best_value', label: '🏆 Best Value' },
];

const SortBar = ({ sortMode, onSortChange }) => {
  return (
    <div className="sort-bar">
      <span className="sort-label">Sort by:</span>
      <div className="sort-options">
        {SORT_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            className={`sort-btn ${sortMode === opt.id ? 'active' : ''}`}
            onClick={() => onSortChange(opt.id)}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SortBar;
