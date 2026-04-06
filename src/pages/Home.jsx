import { useNavigate } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import QuickSearch from '../components/QuickSearch';
import HowItWorks from '../components/HowItWorks';
import '../App.css'; 

const Home = () => {
  const navigate = useNavigate();

  const handleSearch = (query) => {
    if (!query) return;
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className="app-container animate-fade-in">
      <header className="hero-section">
        <h1 className="hero-title">
          Find the <span className="text-gradient">Best Deal</span>
        </h1>
        <p className="hero-subtitle">
          Compare grocery prices across your favourite platforms in seconds.
        </p>
      </header>

      <main className="main-content">
        <SearchBar onSearch={handleSearch} />
        <QuickSearch onSearch={handleSearch} />
        <HowItWorks />
      </main>
    </div>
  );
};

export default Home;
