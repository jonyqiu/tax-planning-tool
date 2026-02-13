import { useState } from 'react';
// Card components removed as they are not used in this file
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Calculator,
  TrendingDown,
  CheckCircle2,
  AlertTriangle,
  Split,
  Calendar,
  FileText,
  ChevronRight,
  Info,
  Eye
} from 'lucide-react';
import {
  calculateOptimalSplit,
  calculateYearEndOptimal,
  calculateOptimalPlan,
  formatMoney,
  type YearEndScenario,
  type YearEndPlan,
} from '@/lib/taxCalculator';

type ScenarioType = 'split' | 'yearend' | 'compare';

interface ScenarioConfig {
  type: ScenarioType;
  title: string;
  description: string;
  icon: React.ReactNode;
  bgColor: string;
  borderColor: string;
}

const scenarios: ScenarioConfig[] = [
  {
    type: 'split',
    title: '智能拆分方案',
    description: '输入税前年度总收入，系统自动计算最优的工资和年终奖拆分方案，自动避开个税盲区',
    icon: <Split className="w-6 h-6" />,
    bgColor: 'bg-gradient-to-br from-emerald-500/20 to-teal-500/20',
    borderColor: 'border-emerald-500/50',
  },
  {
    type: 'yearend',
    title: '年末优化方案',
    description: '前11个月工资已确定，优化12月工资和年终奖的计税方式',
    icon: <Calendar className="w-6 h-6" />,
    bgColor: 'bg-gradient-to-br from-blue-500/20 to-indigo-500/20',
    borderColor: 'border-blue-500/50',
  },
  {
    type: 'compare',
    title: '方案对比',
    description: '已确定工资和年终奖，计算年终奖单独计税和并入综合所得的税收差异',
    icon: <FileText className="w-6 h-6" />,
    bgColor: 'bg-gradient-to-br from-amber-500/20 to-orange-500/20',
    borderColor: 'border-amber-500/50',
  },
];

