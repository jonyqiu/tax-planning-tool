import { useState, useMemo } from 'react';
import {
  Calculator,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Info,
  Eye,
  DollarSign,
  Gift,
  Wallet,
} from 'lucide-react';
import {
  calculateOptimalSplit,
  calculateYearEndOptimal,
  calculateOptimalPlan,
  formatMoney,
  type YearEndScenario,
  type YearEndPlan,
} from '@/lib/taxCalculator';

type CalculatorMode = 'split' | 'yearend' | 'compare';

export function TaxCalculatorSection() {
  const [mode, setMode] = useState<CalculatorMode>('split');

  // 场景1：智能拆分
  const [splitForm, setSplitForm] = useState({
    totalIncome: '',
    insurance: '',
    deduction: '',
  });
  const [splitResult, setSplitResult] = useState<ReturnType<typeof calculateOptimalSplit> | null>(null);

  // 场景2：年末优化
  const [yearEndForm, setYearEndForm] = useState({
    first11MonthsSalary: '',
    decemberSalary: '',
    yearEndBonus: '',
    insurance: '',
    deduction: '',
  });
  const [yearEndResult, setYearEndResult] = useState<ReturnType<typeof calculateYearEndOptimal> | null>(null);

  // 场景3：方案对比
  const [compareForm, setCompareForm] = useState({
    salary: '',
    bonus: '',
    insurance: '',
    deduction: '',
  });
  const [compareResult, setCompareResult] = useState<ReturnType<typeof calculateOptimalPlan> | null>(null);

  const handleSplitCalculate = () => {
    const result = calculateOptimalSplit(
      Number(splitForm.totalIncome) || 0,
      Number(splitForm.insurance) || 0,
      Number(splitForm.deduction) || 0
    );
    setSplitResult(result);
  };

  const handleYearEndCalculate = () => {
    const scenario: YearEndScenario = {
      first11MonthsSalary: Number(yearEndForm.first11MonthsSalary) || 0,
      decemberSalary: Number(yearEndForm.decemberSalary) || 0,
      yearEndBonus: Number(yearEndForm.yearEndBonus) || 0,
      insurance: Number(yearEndForm.insurance) || 0,
      deduction: Number(yearEndForm.deduction) || 0,
    };
    const result = calculateYearEndOptimal(scenario);
    setYearEndResult(result);
  };

  const handleCompareCalculate = () => {
    const result = calculateOptimalPlan(
      Number(compareForm.salary) || 0,
      Number(compareForm.bonus) || 0,
      Number(compareForm.insurance) || 0,
      Number(compareForm.deduction) || 0
    );
    setCompareResult(result);
  };

  const tabs = [
    { id: 'split' as CalculatorMode, label: '智能拆分', icon: Wallet, color: 'emerald' },
    { id: 'yearend' as CalculatorMode, label: '年末优化', icon: Calendar, color: 'blue' },
    { id: 'compare' as CalculatorMode, label: '方案对比', icon: TrendingDown, color: 'amber' },
  ];

  const colorClasses = {
    emerald: {
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/30',
      text: 'text-emerald-400',
      hover: 'hover:border-emerald-500/50',
      badge: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50',
    },
    blue: {
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/30',
      text: 'text-blue-400',
      hover: 'hover:border-blue-500/50',
      badge: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
    },
    amber: {
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/30',
      text: 'text-amber-400',
      hover: 'hover:border-amber-500/50',
      badge: 'bg-amber-500/20 text-amber-400 border-amber-500/50',
    },
  };

  return (
    <section className="min-h-screen py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Page Header */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-white mb-3">个税优化计算器</h2>
          <p className="text-white/50">选择计算场景，获取最优税务方案</p>
        </div>

        {/* Mode Tabs */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex bg-white/5 rounded-xl p-1.5 border border-white/10">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const colors = colorClasses[tab.color];
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setMode(tab.id);
                    setSplitResult(null);
                    setYearEndResult(null);
                    setCompareResult(null);
                  }}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-medium transition-all ${
                    mode === tab.id
                      ? `${colors.bg} ${colors.text}`
                      : 'text-white/50 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Panel */}
          <div className={`rounded-2xl border ${colorClasses[tabs.find(t => t.id === mode)!.color].border} ${colorClasses[tabs.find(t => t.id === mode)!.color].bg} p-6`}>
            {mode === 'split' && (
              <SplitForm
                form={splitForm}
                setForm={setSplitForm}
                onCalculate={handleSplitCalculate}
                color={colorClasses.emerald}
              />
            )}
            {mode === 'yearend' && (
              <YearEndForm
                form={yearEndForm}
                setForm={setYearEndForm}
                onCalculate={handleYearEndCalculate}
                color={colorClasses.blue}
              />
            )}
            {mode === 'compare' && (
              <CompareForm
                form={compareForm}
                setForm={setCompareForm}
                onCalculate={handleCompareCalculate}
                color={colorClasses.amber}
              />
            )}
          </div>

          {/* Result Panel */}
          <div className="space-y-6">
            {mode === 'split' && splitResult && (
              <SplitResult result={splitResult} color={colorClasses.emerald} />
            )}
            {mode === 'yearend' && yearEndResult && (
              <YearEndResult result={yearEndResult} color={colorClasses.blue} />
            )}
            {mode === 'compare' && compareResult && (
              <CompareResult result={compareResult} color={colorClasses.amber} />
            )}

            {!(
              (mode === 'split' && splitResult) ||
              (mode === 'yearend' && yearEndResult) ||
              (mode === 'compare' && compareResult)
            ) && (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Calculator className="w-10 h-10 text-white/20" />
                  </div>
                  <p className="text-white/40">输入信息后点击计算</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// Calendar icon for year-end mode
function Calendar(props: { className?: string }) {
  return (
    <svg className={props.className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

// Split Form Component
function SplitForm({ form, setForm, onCalculate, color }: {
  form: { totalIncome: string; insurance: string; deduction: string };
  setForm: React.Dispatch<React.SetStateAction<typeof form>>;
  onCalculate: () => void;
  color: typeof colorClasses.emerald;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className={`w-10 h-10 ${color.bg} rounded-xl flex items-center justify-center`}>
          <Wallet className={`w-5 h-5 ${color.text}`} />
        </div>
        <div>
          <h3 className="text-white font-semibold">智能拆分方案</h3>
          <p className="text-white/50 text-sm">输入税前年度总收入</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-white/70 text-sm mb-2 block">税前年度总收入</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30">¥</span>
            <input
              type="number"
              value={form.totalIncome}
              onChange={(e) => setForm({ ...form, totalIncome: e.target.value })}
              placeholder="400000"
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-10 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-emerald-500/50 transition-colors"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-white/70 text-sm mb-2 block">三险一金（全年）</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30">¥</span>
              <input
                type="number"
                value={form.insurance}
                onChange={(e) => setForm({ ...form, insurance: e.target.value })}
                placeholder="40000"
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-10 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-emerald-500/50 transition-colors"
              />
            </div>
          </div>
          <div>
            <label className="text-white/70 text-sm mb-2 block">专项附加扣除</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30">¥</span>
              <input
                type="number"
                value={form.deduction}
                onChange={(e) => setForm({ ...form, deduction: e.target.value })}
                placeholder="48000"
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-10 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-emerald-500/50 transition-colors"
              />
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={onCalculate}
        className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold py-4 rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
      >
        <Calculator className="w-5 h-5" />
        计算最优方案
      </button>
    </div>
  );
}

// Year-End Form Component
function YearEndForm({ form, setForm, onCalculate, color }: {
  form: { first11MonthsSalary: string; decemberSalary: string; yearEndBonus: string; insurance: string; deduction: string };
  setForm: React.Dispatch<React.SetStateAction<typeof form>>;
  onCalculate: () => void;
  color: typeof colorClasses.emerald;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className={`w-10 h-10 ${color.bg} rounded-xl flex items-center justify-center`}>
          <Calendar className={`w-5 h-5 ${color.text}`} />
        </div>
        <div>
          <h3 className="text-white font-semibold">年末优化方案</h3>
          <p className="text-white/50 text-sm">前11个月工资已确定</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-white/70 text-sm mb-2 block">前11个月累计工资</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30">¥</span>
              <input
                type="number"
                value={form.first11MonthsSalary}
                onChange={(e) => setForm({ ...form, first11MonthsSalary: e.target.value })}
                placeholder="220000"
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-10 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500/50 transition-colors"
              />
            </div>
          </div>
          <div>
            <label className="text-white/70 text-sm mb-2 block">12月工资</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30">¥</span>
              <input
                type="number"
                value={form.decemberSalary}
                onChange={(e) => setForm({ ...form, decemberSalary: e.target.value })}
                placeholder="20000"
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-10 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500/50 transition-colors"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="text-white/70 text-sm mb-2 block">年终奖</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30">¥</span>
            <input
              type="number"
              value={form.yearEndBonus}
              onChange={(e) => setForm({ ...form, yearEndBonus: e.target.value })}
              placeholder="50000"
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-10 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500/50 transition-colors"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-white/70 text-sm mb-2 block">三险一金（全年）</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30">¥</span>
              <input
                type="number"
                value={form.insurance}
                onChange={(e) => setForm({ ...form, insurance: e.target.value })}
                placeholder="24000"
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-10 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500/50 transition-colors"
              />
            </div>
          </div>
          <div>
            <label className="text-white/70 text-sm mb-2 block">专项附加扣除</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30">¥</span>
              <input
                type="number"
                value={form.deduction}
                onChange={(e) => setForm({ ...form, deduction: e.target.value })}
                placeholder="48000"
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-10 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500/50 transition-colors"
              />
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={onCalculate}
        className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold py-4 rounded-xl transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
      >
        <Calculator className="w-5 h-5" />
        计算最优方案
      </button>
    </div>
  );
}

// Compare Form Component
function CompareForm({ form, setForm, onCalculate, color }: {
  form: { salary: string; bonus: string; insurance: string; deduction: string };
  setForm: React.Dispatch<React.SetStateAction<typeof form>>;
  onCalculate: () => void;
  color: typeof colorClasses.emerald;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className={`w-10 h-10 ${color.bg} rounded-xl flex items-center justify-center`}>
          <TrendingDown className={`w-5 h-5 ${color.text}`} />
        </div>
        <div>
          <h3 className="text-white font-semibold">方案对比</h3>
          <p className="text-white/50 text-sm">已确定工资和年终奖</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-white/70 text-sm mb-2 block">年度工资</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30">¥</span>
              <input
                type="number"
                value={form.salary}
                onChange={(e) => setForm({ ...form, salary: e.target.value })}
                placeholder="300000"
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-10 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-amber-500/50 transition-colors"
              />
            </div>
          </div>
          <div>
            <label className="text-white/70 text-sm mb-2 block">年终奖</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30">¥</span>
              <input
                type="number"
                value={form.bonus}
                onChange={(e) => setForm({ ...form, bonus: e.target.value })}
                placeholder="60000"
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-10 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-amber-500/50 transition-colors"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-white/70 text-sm mb-2 block">三险一金（全年）</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30">¥</span>
              <input
                type="number"
                value={form.insurance}
                onChange={(e) => setForm({ ...form, insurance: e.target.value })}
                placeholder="24000"
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-10 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-amber-500/50 transition-colors"
              />
            </div>
          </div>
          <div>
            <label className="text-white/70 text-sm mb-2 block">专项附加扣除</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30">¥</span>
              <input
                type="number"
                value={form.deduction}
                onChange={(e) => setForm({ ...form, deduction: e.target.value })}
                placeholder="48000"
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-10 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-amber-500/50 transition-colors"
              />
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={onCalculate}
        className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold py-4 rounded-xl transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
      >
        <Calculator className="w-5 h-5" />
        计算方案对比
      </button>
    </div>
  );
}

// Split Result Component
function SplitResult({ result, color }: {
  result: ReturnType<typeof calculateOptimalSplit>;
  color: typeof colorClasses.emerald;
}) {
  return (
    <div className="space-y-6">
      {/* Optimal Plan Card */}
      <div className={`rounded-2xl ${color.bg} border ${color.border} p-6`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className={`w-5 h-5 ${color.text}`} />
            <span className="text-white font-semibold">推荐方案</span>
          </div>
          <span className={`text-xs px-3 py-1 rounded-full ${color.badge}`}>
            {result.planName}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white/5 rounded-xl p-4">
            <p className="text-white/50 text-sm mb-1">工资部分</p>
            <p className="text-2xl font-bold text-white">¥{formatMoney(result.optimalSalary)}</p>
          </div>
          <div className="bg-white/5 rounded-xl p-4">
            <p className="text-white/50 text-sm mb-1">年终奖部分</p>
            <p className="text-2xl font-bold text-white">¥{formatMoney(result.optimalBonus)}</p>
          </div>
        </div>

        <div className="space-y-3 pt-4 border-t border-white/10">
          <div className="flex justify-between">
            <span className="text-white/60">应纳税额</span>
            <span className="text-white font-semibold">¥{formatMoney(result.totalTax)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/60">税后收入</span>
            <span className={`font-bold text-xl`}>¥{formatMoney(result.afterTaxIncome)}</span>
          </div>
        </div>

        {result.blindZoneAvoided && (
          <div className="mt-4 bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span className="text-amber-400 text-sm">已自动避开个税盲区</span>
          </div>
        )}
      </div>

      {/* Calculation Steps */}
      <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
        <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Info className="w-4 h-4 text-white/50" />
          计算过程
        </h4>
        <div className="space-y-3">
          {result.calculationSteps.map((step, idx) => (
            <div key={idx} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
              <span className="text-white/60 text-sm">{step.description}</span>
              <span className="text-white font-mono text-sm">
                {step.description.includes('税率') ? `${(step.value * 100).toFixed(0)}%` : `¥${formatMoney(step.value)}`}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Year-End Result Component
function YearEndResult({ result, color }: {
  result: ReturnType<typeof calculateYearEndOptimal>;
  color: typeof colorClasses.emerald;
}) {
  return (
    <div className="space-y-6">
      {/* Income Summary */}
      <div className={`rounded-2xl ${color.bg} border ${color.border} p-6`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className={`w-5 h-5 ${color.text}`} />
            <span className="text-white font-semibold">最优方案</span>
          </div>
          <span className={`text-xs px-3 py-1 rounded-full ${color.badge}`}>
            {result.optimal.name}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white/5 rounded-xl p-3">
            <p className="text-white/50 text-xs mb-1">前11月工资</p>
            <p className="text-white font-semibold">¥{formatMoney(result.scenario.first11MonthsSalary)}</p>
          </div>
          <div className="bg-white/5 rounded-xl p-3">
            <p className="text-white/50 text-xs mb-1">12月工资</p>
            <p className="text-white font-semibold">¥{formatMoney(result.scenario.decemberSalary)}</p>
          </div>
          <div className="bg-white/5 rounded-xl p-3">
            <p className="text-white/50 text-xs mb-1">年终奖</p>
            <p className="text-white font-semibold">¥{formatMoney(result.scenario.yearEndBonus)}</p>
          </div>
        </div>

        <div className="space-y-3 pt-4 border-t border-white/10">
          <div className="flex justify-between">
            <span className="text-white/60">应纳税额</span>
            <span className="text-white font-semibold">¥{formatMoney(result.optimal.totalTax)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/60">税后收入</span>
            <span className="font-bold text-xl">¥{formatMoney(result.optimal.afterTaxIncome)}</span>
          </div>
          {result.taxSaving > 0 && (
            <div className="flex justify-between bg-emerald-500/10 -mx-4 px-4 py-2 -mb-4 rounded-b-xl">
              <span className="text-emerald-400">可节税</span>
              <span className="text-emerald-400 font-semibold">¥{formatMoney(result.taxSaving)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Comparison */}
      <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
        <h4 className="text-white font-semibold mb-4">方案对比</h4>
        <div className="space-y-3">
          {result.plans.map((plan, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-xl border ${
                plan.type === result.optimal.type ? color.border : 'border-white/10'
              } ${plan.type === result.optimal.type ? color.bg : 'bg-white/5'}`}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-white font-medium">{plan.name}</span>
                <span className="text-white font-semibold">¥{formatMoney(plan.totalTax)}</span>
              </div>
              <p className="text-white/50 text-sm">{plan.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Compare Result Component
function CompareResult({ result, color }: {
  result: ReturnType<typeof calculateOptimalPlan>;
  color: typeof colorClasses.emerald;
}) {
  return (
    <div className="space-y-6">
      {/* Optimal Badge */}
      {result.taxSaving > 0 && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span className="text-emerald-400 font-semibold">推荐：{result.optimal.name}</span>
          </div>
          <span className="text-emerald-400">可节税 ¥{formatMoney(result.taxSaving)}</span>
        </div>
      )}

      {/* Blind Zone Warning */}
      {result.blindZone.isInBlindZone && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-amber-400 font-semibold">个税盲区警告</p>
            <p className="text-white/70 text-sm mt-1">{result.blindZone.suggestion}</p>
          </div>
        </div>
      )}

      {/* Plans Comparison */}
      <div className="grid gap-4">
        {/* Separate Tax */}
        <div className={`rounded-2xl ${result.optimal.type === 'separate' ? color.bg : 'bg-white/5'} border ${result.optimal.type === 'separate' ? color.border : 'border-white/10'} p-6`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Gift className={`w-5 h-5 ${result.optimal.type === 'separate' ? color.text : 'text-white/50'}`} />
              <span className="text-white font-semibold">年终奖单独计税</span>
            </div>
            {result.optimal.type === 'separate' && (
              <span className="text-xs px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-full">推荐</span>
            )}
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-white/50">工资税额</span>
              <span className="text-white">¥{formatMoney(result.separate.salaryTax)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/50">年终奖税额</span>
              <span className="text-white">¥{formatMoney(result.separate.bonusTax)}</span>
            </div>
            <div className="flex justify-between pt-3 border-t border-white/10">
              <span className="text-white/60">应纳税额</span>
              <span className="text-white font-semibold">¥{formatMoney(result.separate.totalTax)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">税后收入</span>
              <span className="text-white font-semibold">¥{formatMoney(result.separate.afterTaxIncome)}</span>
            </div>
          </div>
        </div>

        {/* Combined Tax */}
        <div className={`rounded-2xl ${result.optimal.type === 'combined' ? 'bg-purple-500/10 border-purple-500/30' : 'bg-white/5 border-white/10'} p-6`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Wallet className={`w-5 h-5 ${result.optimal.type === 'combined' ? 'text-purple-400' : 'text-white/50'}`} />
              <span className="text-white font-semibold">年终奖并入综合所得</span>
            </div>
            {result.optimal.type === 'combined' && (
              <span className="text-xs px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-full">推荐</span>
            )}
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-white/50">综合所得</span>
              <span className="text-white">¥{formatMoney(result.combined.totalIncome)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/50">应纳税所得额</span>
              <span className="text-white">¥{formatMoney(result.combined.taxableIncome)}</span>
            </div>
            <div className="flex justify-between pt-3 border-t border-white/10">
              <span className="text-white/60">应纳税额</span>
              <span className="text-white font-semibold">¥{formatMoney(result.combined.totalTax)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">税后收入</span>
              <span className="text-white font-semibold">¥{formatMoney(result.combined.afterTaxIncome)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
