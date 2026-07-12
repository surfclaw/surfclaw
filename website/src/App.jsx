import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import InteractiveDemo from './components/InteractiveDemo';
import StatsTelemetry from './components/StatsTelemetry';
import ArchitectureMap from './components/ArchitectureMap';
import Roadmap from './components/Roadmap';
import ContactForm from './components/ContactForm';
import Footer from './components/Footer';
import ParticleCanvas from './components/ParticleCanvas';

function App() {
  return (
    <>
      {/* Premium Background Visuals */}
      <ParticleCanvas />
      <div className="bg-grid" />
      <div className="bg-glow-cyan" />
      <div className="bg-glow-purple" />

      {/* Main Header / Navigation */}
      <Navbar />

      <main style={{ paddingBottom: '60px' }}>
        <Hero />
        <InteractiveDemo />
        <StatsTelemetry />
        <Roadmap />
        <ArchitectureMap />
        <ContactForm />
      </main>

      {/* Footer Details */}
      <Footer />
    </>
  );
}

export default App;
