import './PriceChart.css';

const PLATFORM_COLORS = {
  blinkit:   '#f5d000',
  zepto:     '#4a9eff',
  swiggy:    '#fc8019',
  bigbasket: '#84c225',
  minutes:   '#8b5cf6',
  dmart:     '#16a34a',
  amazon_fresh: '#ff9900',
};

const PriceChart = ({ results }) => {
  if (!results || results.length === 0) return null;

  const maxPrice = Math.max(...results.map((r) => r.price));
  const minPrice = Math.min(...results.map((r) => r.price));

  return (
    <div className="price-chart glass-panel">
      <p className="chart-title">Price Comparison</p>
      <div className="chart-bars">
        {results.map((item) => {
          const pct = maxPrice > 0 ? (item.price / maxPrice) * 100 : 0;
          const isCheapest = item.price === minPrice;
          const color = PLATFORM_COLORS[item.id] || '#6366f1';

          return (
            <div key={item.id} className="chart-row">
              <div className="chart-row-label">
                <span className="chart-platform">{item.platform}</span>
                {isCheapest && <span className="chart-cheapest-tag">Best</span>}
              </div>
              <div className="chart-bar-track">
                <div
                  className={`chart-bar-fill ${isCheapest ? 'cheapest' : ''}`}
                  style={{ width: `${pct}%`, '--bar-color': color }}
                />
              </div>
              <span className="chart-price">₹{Number(item.price || 0).toFixed(0)}</span>
            </div>
          );
        })}
      </div>
      <p className="chart-note">Lower is better · Prices fetched live</p>
    </div>
  );
};

export default PriceChart;
