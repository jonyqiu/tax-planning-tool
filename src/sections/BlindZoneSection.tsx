import { AlertTriangle, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { taxBlindZones, formatMoney } from '@/lib/taxCalculator';

export function BlindZoneSection() {
  return (
    <section className="w-full bg-[#1a1a2e] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="bg-[#0f3460] border-none shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-[#e94560]" />
              个税盲区警示
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-[#e94560]/10 border border-[#e94560]/30 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-[#e94560] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-white/90 text-sm">
                    <strong className="text-[#e94560]">什么是个税盲区？</strong>
                  </p>
                  <p className="text-white/70 text-sm mt-1">
                    年终奖处于以下区间时，多发1元可能导致多缴数千元税款！这是因为年终奖单独计税时，税率跳档造成的税负突变。
                  </p>
                  <p className="text-white/70 text-sm mt-2">
                    例如：年终奖发 <span className="text-green-400">¥36,000</span>，税后到手 <span className="text-green-400">¥34,920</span>；
                    发 <span className="text-[#e94560]">¥36,001</span>，税后只剩 <span className="text-[#e94560]">¥32,610</span>！
                    <span className="text-[#e94560] font-semibold">多发1元，反而少拿2,310元！</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {taxBlindZones.map((zone, index) => (
                <div
                  key={index}
                  className="bg-[#16213e] rounded-lg p-4 hover:translate-y-[-2px] transition-transform duration-300 border border-white/5 hover:border-[#e94560]/30"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[#e94560] font-semibold">
                      盲区 {index + 1}
                    </span>
                    <span className="text-white/60 text-xs bg-[#e94560]/20 px-2 py-1 rounded">
                      多缴 ¥{formatMoney(zone.loss)}
                    </span>
                  </div>
                  <div className="text-white">
                    <span className="text-lg font-bold">
                      {formatMoney(zone.min)}
                    </span>
                    <span className="text-white/50 mx-2">~</span>
                    <span className="text-lg font-bold">
                      {formatMoney(zone.max)}
                    </span>
                  </div>
                  <p className="text-white/60 text-sm mt-2">
                    建议发放 <span className="text-green-400">{formatMoney(zone.min)}</span> 元
                    或 <span className="text-green-400">{Math.ceil(zone.max).toLocaleString()}</span> 元以上
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#16213e] rounded-lg p-4">
                <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                  如何避免盲区？
                </h4>
                <ul className="text-white/70 text-sm space-y-1">
                  <li>• 年终奖尽量控制在盲区下限金额</li>
                  <li>• 或增加至盲区上限以上</li>
                  <li>• 使用本工具的「智能筹划」功能自动避让</li>
                  <li>• 将超出部分并入工资发放</li>
                </ul>
              </div>
              <div className="bg-[#16213e] rounded-lg p-4">
                <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                  盲区产生原因
                </h4>
                <ul className="text-white/70 text-sm space-y-1">
                  <li>• 年终奖单独计税使用月度税率表</li>
                  <li>• 税率跳档时税负突变</li>
                  <li>• 速算扣除数只扣一次而非12次</li>
                  <li>• 这是政策设计的历史遗留问题</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
