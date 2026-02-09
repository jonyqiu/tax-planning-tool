import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { calculateOptimalPlan, formatMoney } from '@/lib/taxCalculator';

interface ComparisonTableProps {
  result: ReturnType<typeof calculateOptimalPlan> | null;
}

export function ComparisonTable({ result }: ComparisonTableProps) {
  if (!result) return null;

  const rows = [
    {
      name: '方案一：单独计税',
      type: 'separate' as const,
      bonusMethod: '单独计税',
      salaryTax: result.separate.salaryTax,
      bonusTax: result.separate.bonusTax,
      totalTax: result.separate.totalTax,
      afterTaxIncome: result.separate.afterTaxIncome,
    },
    {
      name: '方案二：合并计税',
      type: 'combined' as const,
      bonusMethod: '并入综合所得',
      salaryTax: result.combined.tax,
      bonusTax: 0,
      totalTax: result.combined.totalTax,
      afterTaxIncome: result.combined.afterTaxIncome,
    },
  ];

  return (
    <section className="w-full bg-[#1a1a2e] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="bg-[#16213e] border-none shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl text-white">
              详细方案对比
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10 hover:bg-transparent">
                    <TableHead className="text-white font-semibold">方案</TableHead>
                    <TableHead className="text-white font-semibold">年终奖计税方式</TableHead>
                    <TableHead className="text-white font-semibold text-right">工资应纳税额</TableHead>
                    <TableHead className="text-white font-semibold text-right">年终奖应纳税额</TableHead>
                    <TableHead className="text-white font-semibold text-right">总应纳税额</TableHead>
                    <TableHead className="text-white font-semibold text-center">节税效果</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row) => {
                    const isOptimal = result.optimal.type === row.type;
                    return (
                      <TableRow
                        key={row.type}
                        className={`border-white/10 ${
                          isOptimal ? 'bg-[#e94560]/10' : 'hover:bg-white/5'
                        }`}
                      >
                        <TableCell className="text-white font-medium">
                          <div className="flex items-center gap-2">
                            {row.name}
                            {isOptimal && (
                              <Badge className="bg-green-500 text-white text-xs">
                                最优
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-white/80">{row.bonusMethod}</TableCell>
                        <TableCell className="text-white text-right">
                          ¥{formatMoney(row.salaryTax)}
                        </TableCell>
                        <TableCell className="text-white text-right">
                          {row.bonusTax > 0 ? `¥${formatMoney(row.bonusTax)}` : '-'}
                        </TableCell>
                        <TableCell className="text-[#e94560] font-semibold text-right">
                          ¥{formatMoney(row.totalTax)}
                        </TableCell>
                        <TableCell className="text-center">
                          {isOptimal ? (
                            <span className="text-green-400 text-sm">
                              节税 ¥{formatMoney(result.taxSaving)}
                            </span>
                          ) : (
                            <span className="text-white/40 text-sm">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* 计算说明 */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#0f3460] rounded-lg p-4">
                <h4 className="text-white font-semibold mb-2">单独计税计算说明</h4>
                <ul className="text-white/70 text-sm space-y-1">
                  <li>• 年终奖 ÷ 12 = 月均奖金，查月度税率表</li>
                  <li>• 年终奖税额 = 年终奖 × 税率 - 速算扣除数</li>
                  <li>• 工资部分按综合所得税率表单独计算</li>
                  <li>• 总税额 = 年终奖税额 + 工资税额</li>
                </ul>
              </div>
              <div className="bg-[#0f3460] rounded-lg p-4">
                <h4 className="text-white font-semibold mb-2">合并计税计算说明</h4>
                <ul className="text-white/70 text-sm space-y-1">
                  <li>• 综合所得 = 年度工资 + 年终奖</li>
                  <li>• 应纳税所得额 = 综合所得 - 6万 - 专项扣除</li>
                  <li>• 查综合所得税率表计算税额</li>
                  <li>• 总税额 = 应纳税所得额 × 税率 - 速算扣除数</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
