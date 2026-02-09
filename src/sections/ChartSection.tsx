import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  ReferenceDot,
} from 'recharts';
import { generateChartData, formatMoney } from '@/lib/taxCalculator';

interface ChartSectionProps {
  salary: number;
  bonus: number;
  insurance: number;
  deduction: number;
}

export function ChartSection({ salary, bonus, insurance, deduction }: ChartSectionProps) {
  const chartData = useMemo(() => {
    if (!salary && !bonus) return [];
    return generateChartData(salary, bonus, insurance, deduction);
  }, [salary, bonus, insurance, deduction]);

  const minPoint = useMemo(() => {
    if (chartData.length === 0) return null;
    return chartData.reduce((min, curr) =>
      curr.totalTax < min.totalTax ? curr : min
    );
  }, [chartData]);

  if (chartData.length === 0) {
    return null;
  }

  return (
    <section className="w-full bg-[#1a1a2e] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="bg-[#16213e] border-none shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl text-white">
              不同计税方案对比图
            </CardTitle>
            <p className="text-white/60 text-sm">
              X轴：年终奖单独计税占比 | Y轴：应纳税额
            </p>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                  <defs>
                    <linearGradient id="colorTax" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#e94560" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#e94560" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.1)"
                  />
                  <XAxis
                    dataKey="percent"
                    stroke="rgba(255,255,255,0.5)"
                    tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
                    tickFormatter={(value) => `${value}%`}
                    label={{
                      value: '单独计税占比',
                      position: 'insideBottom',
                      offset: -10,
                      fill: 'rgba(255,255,255,0.6)',
                    }}
                  />
                  <YAxis
                    stroke="rgba(255,255,255,0.5)"
                    tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
                    tickFormatter={(value) => `¥${(value / 1000).toFixed(0)}k`}
                    label={{
                      value: '应纳税额',
                      angle: -90,
                      position: 'insideLeft',
                      fill: 'rgba(255,255,255,0.6)',
                    }}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-[#0f3460] border border-white/20 rounded-lg p-3 shadow-xl">
                            <p className="text-white font-semibold mb-2">
                              单独计税占比: {label}%
                            </p>
                            <p className="text-[#e94560]">
                              应纳税额: ¥{formatMoney(data.totalTax)}
                            </p>
                            <p className="text-white/60 text-sm mt-1">
                              年终奖: ¥{formatMoney(data.separateBonus)}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="totalTax"
                    stroke="none"
                    fill="url(#colorTax)"
                  />
                  <Line
                    type="monotone"
                    dataKey="totalTax"
                    stroke="#e94560"
                    strokeWidth={3}
                    dot={{ fill: '#e94560', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
                  />
                  {minPoint && (
                    <ReferenceDot
                      x={minPoint.percent}
                      y={minPoint.totalTax}
                      r={8}
                      fill="#22c55e"
                      stroke="#fff"
                      strokeWidth={2}
                      label={{
                        value: '最优',
                        fill: '#22c55e',
                        fontSize: 12,
                        position: 'top',
                      }}
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
            {minPoint && (
              <div className="mt-4 flex items-center justify-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#e94560]"></span>
                  <span className="text-white/70">应纳税额曲线</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-green-500 border-2 border-white"></span>
                  <span className="text-white/70">最优方案点</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
