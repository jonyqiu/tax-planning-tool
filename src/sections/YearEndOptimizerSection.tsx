import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TrendingDown, Calculator, Info, CheckCircle2, AlertTriangle } from 'lucide-react';
import {
  calculateYearEndOptimal,
  formatMoney,
  type YearEndPlan,
} from '@/lib/taxCalculator';

export function YearEndOptimizerSection() {
  const [formData, setFormData] = useState({
    first11MonthsSalary: '',
    decemberSalary: '',
    yearEndBonus: '',
    insurance: '',
    deduction: '',
  });

  const [result, setResult] = useState<ReturnType<typeof calculateYearEndOptimal> | null>(null);

  const handleCalculate = () => {
    const scenario = {
      first11MonthsSalary: Number(formData.first11MonthsSalary) || 0,
      decemberSalary: Number(formData.decemberSalary) || 0,
      yearEndBonus: Number(formData.yearEndBonus) || 0,
      insurance: Number(formData.insurance) || 0,
      deduction: Number(formData.deduction) || 0,
    };

    const calculationResult = calculateYearEndOptimal(scenario);
    setResult(calculationResult);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setResult(null);
  };

  const getPlanBadgeColor = (type: YearEndPlan['type']) => {
    switch (type) {
      case 'separate':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      case 'combined':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/50';
      case 'partial':
        return 'bg-green-500/20 text-green-400 border-green-500/50';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getPlanName = (type: YearEndPlan['type']) => {
    switch (type) {
      case 'separate':
        return '单独计税';
      case 'combined':
        return '合并计税';
      case 'partial':
        return '部分单独计税';
      default:
        return '未知';
    }
  };

  return (
    <section className="w-full bg-[#1a1a2e] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="bg-[#16213e] border-none shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl text-white flex items-center gap-2">
              <Calculator className="w-5 h-5 text-[#e94560]" />
              年末奖金优化计算器
            </CardTitle>
            <p className="text-white/60 text-sm mt-1">
              前11个月工资已确定，优化12月工资和年终奖的计税方式
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* 输入区 */}
              <div className="space-y-6">
                {/* 收入信息 */}
                <div className="bg-[#0f3460]/50 rounded-lg p-6">
                  <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">
                      1
                    </span>
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
                          value={formData.first11MonthsSalary}
                          onChange={(e) => handleInputChange('first11MonthsSalary', e.target.value)}
                          className="pl-7 bg-[#1a1a2e] border-white/20 text-white placeholder:text-white/30"
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
                          value={formData.decemberSalary}
                          onChange={(e) => handleInputChange('decemberSalary', e.target.value)}
                          className="pl-7 bg-[#1a1a2e] border-white/20 text-white placeholder:text-white/30"
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
                          value={formData.yearEndBonus}
                          onChange={(e) => handleInputChange('yearEndBonus', e.target.value)}
                          className="pl-7 bg-[#1a1a2e] border-white/20 text-white placeholder:text-white/30"
                        />
                      </div>
                      <p className="text-white/40 text-xs">年终一次性奖金金额</p>
                    </div>
                  </div>
                </div>

                {/* 扣除信息 */}
                <div className="bg-[#0f3460]/50 rounded-lg p-6">
                  <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs">
                      2
                    </span>
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
                          value={formData.insurance}
                          onChange={(e) => handleInputChange('insurance', e.target.value)}
                          className="pl-7 bg-[#1a1a2e] border-white/20 text-white placeholder:text-white/30"
                        />
                      </div>
                      <p className="text-white/40 text-xs">全年社保公积金个人缴纳部分</p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white/80">专项附加扣除</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50">¥</span>
                        <Input
                          type="number"
                          placeholder="48000"
                          value={formData.deduction}
                          onChange={(e) => handleInputChange('deduction', e.target.value)}
                          className="pl-7 bg-[#1a1a2e] border-white/20 text-white placeholder:text-white/30"
                        />
                      </div>
                      <p className="text-white/40 text-xs">子女教育、房贷、租金等扣除</p>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleCalculate}
                  className="w-full bg-[#e94560] hover:bg-[#e94560]/90 text-white"
                  size="lg"
                >
                  <TrendingDown className="w-5 h-5 mr-2" />
                  计算最优方案
                </Button>
              </div>

              {/* 结果区 */}
              <div className="space-y-6">
                {!result ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <Calculator className="w-16 h-16 text-white/20 mx-auto mb-4" />
                      <p className="text-white/40">输入信息后点击计算</p>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* 收入汇总 */}
                    <div className="bg-[#0f3460]/50 rounded-lg p-4">
                      <p className="text-white/70 text-xs mb-2">全年收入构成</p>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div>
                          <p className="text-white/50 text-xs">前11个月工资</p>
                          <p className="text-white">¥{formatMoney(result.scenario.first11MonthsSalary)}</p>
                        </div>
                        <div>
                          <p className="text-white/50 text-xs">12月工资</p>
                          <p className="text-white">¥{formatMoney(result.scenario.decemberSalary)}</p>
                        </div>
                        <div>
                          <p className="text-white/50 text-xs">年终奖</p>
                          <p className="text-white">¥{formatMoney(result.scenario.yearEndBonus)}</p>
                        </div>
                      </div>
                      <div className="mt-2 pt-2 border-t border-white/10">
                        <p className="text-white/50 text-xs">全年应税总收入</p>
                        <p className="text-white font-semibold">
                          ¥{formatMoney(result.scenario.first11MonthsSalary + result.scenario.decemberSalary + result.scenario.yearEndBonus)}
                        </p>
                      </div>
                    </div>

                    {/* 最优方案 */}
                    <Alert className="bg-green-500/10 border-green-500/50">
                      <CheckCircle2 className="h-5 w-5 text-green-400" />
                      <AlertDescription className="text-white ml-2">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold">推荐方案：</span>
                          <Badge
                            variant="outline"
                            className={getPlanBadgeColor(result.optimal.type)}
                          >
                            {getPlanName(result.optimal.type)}
                          </Badge>
                        </div>
                        <p className="text-white/80 text-sm">{result.optimal.description}</p>
                        {result.taxSaving > 0 && (
                          <div className="mt-3 pt-3 border-t border-green-500/30">
                            <p className="text-green-400 font-semibold">
                              可节税 ¥{formatMoney(result.taxSaving)}
                            </p>
                          </div>
                        )}
                      </AlertDescription>
                    </Alert>

                    {/* 方案对比 */}
                    <div className="space-y-3">
                      <h4 className="text-white font-semibold flex items-center gap-2">
                        <Info className="w-4 h-4 text-[#e94560]" />
                        方案对比
                      </h4>

                      {result.plans.map((plan, index) => (
                        <div
                          key={index}
                          className={`p-4 rounded-lg border ${
                            plan.type === result.optimal.type
                              ? 'bg-green-500/10 border-green-500/50'
                              : 'bg-[#0f3460]/30 border-white/10'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Badge
                                variant="outline"
                                className={getPlanBadgeColor(plan.type)}
                              >
                                {getPlanName(plan.type)}
                              </Badge>
                              {plan.type === result.optimal.type && (
                                <span className="text-green-400 text-xs">最优</span>
                              )}
                            </div>
                            <span className="text-white font-semibold">
                              ¥{formatMoney(plan.totalTax)}
                            </span>
                          </div>
                          <p className="text-white/60 text-sm">{plan.description}</p>

                          {/* 年终奖分配 */}
                          <div className="mt-3 pt-3 border-t border-white/10">
                            <p className="text-white/70 text-xs mb-2 font-medium">年终奖分配</p>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div>
                                <span className="text-white/50">单独计税：</span>
                                <span className="text-blue-400">
                                  ¥{formatMoney(plan.separateBonus)}
                                </span>
                              </div>
                              <div>
                                <span className="text-white/50">并入综合所得：</span>
                                <span className="text-purple-400">
                                  ¥{formatMoney(plan.mergedBonus)}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* 税额详情 */}
                          <div className="mt-3 pt-3 border-t border-white/10">
                            <p className="text-white/70 text-xs mb-2 font-medium">税额详情</p>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div>
                                <span className="text-white/50">年终奖税额：</span>
                                <span className="text-[#e94560]">
                                  ¥{formatMoney(plan.separateBonusTax)}
                                </span>
                              </div>
                              <div>
                                <span className="text-white/50">工资综合税额：</span>
                                <span className="text-[#e94560]">
                                  ¥{formatMoney(plan.salaryTax)}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* 适用税率 */}
                          <div className="mt-2 text-xs text-white/40">
                            {plan.bonusRate > 0 && (
                              <span className="mr-4">
                                年终奖税率: {(plan.bonusRate * 100).toFixed(0)}%
                              </span>
                            )}
                            <span>综合所得税率: {(plan.salaryRate * 100).toFixed(0)}%</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* 盲区警告 */}
                    {result.scenario.yearEndBonus > 0 && (
                      <div className="bg-[#0f3460]/50 rounded-lg p-4">
                        <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-yellow-400" />
                          盲区提醒
                        </h4>
                        <p className="text-white/60 text-sm">
                          年终奖单独计税时，以下区间会出现"多发少得"现象：
                        </p>
                        <ul className="mt-2 text-xs text-white/50 space-y-1">
                          <li>• 36,000 ~ 38,567 元（多发1元少得2,310元）</li>
                          <li>• 144,000 ~ 160,500 元（多发1元少得13,200元）</li>
                          <li>• 300,000 ~ 318,333 元（多发1元少得13,750元）</li>
                          <li>• 420,000 ~ 447,500 元（多发1元少得19,250元）</li>
                          <li>• 660,000 ~ 706,539 元（多发1元少得30,250元）</li>
                          <li>• 960,000 ~ 1,120,000 元（多发1元少得88,000元）</li>
                        </ul>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
