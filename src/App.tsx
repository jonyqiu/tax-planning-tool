import { useState } from 'react';
import { HeroSection } from './sections/HeroSection';
import { TaxCalculatorSection } from './sections/TaxCalculatorSection';
import { BlindZoneSection } from './sections/BlindZoneSection';
import { BatchProcessingSection } from './sections/BatchProcessingSection';
import { FooterSection } from './sections/FooterSection';
import './App.css';

type ActiveTab = 'hero' | 'calculator' | 'blindzone' | 'batch';

function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('calculator');

  return (
    <div className="min-h-screen bg-[#0a0f1a]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a0f1a]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-white font-semibold text-lg tracking-tight">个税筹划</span>
          </div>

          {/* Navigation */}
          <nav className="flex items-center gap-1">
            {[
              { id: 'calculator' as ActiveTab, label: '计算器' },
              { id: 'blindzone' as ActiveTab, label: '盲区表' },
              { id: 'batch' as ActiveTab, label: '批量计算' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-emerald-500/10 text-emerald-400'
                    : 'text-white/50 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-16">
        {activeTab === 'hero' && <HeroSection />}
        {activeTab === 'calculator' && <TaxCalculatorSection />}
        {activeTab === 'blindzone' && <BlindZoneSection />}
        {activeTab === 'batch' && <BatchProcessingSection />}
        {activeTab === 'hero' && <FooterSection />}
      </main>

      {/* Footer - only show when not on hero */}
      {activeTab !== 'hero' && <FooterSection />}
    </div>
  );
}

export default App;
