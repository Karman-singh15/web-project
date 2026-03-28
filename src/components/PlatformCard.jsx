import './PlatformCard.css';

const PlatformCard = ({ platform, price, deliveryTime, isBestDeal, link }) => {
    return (
        <div className={`platform-card glass-panel ${isBestDeal ? 'best-deal' : ''} animate-fade-in`}>
            {isBestDeal && <div className="best-deal-badge">Best Deal</div>}

            <div className="platform-info">
                <div className="platform-logo-placeholder">
                    {platform.charAt(0)}
                </div>
                <div className="platform-details">
                    <h3 className="platform-name">{platform}</h3>
                    <p className="delivery-time">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                        {deliveryTime} mins
                    </p>
                </div>
            </div>

            <div className="price-section">
                <div className="price-details">
                    <span className="current-price">₹{price.toFixed(2)}</span>
                </div>
                <button className="buy-btn">Store</button>
            </div>
        </div>
    );
};

export default PlatformCard;
