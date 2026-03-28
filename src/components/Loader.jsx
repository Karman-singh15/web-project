import './Loader.css';

const Loader = () => {
    return (
        <div className="loader-container">
            <div className="skeleton-title glass-panel shimmer"></div>
            <div className="skeleton-cards">
                {[1, 2, 3].map((item) => (
                    <div key={item} className="skeleton-card glass-panel shimmer"></div>
                ))}
            </div>
        </div>
    );
};

export default Loader;
