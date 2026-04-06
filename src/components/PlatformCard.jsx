import './PlatformCard.css';

const PLATFORM_META = {
  blinkit:   { emoji: '🟡', color: '#f5d000' },
  zepto:     { emoji: '🔵', color: '#4a9eff' },
  swiggy:    { emoji: '🟠', color: '#fc8019' },
  bigbasket: { emoji: '🟢', color: '#84c225' },
  minutes:   { emoji: '🟣', color: '#8b5cf6' },
  dmart:     { emoji: '🟩', color: '#16a34a' },
  amazon_fresh: { emoji: '🟠', color: '#ff9900' },
};

const Stars = ({ rating }) => {
  const num = Number(rating) || 0;
  const full = Math.max(0, Math.min(5, Math.round(num)));
  const empty = 5 - full;
  return (
    <span className="stars" title={`${num} / 5`}>
      {'★'.repeat(full)}{'☆'.repeat(empty)}
    </span>
  );
};

const PlatformCard = ({
  platform, platformId, price, mrp, deliveryTime, deliverySLA,
  isBestDeal, cheapestPrice, dataSource,
  productName, brand, quantity, image, rating, ratingCount, deeplink, available,
  unitPrice, unitMetric
}) => {
  const meta = PLATFORM_META[platformId] || { emoji: '🛒', color: '#a1a1aa' };
  const savings = cheapestPrice && !isBestDeal ? price - cheapestPrice : 0;
  const isLive = dataSource === 'live';
  const discount = mrp && mrp > price ? Math.round(((mrp - price) / mrp) * 100) : null;
  const slaLabel = deliverySLA || `${deliveryTime} mins`;

  return (
    <div className={`platform-card glass-panel ${isBestDeal ? 'best-deal' : ''} ${!available ? 'unavailable' : ''} animate-fade-in`}>
      {isBestDeal && <div className="best-deal-badge">✨ Best Deal</div>}
      {!available && <div className="unavailable-overlay">Unavailable</div>}

      <div className="platform-info">
        {/* Product thumbnail */}
        {image ? (
          <img src={image} alt={productName || platform} className="product-thumb" loading="lazy" />
        ) : (
          <div className="platform-logo-placeholder" style={{ '--platform-color': meta.color }}>
            {meta.emoji}
          </div>
        )}

        <div className="platform-details">
          <div className="platform-name-row">
            <span className="platform-emoji">{meta.emoji}</span>
            <h3 className="platform-name">{platform}</h3>
            <span className={`source-badge ${isLive ? 'live' : 'est'}`}>
              {isLive ? '🟢 Live' : '🔘 Est.'}
            </span>
          </div>

          {productName && (
            <p className="product-name-label" title={productName}>
              {productName}{quantity ? ` · ${quantity}` : ''}{brand ? ` · ${brand}` : ''}
            </p>
          )}

          <p className="delivery-time">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
            {slaLabel} delivery
          </p>

          {rating && (
            <div className="rating-row">
              <Stars rating={rating} />
              <span className="rating-count">({ratingCount?.toLocaleString()})</span>
            </div>
          )}
        </div>
      </div>

      <div className="price-section">
        <div className="price-details">
          <span className="current-price">₹{Number(price || 0).toFixed(0)}</span>
          {unitPrice && unitMetric && (
            <span className="unit-price">
              ₹{Number(unitPrice).toFixed(1)} / {unitMetric}
            </span>
          )}
          {mrp && Number(mrp) > Number(price) && <span className="mrp-price">₹{mrp}</span>}
          {discount && <span className="discount-badge">{discount}% off</span>}
          {savings > 0 && <span className="savings-badge">+₹{Number(savings || 0).toFixed(0)} more</span>}
          {isBestDeal && <span className="cheapest-badge">Lowest price!</span>}
        </div>
        <a
          className={`buy-btn ${isBestDeal ? 'best' : ''}`}
          href={deeplink || '#'}
          target="_blank"
          rel="noopener noreferrer"
        >
          Open App ↗
        </a>
      </div>
    </div>
  );
};

export default PlatformCard;
