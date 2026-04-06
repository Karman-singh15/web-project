import './HowItWorks.css';

const STEPS = [
  {
    icon: '🔍',
    step: '01',
    title: 'Search Anything',
    desc: 'Type any grocery item — milk, eggs, rice, cooking oil. We handle the rest.',
  },
  {
    icon: '⚡',
    step: '02',
    title: 'Live Price Fetch',
    desc: 'We scrape real-time prices from Blinkit, Zepto, and Amazon Fresh simultaneously.',
  },
  {
    icon: '💰',
    step: '03',
    title: 'Pick the Best Deal',
    desc: 'See prices, delivery times, and your exact savings all on one screen.',
  },
];

const HowItWorks = () => (
  <section className="how-it-works">
    <p className="hiw-label">How it works</p>
    <div className="hiw-steps">
      {STEPS.map((s) => (
        <div key={s.step} className="hiw-card glass-panel">
          <div className="hiw-step-number">{s.step}</div>
          <div className="hiw-icon">{s.icon}</div>
          <h3 className="hiw-title">{s.title}</h3>
          <p className="hiw-desc">{s.desc}</p>
        </div>
      ))}
    </div>

    <div className="platform-badges">
      <span className="platform-badge">🟡 Blinkit</span>
      <span className="platform-badge">🔵 Zepto</span>
      <span className="platform-badge">🟠 Swiggy</span>
    </div>
  </section>
);

export default HowItWorks;
