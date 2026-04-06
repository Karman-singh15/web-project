import { useNavigate } from 'react-router-dom';
import { DotOrbit } from '@paper-design/shaders-react';
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
    <div className="home-page animate-fade-in">
      <div className="home-shader-bg" aria-hidden="true">
        <DotOrbit
          width={1920}
          height={1400}
          colors={['#000000']}
          colorBack="#ffe600"
          stepsPerColor={2}
          size={0.65}
          sizeRange={0}
          spreading={0.16}
          speed={5}
          scale={0.7}
        />
      </div>

      <div className="home-page-overlay" aria-hidden="true" />

      <div className="app-container home-content">
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
    </div>
  );
};

export default Home;
