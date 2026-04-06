import './QuickSearch.css';

const QUICK_ITEMS = [
  { emoji: '🥛', label: 'Milk' },
  { emoji: '🥚', label: 'Eggs' },
  { emoji: '🍞', label: 'Bread' },
  { emoji: '🍌', label: 'Bananas' },
  { emoji: '🧅', label: 'Onions' },
  { emoji: '🍅', label: 'Tomatoes' },
  { emoji: '☕', label: 'Coffee' },
  { emoji: '🍗', label: 'Chicken' },
  { emoji: '🧀', label: 'Paneer' },
  { emoji: '🛢️', label: 'Cooking Oil' },
  { emoji: '🍚', label: 'Rice' },
  { emoji: '🍋', label: 'Lemon' },
];

const QuickSearch = ({ onSearch }) => {
  return (
    <div className="quick-search">
      <p className="quick-search-label">Popular searches</p>
      <div className="quick-chips-row">
        {QUICK_ITEMS.map((item) => (
          <button
            key={item.label}
            className="quick-chip"
            onClick={() => onSearch(item.label)}
          >
            <span className="chip-emoji">{item.emoji}</span>
            <span className="chip-label">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickSearch;
