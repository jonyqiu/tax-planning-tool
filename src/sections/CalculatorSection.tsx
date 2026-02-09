import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { calculateOptimalPlan, formatMoney } from '@/lib/taxCalculator';
import { TrendingDown, Wallet, PiggyBank, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { CalculationSteps } from '@/components/CalculationSteps';

interface CalculatorSectionProps {
  onCalculate: (result: ReturnType<typeof calculateOptimalPlan>) => void;
}

export function CalculatorSection({ onCalculate }: CalculatorSectionProps) {
  const [salary, setSalary] = useState('');
  const [bonus, setBonus] = useState('');
  const [insurance, setInsurance] = useState('');
  const [deduction, setDeduction] = useState('');
  const [result, setResult] = useState<ReturnType<typeof calculateOptimalPlan> | null>(null);

  const handleCalculate = () => {
    const salaryNum = parseFloat(salary) || 0;
    const bonusNum = parseFloat(bonus) || 0;
    const insuranceNum = parseFloat(insurance) || 0;
    const deductionNum = parseFloat(deduction) || 0;

    const calcResult = calculateOptimalPlan(salaryNum, bonusNum, insuranceNum, deductionNum);
    setResult(calcResult);
    onCalculate(calcResult);
  };

  const handleClear = () => {
    setSalary('');
    setBonus('');
    setInsurance('');
    setDeduction('');
    setResult(null);
  };

  return (
    <section className="w-full bg-[#1a1a2e] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* 输入区 */}
          <Card className="lg:col-span-2 bg-[#16213e] border-none shadow-xl">
            <CardHeader>
              <CardTitle className="text-xl text-white flex items-center gap-2">
                <Wallet className="w-5 h-5 text-[#e94560]" />
                收入信息
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="salary" className="text-white/80">
                  年度工资收入 (元)
                </Label>
                <Input
                  id="salary"
                  type="number"
                  placeholder="请输入年度工资总额"
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                  className="bg-[#0f3460] border-white/10 text-white placeholder:text-white/50 focus:border-[#e94560]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bonus" className="text-white/80">
                  年终奖金额 (元)
                </Label>
                <Input
                  id="bonus"
                  type="number"
                  placeholder="请输入年终奖金额"
                  value={bonus}
                  onChange={(e) => setBonus(e.target.value)}
                  className="bg-[#0f3460] border-white/10 text-white placeholder:text-white/50 focus:border-[#e94560]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="insurance" className="text-white/80">
                  三险一金等专项扣除 (元)
                </Label>
                <Input
                  id="insurance"
                  type="number"
                  placeholder="请输入三险一金总额"
                  value={insurance}
                  onChange={(e) => setInsurance(e.target.value)}
                  className="bg-[#0f3460] border-white/10 text-white placeholder:text-white/50 focus:border-[#e94560]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deduction" className="text-white/80">
                  专项附加扣除 (元)
                </Label>
                <Input
                  id="deduction"
                  type="number"
                  placeholder="请输入专项附加扣除总额"
                  value={deduction}
                  onChange={(e) => setDeduction(e.target.value)}
                  className="bg-[#0f3460] border-white/10 text-white placeholder:text-white/50 focus:border-[#e94560]"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button
                  onClick={handleCalculate}
                  className="flex-1 bg-[#e94560] hover:bg-[#d63d56] text-white"
                >
                  计算最优方案
                </Button>
                <Button
                  onClick={handleClear}
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  清空
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 结果区 */}
          <Card className="lg:col-span-3 bg-[#16213e] border-none shadow-xl">
            <CardHeader>
              <CardTitle className="text-xl text-white flex items-center gap-2">
                <PiggyBank className="w-5 h-5 text-[#e94560]" />
                计算结果
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!result ? (
                <div className="flex flex-col items-center justify-center py-12 text-white/50">
                  <CalculatorIcon className="w-16 h-16 mb-4 opacity-50" />
                  <p>请输入收入信息后点击计算</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* 盲区警告 */}
                  {result.blindZone.isInBlindZone && (
                    <div className="bg-[#e94560]/20 border border-[#e94560]/50 rounded-lg p-4 flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-[#e94560] flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[#e94560] font-semibold">⚠️ 个税盲区警告</p>
                        <p className="text-white/80 text-sm mt-1">{result.blindZone.suggestion}</p>
                      </div>
                    </div>
                  )}

                  {/* 最优方案 */}
                  <div className="bg-gradient-to-r from-[#e94560]/20 to-[#e94560]/10 border border-[#e94560]/50 rounded-lg p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-400" />
                        <span className="text-white font-semibold">最优方案</span>
                      </div>
                      <Badge className="bg-[#e94560] text-white">
                        {result.optimal.name}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <p className="text-white/60 text-sm">应纳税额</p>
                        <p className="text-2xl font-bold text-[#e94560]">
                          ¥{formatMoney(result.optimal.totalTax)}
                        </p>
                      </div>
                    </div>
                    {result.taxSaving > 0 && (
                      <div className="mt-3 pt-3 border-t border-white/10 flex items-center gap-2">
                        <TrendingDown className="w-4 h-4 text-green-400" />
                        <span className="text-green-400 text-sm">
                          相比另一方案节税 ¥{formatMoney(result.taxSaving)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* 方案对比 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* 单独计税 */}
                    <div className={`bg-[#0f3460] rounded-lg p-4 ${result.optimal.type === 'separate' ? 'ring-2 ring-green-400/50' : ''}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-medium">单独计税</span>
                        {result.optimal.type === 'separate' && (
                          <Badge variant="outline" className="border-green-400 text-green-400 text-xs">
                            推荐
                          </Badge>
                        )}
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-white/60">工资税额:</span>
                          <span className="text-white">¥{formatMoney(result.separate.salaryTax)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-white/60">年终奖税额:</span>
                          <span className="text-white">¥{formatMoney(result.separate.bonusTax)}</span>
                        </div>
                        <div className="flex justify-between text-sm pt-1 border-t border-white/10">
                          <span className="text-white/80">总税额:</span>
                          <span className="text-[#e94560] font-semibold">¥{formatMoney(result.separate.totalTax)}</span>
                        </div>
                      </div>
                    </div>

                    {/* 合并计税 */}
                    <div className={`bg-[#0f3460] rounded-lg p-4 ${result.optimal.type === 'combined' ? 'ring-2 ring-green-400/50' : ''}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-medium">合并计税</span>
                        {result.optimal.type === 'combined' && (
                          <Badge variant="outline" className="border-green-400 text-green-400 text-xs">
                            推荐
                          </Badge>
                        )}
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-white/60">应纳税所得额:</span>
                          <span className="text-white">¥{formatMoney(result.combined.taxableIncome)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-white/60">适用税率:</span>
                          <span className="text-white">{(result.combined.rate * 100).toFixed(0)}%</span>
                        </div>
                        <div className="flex justify-between text-sm pt-1 border-t border-white/10">
                          <span className="text-white/80">总税额:</span>
                          <span className="text-[#e94560] font-semibold">¥{formatMoney(result.combined.totalTax)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                <CalculationSteps type={result.optimal.type} calculation={result.optimal.calculation} />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

function CalculatorIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
      />
    </svg>
  );
}
