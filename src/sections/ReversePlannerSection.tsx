import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  calculateReversePlan,
  calculateDeductions,
  getDeductionDescription,
  defaultDeductionConfig,
  formatMoney,
  type DeductionConfig,
} from '@/lib/reverseTaxPlanner';
import { Lightbulb, TrendingDown, AlertTriangle, CheckCircle2, Info } from 'lucide-react';

export function ReversePlannerSection() {
  const [totalIncome, setTotalIncome] = useState('');
  const [insurance, setInsurance] = useState('');
  const [deductionConfig, setDeductionConfig] = useState<DeductionConfig>(defaultDeductionConfig);
  const [result, setResult] = useState<ReturnType<typeof calculateReversePlan> | null>(null);
  const [activeTab, setActiveTab] = useState('simple');

  const handleCalculate = () => {
    const incomeNum = parseFloat(totalIncome) || 0;
    const insuranceNum = parseFloat(insurance) || 0;

    const planResult = calculateReversePlan(incomeNum, insuranceNum, deductionConfig);
    setResult(planResult);
  };

  const handleClear = () => {
    setTotalIncome('');
    setInsurance('');
    setDeductionConfig(defaultDeductionConfig);
    setResult(null);
  };

  const totalDeductions = calculateDeductions(deductionConfig);
  const deductionDescriptions = getDeductionDescription(deductionConfig);

  return (
    <section className="w-full bg-[#1a1a2e] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="bg-[#16213e] border-none shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl text-white flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-[#e94560]" />
              智能个税筹划
              <Badge className="bg-green-500 text-white text-xs">推荐</Badge>
            </CardTitle>
            <p className="text-white/60 text-sm mt-1">
              输入年度总收入，系统自动计算最优的工资和年终奖拆分方案，自动避开个税盲区
            </p>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-[#0f3460]">
                <TabsTrigger value="simple" className="data-[state=active]:bg-[#e94560] data-[state=active]:text-white">
                  快速筹划
                </TabsTrigger>
                <TabsTrigger value="advanced" className="data-[state=active]:bg-[#e94560] data-[state=active]:text-white">
                  高级设置
                </TabsTrigger>
              </TabsList>

              <TabsContent value="simple" className="mt-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* 输入区 */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="totalIncome" className="text-white/80">
                        年度总收入 (元)
                      </Label>
                      <Input
                        id="totalIncome"
                        type="number"
                        placeholder="请输入年度工资+年终奖总额"
                        value={totalIncome}
                        onChange={(e) => setTotalIncome(e.target.value)}
                        className="bg-[#0f3460] border-white/10 text-white placeholder:text-white/50 focus:border-[#e94560]"
                      />
                      <p className="text-white/50 text-xs">包括：年度工资 + 年终奖</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="insurance-simple" className="text-white/80">
                        三险一金等专项扣除 (元/年)
                      </Label>
                      <Input
                        id="insurance-simple"
                        type="number"
                        placeholder="请输入三险一金总额"
                        value={insurance}
                        onChange={(e) => setInsurance(e.target.value)}
                        className="bg-[#0f3460] border-white/10 text-white placeholder:text-white/50 focus:border-[#e94560]"
                      />
                    </div>

                    <div className="bg-[#0f3460] rounded-lg p-4">
                      <p className="text-white/80 text-sm font-medium mb-2">默认扣除配置</p>
                      <ul className="text-white/60 text-xs space-y-1">
                        <li>• 基本减除费用：¥60,000/年（5000元/月）</li>
                        <li>• 专项附加扣除：¥0（可在高级设置中配置）</li>
                      </ul>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        onClick={handleCalculate}
                        className="flex-1 bg-[#e94560] hover:bg-[#d63d56] text-white"
                      >
                        智能筹划
                      </Button>
                      <Button
                        onClick={handleClear}
                        variant="outline"
                        className="border-white/20 text-white hover:bg-white/10"
                      >
                        清空
                      </Button>
                    </div>
                  </div>

                  {/* 结果区 */}
                  <div>
                    {!result ? (
                      <div className="flex flex-col items-center justify-center py-12 text-white/50 bg-[#0f3460]/50 rounded-lg">
                        <Lightbulb className="w-16 h-16 mb-4 opacity-50" />
                        <p>输入收入信息后点击智能筹划</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* 最优方案 */}
                        <div className="bg-gradient-to-r from-green-500/20 to-green-500/10 border border-green-500/50 rounded-lg p-5">
                          <div className="flex items-center gap-2 mb-3">
                            <CheckCircle2 className="w-5 h-5 text-green-400" />
                            <span className="text-white font-semibold">最优筹划方案</span>
                          </div>
                          <div className="grid grid-cols-2 gap-4 mb-3">
                            <div>
                              <p className="text-white/60 text-sm">年度工资</p>
                              <p className="text-xl font-bold text-white">
                                ¥{formatMoney(result.optimalSalary)}
                              </p>
                            </div>
                            <div>
                              <p className="text-white/60 text-sm">年终奖</p>
                              <p className="text-xl font-bold text-white">
                                ¥{formatMoney(result.optimalBonus)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Badge className="bg-[#e94560] text-white">
                              {result.methodName}
                            </Badge>
                            {result.blindZoneAdjusted && (
                              <Badge variant="outline" className="border-[#e94560] text-[#e94560]">
                                已避开盲区
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* 税额信息 */}
                        <div className="grid grid-cols-1 gap-4">
                          <div className="bg-[#0f3460] rounded-lg p-4">
                            <p className="text-white/60 text-sm">应纳税额</p>
                            <p className="text-2xl font-bold text-[#e94560]">
                              ¥{formatMoney(result.totalTax)}
                            </p>
                          </div>
                        </div>

                        {/* 节税信息 */}
                        {result.savingsVsWorst > 0 && (
                          <div className="flex items-center gap-2 text-green-400 text-sm bg-green-500/10 rounded-lg p-3">
                            <TrendingDown className="w-4 h-4" />
                            <span>相比最差方案节税 ¥{formatMoney(result.savingsVsWorst)}</span>
                          </div>
                        )}

                        {/* 盲区警告 */}
                        {result.blindZoneAdjusted && (
                          <div className="bg-[#e94560]/20 border border-[#e94560]/50 rounded-lg p-3 flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 text-[#e94560] flex-shrink-0 mt-0.5" />
                            <p className="text-white/80 text-sm">{result.blindZoneMessage}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="advanced" className="mt-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* 左侧：收入和扣除配置 */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="totalIncome-adv" className="text-white/80">
                        年度总收入 (元)
                      </Label>
                      <Input
                        id="totalIncome-adv"
                        type="number"
                        placeholder="请输入年度工资+年终奖总额"
                        value={totalIncome}
                        onChange={(e) => setTotalIncome(e.target.value)}
                        className="bg-[#0f3460] border-white/10 text-white placeholder:text-white/50 focus:border-[#e94560]"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="insurance-adv" className="text-white/80">
                        三险一金等专项扣除 (元/年)
                      </Label>
                      <Input
                        id="insurance-adv"
                        type="number"
                        placeholder="请输入三险一金总额"
                        value={insurance}
                        onChange={(e) => setInsurance(e.target.value)}
                        className="bg-[#0f3460] border-white/10 text-white placeholder:text-white/50 focus:border-[#e94560]"
                      />
                    </div>

                    <div className="bg-[#0f3460] rounded-lg p-4">
                      <p className="text-white/80 text-sm font-medium mb-3">专项附加扣除配置</p>

                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label className="text-white/60 text-xs">子女教育 (个)</Label>
                            <Input
                              type="number"
                              min={0}
                              max={10}
                              value={deductionConfig.childrenEducation}
                              onChange={(e) =>
                                setDeductionConfig({
                                  ...deductionConfig,
                                  childrenEducation: parseInt(e.target.value) || 0,
                                })
                              }
                              className="bg-[#16213e] border-white/10 text-white h-8"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-white/60 text-xs">婴幼儿照护 (个)</Label>
                            <Input
                              type="number"
                              min={0}
                              max={10}
                              value={deductionConfig.childcare}
                              onChange={(e) =>
                                setDeductionConfig({
                                  ...deductionConfig,
                                  childcare: parseInt(e.target.value) || 0,
                                })
                              }
                              className="bg-[#16213e] border-white/10 text-white h-8"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <Label className="text-white/60 text-xs">继续教育</Label>
                          <Select
                            value={deductionConfig.continuingEducation}
                            onValueChange={(value: any) =>
                              setDeductionConfig({ ...deductionConfig, continuingEducation: value })
                            }
                          >
                            <SelectTrigger className="bg-[#16213e] border-white/10 text-white h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-[#16213e] border-white/20">
                              <SelectItem value="none">无</SelectItem>
                              <SelectItem value="degree">学历教育 (¥4,800/年)</SelectItem>
                              <SelectItem value="certificate">职业资格 (¥3,600/年)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-1">
                          <Label className="text-white/60 text-xs">住房租金</Label>
                          <Select
                            value={deductionConfig.housingRent}
                            onValueChange={(value: any) =>
                              setDeductionConfig({ ...deductionConfig, housingRent: value })
                            }
                          >
                            <SelectTrigger className="bg-[#16213e] border-white/10 text-white h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-[#16213e] border-white/20">
                              <SelectItem value="none">无/有房贷</SelectItem>
                              <SelectItem value="small">市辖区人口≤100万 (¥9,600/年)</SelectItem>
                              <SelectItem value="medium">市辖区人口&gt;100万 (¥13,200/年)</SelectItem>
                              <SelectItem value="large">直辖市/省会 (¥18,000/年)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-1">
                          <Label className="text-white/60 text-xs">赡养老人</Label>
                          <Select
                            value={deductionConfig.elderlyCare}
                            onValueChange={(value: any) =>
                              setDeductionConfig({ ...deductionConfig, elderlyCare: value })
                            }
                          >
                            <SelectTrigger className="bg-[#16213e] border-white/10 text-white h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-[#16213e] border-white/20">
                              <SelectItem value="none">无</SelectItem>
                              <SelectItem value="onlyChild">独生子女 (¥36,000/年)</SelectItem>
                              <SelectItem value="shared">非独生子女分摊 (¥18,000/年)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-1">
                          <Label className="text-white/60 text-xs">个人养老金 (元/年，最高¥12,000)</Label>
                          <Input
                            type="number"
                            min={0}
                            max={12000}
                            value={deductionConfig.personalPension}
                            onChange={(e) =>
                              setDeductionConfig({
                                ...deductionConfig,
                                personalPension: parseInt(e.target.value) || 0,
                              })
                            }
                            className="bg-[#16213e] border-white/10 text-white h-8"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        onClick={handleCalculate}
                        className="flex-1 bg-[#e94560] hover:bg-[#d63d56] text-white"
                      >
                        智能筹划
                      </Button>
                      <Button
                        onClick={handleClear}
                        variant="outline"
                        className="border-white/20 text-white hover:bg-white/10"
                      >
                        清空
                      </Button>
                    </div>
                  </div>

                  {/* 右侧：扣除明细和结果 */}
                  <div className="space-y-4">
                    {/* 扣除明细 */}
                    <div className="bg-[#0f3460] rounded-lg p-4">
                      <p className="text-white/80 text-sm font-medium mb-2">扣除明细</p>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-white/60">基本减除费用</span>
                          <span className="text-white">¥60,000</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-white/60">专项附加扣除</span>
                          <span className="text-white">¥{totalDeductions.toLocaleString()}</span>
                        </div>
                        {deductionDescriptions.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-white/10">
                            <p className="text-white/50 text-xs mb-1">专项附加扣除详情：</p>
                            {deductionDescriptions.map((desc, i) => (
                              <p key={i} className="text-white/60 text-xs">• {desc}</p>
                            ))}
                          </div>
                        )}
                        <div className="flex justify-between text-sm pt-2 border-t border-white/10 mt-2">
                          <span className="text-white font-medium">扣除合计</span>
                          <span className="text-green-400 font-medium">
                            ¥{(60000 + totalDeductions).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* 结果 */}
                    {result ? (
                      <div className="space-y-4">
                        <div className="bg-gradient-to-r from-green-500/20 to-green-500/10 border border-green-500/50 rounded-lg p-5">
                          <div className="flex items-center gap-2 mb-3">
                            <CheckCircle2 className="w-5 h-5 text-green-400" />
                            <span className="text-white font-semibold">最优筹划方案</span>
                          </div>
                          <div className="grid grid-cols-2 gap-4 mb-3">
                            <div>
                              <p className="text-white/60 text-sm">年度工资</p>
                              <p className="text-xl font-bold text-white">
                                ¥{formatMoney(result.optimalSalary)}
                              </p>
                            </div>
                            <div>
                              <p className="text-white/60 text-sm">年终奖</p>
                              <p className="text-xl font-bold text-white">
                                ¥{formatMoney(result.optimalBonus)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Badge className="bg-[#e94560] text-white">
                              {result.methodName}
                            </Badge>
                            {result.blindZoneAdjusted && (
                              <Badge variant="outline" className="border-[#e94560] text-[#e94560]">
                                已避开盲区
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                          <div className="bg-[#0f3460] rounded-lg p-4">
                            <p className="text-white/60 text-sm">应纳税额</p>
                            <p className="text-2xl font-bold text-[#e94560]">
                              ¥{formatMoney(result.totalTax)}
                            </p>
                          </div>
                        </div>

                        <div className="bg-[#0f3460] rounded-lg p-4">
                          <p className="text-white/80 text-sm font-medium mb-2">筹划详情</p>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span className="text-white/60">工资应纳税额</span>
                              <span className="text-white">¥{formatMoney(result.salaryTax)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-white/60">年终奖应纳税额</span>
                              <span className="text-white">¥{formatMoney(result.bonusTax)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-white/60">实际税负率</span>
                              <span className="text-white">{(result.effectiveTaxRate * 100).toFixed(2)}%</span>
                            </div>
                            {result.savingsVsWorst > 0 && (
                              <div className="flex justify-between pt-1 border-t border-white/10">
                                <span className="text-green-400">节税金额</span>
                                <span className="text-green-400">¥{formatMoney(result.savingsVsWorst)}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {result.blindZoneAdjusted && (
                          <div className="bg-[#e94560]/20 border border-[#e94560]/50 rounded-lg p-3 flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 text-[#e94560] flex-shrink-0 mt-0.5" />
                            <p className="text-white/80 text-sm">{result.blindZoneMessage}</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 text-white/50 bg-[#0f3460]/50 rounded-lg">
                        <Info className="w-12 h-12 mb-3 opacity-50" />
                        <p className="text-sm">配置扣除信息后点击智能筹划</p>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
