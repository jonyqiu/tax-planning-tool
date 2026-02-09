import { useState } from 'react';
import { HeroSection } from './sections/HeroSection';
import { ReversePlannerSection } from './sections/ReversePlannerSection';
import { CalculatorSection } from './sections/CalculatorSection';
import { BlindZoneSection } from './sections/BlindZoneSection';
import { ChartSection } from './sections/ChartSection';
import { ComparisonTable } from './sections/ComparisonTable';
import { BatchProcessingSection } from './sections/BatchProcessingSection';
import { FooterSection } from './sections/FooterSection';
import { calculateOptimalPlan } from './lib/taxCalculator';
import './App.css';

function App() {
  const [calcResult, setCalcResult] = useState<ReturnType<typeof calculateOptimalPlan> | null>(null);
  const [inputValues, setInputValues] = useState({
    salary: 0,
    bonus: 0,
    insurance: 0,
    deduction: 0,
  });

  const handleCalculate = (result: ReturnType<typeof calculateOptimalPlan>) => {
    setCalcResult(result);
    // 更新输入值用于图表
    const inputs = document.querySelectorAll('input[type="number"]');
    if (inputs.length >= 4) {
      setInputValues({
        salary: parseFloat((inputs[0] as HTMLInputElement).value) || 0,
        bonus: parseFloat((inputs[1] as HTMLInputElement).value) || 0,
        insurance: parseFloat((inputs[2] as HTMLInputElement).value) || 0,
        deduction: parseFloat((inputs[3] as HTMLInputElement).value) || 0,
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1a2e]">
      <HeroSection />
      <ReversePlannerSection />
      <CalculatorSection onCalculate={handleCalculate} />
      <BlindZoneSection />
      <ChartSection
        salary={inputValues.salary}
        bonus={inputValues.bonus}
        insurance={inputValues.insurance}
        deduction={inputValues.deduction}
      />
      <ComparisonTable result={calcResult} />
      <BatchProcessingSection />
      <FooterSection />
    </div>
  );
}

export default App;