export function TaxCalculatorSection() {
  const [selectedScenario, setSelectedScenario] = useState<ScenarioType | null>(null);

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

  const handleScenarioSelect = (type: ScenarioType) => {
    setSelectedScenario(type);
    // 重置所有结果
    setSplitResult(null);
    setYearEndResult(null);
    setCompareResult(null);
  };

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

  const renderScenarioSelector = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {scenarios.map((scenario) => (
        <button
          key={scenario.type}
          onClick={() => handleScenarioSelect(scenario.type)}
          className={`relative p-6 rounded-xl border-2 text-left transition-all duration-300 hover:scale-[1.02] ${
            selectedScenario === scenario.type
              ? `${scenario.bgColor} ${scenario.borderColor} border-2`
              : 'bg-[#16213e]/50 border-white/10 hover:border-white/30'
          }`}
        >
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${
            selectedScenario === scenario.type ? 'text-white' : 'text-white/60'
          }`}>
            {scenario.icon}
          </div>
          <h3 className="text-white font-semibold text-lg mb-2">{scenario.title}</h3>
          <p className="text-white/60 text-sm leading-relaxed">{scenario.description}</p>
          {selectedScenario === scenario.type && (
            <div className="absolute top-4 right-4">
              <CheckCircle2 className="w-5 h-5 text-white" />
            </div>
          )}
        </button>
      ))}
    </div>
  );

  const renderSplitForm = () => (
    <div className="space-y-6">
      <div className="bg-emerald-500/10 rounded-lg p-6 border border-emerald-500/30">
        <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xs">1</span>
          收入信息
        </h4>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-white/80">税前年度总收入</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50">¥</span>
              <Input
                type="number"
                placeholder="例如：300000"
                value={splitForm.totalIncome}
                onChange={(e) => setSplitForm({ ...splitForm, totalIncome: e.target.value })}
                className="pl-7 bg-[#1a1a2e] border-white/20 text-white"
              />
            </div>
            <p className="text-white/40 text-xs">全年税前总收入（不含五险一金个人缴纳部分）</p>
          </div>
        </div>
      </div>

      <div className="bg-emerald-500/10 rounded-lg p-6 border border-emerald-500/30">
        <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xs">2</span>
          扣除信息
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-white/80">三险一金（全年）</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50">¥</span>
              <Input
                type="number"
                placeholder="24000"
                value={splitForm.insurance}
                onChange={(e) => setSplitForm({ ...splitForm, insurance: e.target.value })}
                className="pl-7 bg-[#1a1a2e] border-white/20 text-white"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-white/80">专项附加扣除（全年）</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50">¥</span>
              <Input
                type="number"
                placeholder="48000"
                value={splitForm.deduction}
                onChange={(e) => setSplitForm({ ...splitForm, deduction: e.target.value })}
                className="pl-7 bg-[#1a1a2e] border-white/20 text-white"
              />
            </div>
          </div>
        </div>
      </div>

      <Button
        onClick={handleSplitCalculate}
        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
        size="lg"
      >
        <Calculator className="w-5 h-5 mr-2" />
        计算最优拆分方案
      </Button>
    </div>
  );

  const renderSplitResult = () => {
    if (!splitResult) return null;

    return (
      <div className="space-y-6">
        {/* 最优方案 */}
        <Alert className="bg-emerald-500/10 border-emerald-500/50">
          <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          <AlertDescription className="text-white ml-2">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-semibold">推荐方案：</span>
              <Badge variant="outline" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/50">
                {splitResult.planName}
              </Badge>
            </div>
            {splitResult.blindZoneAvoided && (
              <p className="text-amber-400 text-sm flex items-center gap-1">
                <AlertTriangle className="w-4 h-4" />
                已自动避开个税盲区
              </p>
            )}
          </AlertDescription>
        </Alert>

        {/* 拆分结果 */}
        <div className="bg-[#0f3460]/50 rounded-lg p-6">
          <h4 className="text-white font-semibold mb-4">最优拆分方案</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#1a1a2e] rounded-lg p-4">
              <p className="text-white/60 text-sm mb-1">建议工资部分</p>
              <p className="text-emerald-400 text-2xl font-bold">¥{formatMoney(splitResult.optimalSalary)}</p>
            </div>
            <div className="bg-[#1a1a2e] rounded-lg p-4">
              <p className="text-white/60 text-sm mb-1">建议年终奖部分</p>
              <p className="text-blue-400 text-2xl font-bold">¥{formatMoney(splitResult.optimalBonus)}</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="flex justify-between items-center">
              <span className="text-white/60">总应纳税额</span>
              <span className="text-[#e94560] text-xl font-bold">¥{formatMoney(splitResult.totalTax)}</span>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-white/60">税后收入</span>
              <span className="text-emerald-400 text-xl font-bold">¥{formatMoney(splitResult.afterTaxIncome)}</span>
            </div>
          </div>
        </div>

        {/* 计算过程 */}
        <div className="bg-white rounded-lg p-6 text-gray-800">
          <h4 className="font-semibold mb-4 text-lg">计算过程</h4>
          <div className="space-y-3">
            {splitResult.calculationSteps.map((step, index) => (
              <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                <div>
                  <span className="text-gray-600">{step.description}</span>
                  {step.formula && (
                    <span className="text-gray-400 text-sm ml-2">({step.formula})</span>
                  )}
                </div>
                <span className="font-mono font-medium">
                  {step.description.includes('税率')
                    ? `${(step.value * 100).toFixed(0)}%`
                    : `¥${formatMoney(step.value)}`
                  }
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderYearEndForm = () => (
    <div className="space-y-6">
      <div className="bg-blue-500/10 rounded-lg p-6 border border-blue-500/30">
        <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">1</span>
          收入信息
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-white/80">前11个月累计工资</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50">¥</span>
              <Input
                type="number"
                placeholder="220000"
                value={yearEndForm.first11MonthsSalary}
                onChange={(e) => setYearEndForm({ ...yearEndForm, first11MonthsSalary: e.target.value })}
                className="pl-7 bg-[#1a1a2e] border-white/20 text-white"
              />
            </div>
            <p className="text-white/40 text-xs">1-11月已发放工资总额</p>
          </div>
          <div className="space-y-2">
            <Label className="text-white/80">12月工资</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50">¥</span>
              <Input
                type="number"
                placeholder="20000"
                value={yearEndForm.decemberSalary}
                onChange={(e) => setYearEndForm({ ...yearEndForm, decemberSalary: e.target.value })}
                className="pl-7 bg-[#1a1a2e] border-white/20 text-white"
              />
            </div>
            <p className="text-white/40 text-xs">12月应发工资</p>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label className="text-white/80">年终奖</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50">¥</span>
              <Input
                type="number"
                placeholder="50000"
                value={yearEndForm.yearEndBonus}
                onChange={(e) => setYearEndForm({ ...yearEndForm, yearEndBonus: e.target.value })}
                className="pl-7 bg-[#1a1a2e] border-white/20 text-white"
              />
            </div>
            <p className="text-white/40 text-xs">年终一次性奖金金额</p>
          </div>
        </div>
      </div>

      <div className="bg-blue-500/10 rounded-lg p-6 border border-blue-500/30">
        <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">2</span>
          扣除信息（全年）
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-white/80">三险一金</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50">¥</span>
              <Input
                type="number"
                placeholder="24000"
                value={yearEndForm.insurance}
                onChange={(e) => setYearEndForm({ ...yearEndForm, insurance: e.target.value })}
                className="pl-7 bg-[#1a1a2e] border-white/20 text-white"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-white/80">专项附加扣除</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50">¥</span>
              <Input
                type="number"
                placeholder="48000"
                value={yearEndForm.deduction}
                onChange={(e) => setYearEndForm({ ...yearEndForm, deduction: e.target.value })}
                className="pl-7 bg-[#1a1a2e] border-white/20 text-white"
              />
            </div>
          </div>
        </div>
      </div>

      <Button
        onClick={handleYearEndCalculate}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        size="lg"
      >
        <TrendingDown className="w-5 h-5 mr-2" />
        计算年末最优方案
      </Button>
    </div>
  );

  // 计算过程弹窗组件
  const CalculationDetailDialog = ({ plan }: { plan: YearEndPlan }) => {
    if (!plan.calculationSteps) return null;

    return (
      <Dialog>
        <DialogTrigger asChild>
          <button className="text-blue-400 text-sm flex items-center gap-1 hover:text-blue-300 transition-colors mt-2">
            <Eye className="w-4 h-4" />
            查看计算详情
          </button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-white text-gray-800">
          <DialogHeader>
            <DialogTitle className="text-xl">{plan.name} - 详细计算过程</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {/* 工资部分计算 */}
            {plan.calculationSteps.salarySteps.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-blue-600 mb-3">工资部分计算</h4>
                <div className="space-y-2 text-sm">
                  {plan.calculationSteps.salarySteps.map((step, idx) => (
                    <div key={idx} className="flex justify-between py-1 border-b border-gray-200 last:border-0">
                      <div className="flex-1">
                        <span className="text-gray-600">{step.description}</span>
                        {step.formula && (
                          <span className="text-gray-400 text-xs ml-2">({step.formula})</span>
                        )}
                      </div>
                      <span className="font-mono font-medium ml-4">
                        {step.description.includes('税率')
                          ? `${(step.value * 100).toFixed(0)}%`
                          : `¥${formatMoney(step.value)}`
                        }
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 年终奖部分计算 */}
            {plan.calculationSteps.bonusSteps.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-emerald-600 mb-3">年终奖部分计算</h4>
                <div className="space-y-2 text-sm">
                  {plan.calculationSteps.bonusSteps.map((step, idx) => (
                    <div key={idx} className="flex justify-between py-1 border-b border-gray-200 last:border-0">
                      <div className="flex-1">
                        <span className="text-gray-600">{step.description}</span>
                        {step.formula && (
                          <span className="text-gray-400 text-xs ml-2">({step.formula})</span>
                        )}
                      </div>
                      <span className="font-mono font-medium ml-4">
                        {step.description.includes('税率')
                          ? `${(step.value * 100).toFixed(0)}%`
                          : `¥${formatMoney(step.value)}`
                        }
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 汇总 */}
            <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
              <h4 className="font-semibold text-blue-700 mb-3">计算汇总</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-2 border-b border-blue-100">
                  <span className="text-gray-700">工资应纳税额</span>
                  <span className="font-mono font-semibold text-red-600">¥{formatMoney(plan.salaryTax)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-blue-100">
                  <span className="text-gray-700">年终奖应纳税额</span>
                  <span className="font-mono font-semibold text-red-600">¥{formatMoney(plan.separateBonusTax)}</span>
                </div>
                <div className="flex justify-between py-3 bg-white rounded px-3 mt-2">
                  <span className="font-semibold text-gray-800">总应纳税额</span>
                  <span className="font-mono font-bold text-red-600 text-lg">¥{formatMoney(plan.totalTax)}</span>
                </div>
                <div className="flex justify-between py-2 px-3">
                  <span className="text-gray-700">税后收入</span>
                  <span className="font-mono font-semibold text-emerald-600">¥{formatMoney(plan.afterTaxIncome)}</span>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  const renderYearEndResult = () => {
    if (!yearEndResult) return null;

    return (
      <div className="space-y-6">
        {/* 收入汇总 */}
        <div className="bg-[#0f3460]/50 rounded-lg p-4">
          <p className="text-white/70 text-xs mb-2">全年收入构成</p>
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div>
              <p className="text-white/50 text-xs">前11个月工资</p>
              <p className="text-white">¥{formatMoney(yearEndResult.scenario.first11MonthsSalary)}</p>
            </div>
            <div>
              <p className="text-white/50 text-xs">12月工资</p>
              <p className="text-white">¥{formatMoney(yearEndResult.scenario.decemberSalary)}</p>
            </div>
            <div>
              <p className="text-white/50 text-xs">年终奖</p>
              <p className="text-white">¥{formatMoney(yearEndResult.scenario.yearEndBonus)}</p>
            </div>
          </div>
        </div>

        {/* 最优方案 */}
        <Alert className="bg-blue-500/10 border-blue-500/50">
          <CheckCircle2 className="h-5 w-5 text-blue-400" />
          <AlertDescription className="text-white ml-2">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-semibold">推荐方案：</span>
              <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/50">
                {yearEndResult.optimal.name}
              </Badge>
            </div>
            <p className="text-white/80 text-sm">{yearEndResult.optimal.description}</p>

            {/* 显示应纳税额 */}
            <div className="mt-3 pt-3 border-t border-blue-500/30">
              <div className="flex justify-between items-center">
                <span className="text-white/80">应纳税额</span>
                <span className="text-[#e94560] text-xl font-bold">¥{formatMoney(yearEndResult.optimal.totalTax)}</span>
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-white/80">税后收入</span>
                <span className="text-emerald-400 font-semibold">¥{formatMoney(yearEndResult.optimal.afterTaxIncome)}</span>
              </div>
            </div>

            {/* 查看计算详情按钮 */}
            <CalculationDetailDialog plan={yearEndResult.optimal} />

            {yearEndResult.taxSaving > 0 && (
              <div className="mt-3 pt-3 border-t border-blue-500/30">
                <p className="text-emerald-400 font-semibold">
                  可节税 ¥{formatMoney(yearEndResult.taxSaving)}
                </p>
              </div>
            )}
          </AlertDescription>
        </Alert>

        {/* 方案对比 */}
        <div className="space-y-3">
          <h4 className="text-white font-semibold flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-400" />
            方案对比
          </h4>
          {yearEndResult.plans.map((plan, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border ${
                plan.type === yearEndResult.optimal.type
                  ? 'bg-blue-500/10 border-blue-500/50'
                  : 'bg-[#0f3460]/30 border-white/10'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={
                    plan.type === 'separate' ? 'bg-blue-500/20 text-blue-400 border-blue-500/50' :
                    plan.type === 'combined' ? 'bg-purple-500/20 text-purple-400 border-purple-500/50' :
                    'bg-green-500/20 text-green-400 border-green-500/50'
                  }>
                    {plan.name}
                  </Badge>
                  {plan.type === yearEndResult.optimal.type && (
                    <span className="text-emerald-400 text-xs">最优</span>
                  )}
                </div>
                <span className="text-white font-semibold">¥{formatMoney(plan.totalTax)}</span>
              </div>
              <p className="text-white/60 text-sm">{plan.description}</p>

              <div className="mt-3 pt-3 border-t border-white/10">
                <p className="text-white/70 text-xs mb-2">年终奖分配</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-white/50">单独计税：</span>
                    <span className="text-blue-400">¥{formatMoney(plan.separateBonus)}</span>
                  </div>
                  <div>
                    <span className="text-white/50">并入综合所得：</span>
                    <span className="text-purple-400">¥{formatMoney(plan.mergedBonus)}</span>
                  </div>
                </div>
              </div>

              {/* 每个方案都显示查看详情 */}
              <CalculationDetailDialog plan={plan} />
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderCompareForm = () => (
    <div className="space-y-6">
      <div className="bg-amber-500/10 rounded-lg p-6 border border-amber-500/30">
        <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center text-white text-xs">1</span>
          收入信息
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-white/80">年度工资</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50">¥</span>
              <Input
                type="number"
                placeholder="240000"
                value={compareForm.salary}
                onChange={(e) => setCompareForm({ ...compareForm, salary: e.target.value })}
                className="pl-7 bg-[#1a1a2e] border-white/20 text-white"
              />
            </div>
            <p className="text-white/40 text-xs">全年工资收入总额</p>
          </div>
          <div className="space-y-2">
            <Label className="text-white/80">年终奖</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50">¥</span>
              <Input
                type="number"
                placeholder="36000"
                value={compareForm.bonus}
                onChange={(e) => setCompareForm({ ...compareForm, bonus: e.target.value })}
                className="pl-7 bg-[#1a1a2e] border-white/20 text-white"
              />
            </div>
            <p className="text-white/40 text-xs">年终一次性奖金</p>
          </div>
        </div>
      </div>

      <div className="bg-amber-500/10 rounded-lg p-6 border border-amber-500/30">
        <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center text-white text-xs">2</span>
          扣除信息
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-white/80">三险一金（全年）</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50">¥</span>
              <Input
                type="number"
                placeholder="24000"
                value={compareForm.insurance}
                onChange={(e) => setCompareForm({ ...compareForm, insurance: e.target.value })}
                className="pl-7 bg-[#1a1a2e] border-white/20 text-white"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-white/80">专项附加扣除（全年）</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50">¥</span>
              <Input
                type="number"
                placeholder="48000"
                value={compareForm.deduction}
                onChange={(e) => setCompareForm({ ...compareForm, deduction: e.target.value })}
                className="pl-7 bg-[#1a1a2e] border-white/20 text-white"
              />
            </div>
          </div>
        </div>
      </div>

      <Button
        onClick={handleCompareCalculate}
        className="w-full bg-amber-600 hover:bg-amber-700 text-white"
        size="lg"
      >
        <Split className="w-5 h-5 mr-2" />
        计算方案对比
      </Button>
    </div>
  );

  const renderCompareResult = () => {
    if (!compareResult) return null;

    const separate = compareResult.separate;
    const combined = compareResult.combined;

    return (
      <div className="space-y-6">
        {/* 最优方案提示 */}
        <Alert className={`${
          compareResult.optimal.type === 'separate'
            ? 'bg-blue-500/10 border-blue-500/50'
            : 'bg-purple-500/10 border-purple-500/50'
        }`}>
          <CheckCircle2 className={`h-5 w-5 ${
            compareResult.optimal.type === 'separate' ? 'text-blue-400' : 'text-purple-400'
          }`} />
          <AlertDescription className="text-white ml-2">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-semibold">推荐方案：</span>
              <Badge variant="outline" className={
                compareResult.optimal.type === 'separate'
                  ? 'bg-blue-500/20 text-blue-400 border-blue-500/50'
                  : 'bg-purple-500/20 text-purple-400 border-purple-500/50'
              }>
                {compareResult.optimal.name}
              </Badge>
            </div>
            {compareResult.taxSaving > 0 && (
              <p className="text-emerald-400 font-semibold">
                可节税 ¥{formatMoney(compareResult.taxSaving)}
              </p>
            )}
          </AlertDescription>
        </Alert>

        {/* 盲区警告 */}
        {compareResult.blindZone.isInBlindZone && (
          <Alert className="bg-amber-500/10 border-amber-500/50">
            <AlertTriangle className="h-5 w-5 text-amber-400" />
            <AlertDescription className="text-white ml-2">
              <p className="font-semibold text-amber-400">个税盲区警告</p>
              <p className="text-white/80 text-sm">{compareResult.blindZone.suggestion}</p>
            </AlertDescription>
          </Alert>
        )}

        {/* 方案对比卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 单独计税 */}
          <div className={`p-6 rounded-lg border ${
            compareResult.optimal.type === 'separate'
              ? 'bg-blue-500/10 border-blue-500/50'
              : 'bg-[#0f3460]/30 border-white/10'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/50">
                年终奖单独计税
              </Badge>
              {compareResult.optimal.type === 'separate' && (
                <span className="text-emerald-400 text-xs">推荐</span>
              )}
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-white/60">工资税额</span>
                <span className="text-white">¥{formatMoney(separate.salaryTax)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">年终奖税额</span>
                <span className="text-white">¥{formatMoney(separate.bonusTax)}</span>
              </div>
              <div className="pt-3 border-t border-white/10 flex justify-between">
                <span className="text-white font-medium">总税额</span>
                <span className="text-[#e94560] font-bold text-lg">¥{formatMoney(separate.totalTax)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">税后收入</span>
                <span className="text-emerald-400 font-medium">¥{formatMoney(separate.afterTaxIncome)}</span>
              </div>
            </div>
          </div>

          {/* 合并计税 */}
          <div className={`p-6 rounded-lg border ${
            compareResult.optimal.type === 'combined'
              ? 'bg-purple-500/10 border-purple-500/50'
              : 'bg-[#0f3460]/30 border-white/10'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <Badge variant="outline" className="bg-purple-500/20 text-purple-400 border-purple-500/50">
                年终奖并入综合所得
              </Badge>
              {compareResult.optimal.type === 'combined' && (
                <span className="text-emerald-400 text-xs">推荐</span>
              )}
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-white/60">综合所得</span>
                <span className="text-white">¥{formatMoney(combined.totalIncome)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">应纳税所得额</span>
                <span className="text-white">¥{formatMoney(combined.taxableIncome)}</span>
              </div>
              <div className="pt-3 border-t border-white/10 flex justify-between">
                <span className="text-white font-medium">总税额</span>
                <span className="text-[#e94560] font-bold text-lg">¥{formatMoney(combined.totalTax)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">税后收入</span>
                <span className="text-emerald-400 font-medium">¥{formatMoney(combined.afterTaxIncome)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 计算过程 */}
        <div className="bg-white rounded-lg p-6 text-gray-800">
          <h4 className="font-semibold mb-4 text-lg">详细计算过程</h4>

          <div className="space-y-6">
            {/* 单独计税过程 */}
            <div>
              <h5 className="font-medium text-blue-600 mb-3">方案一：年终奖单独计税</h5>
              <div className="space-y-2 text-sm">
                {separate.calculation.salarySteps.map((step, idx) => (
                  <div key={idx} className="flex justify-between py-1 border-b border-gray-100">
                    <span className="text-gray-600">{step.description}</span>
                    <span className="font-mono">
                      {step.description.includes('税率') ? `${(step.value * 100).toFixed(0)}%` : `¥${formatMoney(step.value)}`}
                    </span>
                  </div>
                ))}
                <div className="pt-2 border-t-2 border-gray-200">
                  <div className="flex justify-between font-medium">
                    <span>工资应纳税额</span>
                    <span className="text-red-600">¥{formatMoney(separate.salaryTax)}</span>
                  </div>
                </div>
                {separate.calculation.bonusSteps.map((step, idx) => (
                  <div key={idx} className="flex justify-between py-1 border-b border-gray-100">
                    <span className="text-gray-600">{step.description}</span>
                    <span className="font-mono">
                      {step.description.includes('税率') ? `${(step.value * 100).toFixed(0)}%` : `¥${formatMoney(step.value)}`}
                    </span>
                  </div>
                ))}
                <div className="pt-2 border-t-2 border-gray-200">
                  <div className="flex justify-between font-medium">
                    <span>年终奖应纳税额</span>
                    <span className="text-red-600">¥{formatMoney(separate.bonusTax)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 合并计税过程 */}
            <div className="pt-4 border-t border-gray-200">
              <h5 className="font-medium text-purple-600 mb-3">方案二：年终奖并入综合所得</h5>
              <div className="space-y-2 text-sm">
                {combined.calculation.steps.map((step, idx) => (
                  <div key={idx} className="flex justify-between py-1 border-b border-gray-100">
                    <span className="text-gray-600">{step.description}</span>
                    <span className="font-mono">
                      {step.description.includes('税率') ? `${(step.value * 100).toFixed(0)}%` : `¥${formatMoney(step.value)}`}
                    </span>
                  </div>
                ))}
                <div className="pt-2 border-t-2 border-gray-200">
                  <div className="flex justify-between font-medium">
                    <span>总应纳税额</span>
                    <span className="text-red-600">¥{formatMoney(combined.totalTax)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderForm = () => {
    switch (selectedScenario) {
      case 'split':
        return renderSplitForm();
      case 'yearend':
        return renderYearEndForm();
      case 'compare':
        return renderCompareForm();
      default:
        return null;
    }
  };

  const renderResult = () => {
    switch (selectedScenario) {
      case 'split':
        return renderSplitResult();
      case 'yearend':
        return renderYearEndResult();
      case 'compare':
        return renderCompareResult();
      default:
        return null;
    }
  };

  return (
    <section className="w-full bg-[#1a1a2e] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-white mb-3">个税优化计算器</h2>
          <p className="text-white/60">选择适合您的计算场景，获取最优税务方案</p>
        </div>

        {/* 场景选择器 */}
        {!selectedScenario ? (
          <div className="max-w-5xl mx-auto">
            {renderScenarioSelector()}
          </div>
        ) : (
          <div className="max-w-6xl mx-auto">
            {/* 返回按钮 */}
            <button
              onClick={() => setSelectedScenario(null)}
              className="mb-6 text-white/60 hover:text-white flex items-center gap-2 transition-colors"
            >
              <ChevronRight className="w-4 h-4 rotate-180" />
              返回选择场景
            </button>

            {/* 当前场景标题 */}
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-white">
                {scenarios.find(s => s.type === selectedScenario)?.title}
              </h3>
              <p className="text-white/60 mt-1">
                {scenarios.find(s => s.type === selectedScenario)?.description}
              </p>
            </div>

            {/* 表单和结果 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>{renderForm()}</div>
              <div>{renderResult()}</div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
