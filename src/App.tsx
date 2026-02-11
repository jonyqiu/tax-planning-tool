import { HeroSection } from './sections/HeroSection';
import { TaxCalculatorSection } from './sections/TaxCalculatorSection';
import { BatchProcessingSection } from './sections/BatchProcessingSection';
import { FooterSection } from './sections/FooterSection';
import './App.css';

function App() {
  return (
    <div className="min-h-screen bg-[#1a1a2e]">
      <HeroSection />
      <TaxCalculatorSection />
      <BatchProcessingSection />
      <FooterSection />
    </div>
  );
}

export default App;
