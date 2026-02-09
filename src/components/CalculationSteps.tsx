import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatMoney, type CalculationStep } from '@/lib/taxCalculator';
import { Calculator, FileText, Receipt } from 'lucide-react';


interface CalculationStepsProps {
  type: 'separate' | 'combined';
  calculation?: {
    salarySteps?: CalculationStep[];
    bonusSteps?: CalculationStep[];
    totalSteps?: CalculationStep[];
    steps?: CalculationStep[];
  };
}

export function CalculationSteps({ type, calculation }: CalculationStepsProps) {
  if (!calculation) {
    return null;
  }

  return (
    <Card className="bg-[#16213e] border-none shadow-xl mt-6">
      <CardHeader>
        <CardTitle className="text-xl text-white flex items-center gap-2">
          <Calculator className="w-5 h-5 text-[#e94560]" />
          应纳税额计算过程
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {type === 'separate' ? (
          // 单独计税的计算过程
          <div className="space-y-6">
            {/* 工资部分计算 */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-white font-medium">
                <FileText className="w-4 h-4 text-blue-400" />
                工资部分计算
              </div>
              <div className="space-y-2">
                {calculation.salarySteps?.map((step, index) => (
                  <div key={index} className="flex justify-between items-center py-2 px-3 bg-white/5 rounded">
                    <div className="text-white/80">
                      <div className="font-medium">{step.description}</div>
                      {step.formula && (
                        <div className="text-xs text-white/50 mt-1">{step.formula}</div>
                      )}
                    </div>
                    <div className="text-white font-semibold">
                      {step.value >= 0 ? `¥${formatMoney(step.value)}` : `-¥${formatMoney(Math.abs(step.value))}`}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 分隔线 */}
            <div className="h-px bg-white/10 w-full"></div>

            {/* 年终奖部分计算 */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-white font-medium">
                <Receipt className="w-4 h-4 text-green-400" />
                年终奖部分计算
              </div>
              <div className="space-y-2">
                {calculation.bonusSteps?.map((step, index) => (
                  <div key={index} className="flex justify-between items-center py-2 px-3 bg-white/5 rounded">
                    <div className="text-white/80">
                      <div className="font-medium">{step.description}</div>
                      {step.formula && (
                        <div className="text-xs text-white/50 mt-1">{step.formula}</div>
                      )}
                    </div>
                    <div className="text-white font-semibold">
                      {step.value >= 0 ? `¥${formatMoney(step.value)}` : `-¥${formatMoney(Math.abs(step.value))}`}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 分隔线 */}
            <div className="h-px bg-white/10 w-full"></div>

            {/* 总税额计算 */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-white font-medium">
                <Calculator className="w-4 h-4 text-[#e94560]" />
                总税额计算
              </div>
              <div className="space-y-2">
                {calculation.totalSteps?.map((step, index) => (
                  <div
                    key={index}
                    className={`flex justify-between items-center py-2 px-3 rounded ${
                      step.description.includes('总应纳税额')
                        ? 'bg-[#e94560]/20 border border-[#e94560]/50'
                        : 'bg-white/5'
                    }`}
                  >
                    <div className="text-white/80">
                      <div className="font-medium">{step.description}</div>
                      {step.formula && (
                        <div className="text-xs text-white/50 mt-1">{step.formula}</div>
                      )}
                    </div>
                    <div className={`font-semibold ${
                      step.description.includes('总应纳税额')
                        ? 'text-[#e94560]'
                        : 'text-white'
                    }`}>
                      {step.value >= 0 ? `¥${formatMoney(step.value)}` : `-¥${formatMoney(Math.abs(step.value))}`}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          // 合并计税的计算过程
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white font-medium mb-4">
              <Calculator className="w-4 h-4 text-[#e94560]" />
              合并计税计算过程
            </div>
            <div className="space-y-2">
              {calculation.steps?.map((step, index) => (
                <div
                  key={index}
                  className={`flex justify-between items-center py-2 px-3 rounded ${
                    step.description.includes('应纳税额')
                      ? 'bg-[#e94560]/20 border border-[#e94560]/50'
                      : 'bg-white/5'
                  }`}
                >
                  <div className="text-white/80">
                    <div className="font-medium">{step.description}</div>
                    {step.formula && (
                      <div className="text-xs text-white/50 mt-1">{step.formula}</div>
                    )}
                  </div>
                  <div className={`font-semibold ${
                    step.description.includes('应纳税额')
                      ? 'text-[#e94560]'
                      : 'text-white'
                  }`}>
                    {step.value >= 0 ? `¥${formatMoney(step.value)}` : `-¥${formatMoney(Math.abs(step.value))}`}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 计算说明 */}
        <div className="mt-4 pt-4 border-t border-white/10">
          <p className="text-white/60 text-sm">
            {type === 'separate'
              ? '单独计税：年终奖单独按照月度税率表计算，工资部分按综合所得税率表计算'
              : '合并计税：年终奖并入年度综合所得，统一按照综合所得税率表计算'
            }
          </p>
        </div>
      </CardContent>
    </Card>
  );
}