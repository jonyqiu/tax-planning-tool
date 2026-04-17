import { AlertTriangle } from 'lucide-react';
import { taxBlindZones, formatMoney } from '@/lib/taxCalculator';

export function BlindZoneSection() {
  return (
    <section className="min-h-screen py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-white mb-3">年终奖个税盲区表</h2>
          <p className="text-white/50">年终奖处于以下区间时，多发1元可能导致多缴数千元税款</p>
        </div>

        {/* Warning Banner */}
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h3 className="text-amber-400 font-semibold text-lg mb-2">什么是年终奖盲区？</h3>
              <p className="text-white/70 leading-relaxed">
                年终奖单独计税时，税率跳档会造成税负突变。由于速算扣除数只扣一次而非12次，在每个税率升档的临界点，都会出现个税的跳跃式上升和税后收入的跳跃式下降。
              </p>
              <p className="text-white/70 leading-relaxed mt-3">
                例如：年终奖 <span className="text-emerald-400 font-semibold">¥36,000</span> 税后到手 <span className="text-emerald-400 font-semibold">¥34,920</span>；
                发 <span className="text-amber-400 font-semibold">¥36,001</span> 税后只剩 <span className="text-amber-400 font-semibold">¥32,610</span>。
                <span className="text-amber-400 font-semibold">多发1元，少拿2,310元！</span>
              </p>
            </div>
          </div>
        </div>

        {/* Blind Zones Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {taxBlindZones.map((zone, index) => (
            <div
              key={index}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-amber-500/30 transition-all group"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-amber-400 font-semibold">盲区 {index + 1}</span>
                <span className="text-xs px-3 py-1 bg-amber-500/10 text-amber-400 rounded-full">
                  损失 ¥{formatMoney(zone.loss)}
                </span>
              </div>

              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-2xl font-bold text-white">
                  {formatMoney(zone.min)}
                </span>
                <span className="text-white/40">~</span>
                <span className="text-2xl font-bold text-white">
                  {formatMoney(zone.max)}
                </span>
              </div>

              <div className="text-sm text-white/50">
                建议发放 <span className="text-emerald-400 font-medium">{formatMoney(zone.min)}</span> 元
                或 <span className="text-emerald-400 font-medium">{Math.ceil(zone.max).toLocaleString()}</span> 元以上
              </div>
            </div>
          ))}
        </div>

        {/* Explanation */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
              <span className="w-3 h-3 bg-emerald-400 rounded-full"></span>
              如何避免盲区？
            </h4>
            <ul className="space-y-3 text-white/60 text-sm">
              <li className="flex items-start gap-2">
                <ChevronRight className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                年终奖尽量控制在盲区下限金额
              </li>
              <li className="flex items-start gap-2">
                <ChevronRight className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                或增加至盲区上限以上
              </li>
              <li className="flex items-start gap-2">
                <ChevronRight className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                将超出部分并入工资发放
              </li>
              <li className="flex items-start gap-2">
                <ChevronRight className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                使用「智能拆分」功能自动避让
              </li>
            </ul>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
              <span className="w-3 h-3 bg-blue-400 rounded-full"></span>
              盲区产生原因
            </h4>
            <ul className="space-y-3 text-white/60 text-sm">
              <li className="flex items-start gap-2">
                <ChevronRight className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                年终奖单独计税使用月度税率表
              </li>
              <li className="flex items-start gap-2">
                <ChevronRight className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                税率跳档时税负突变
              </li>
              <li className="flex items-start gap-2">
                <ChevronRight className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                速算扣除数只扣一次而非12次
              </li>
              <li className="flex items-start gap-2">
                <ChevronRight className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                优惠政策延续至2027年12月31日
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function ChevronRight(props: { className?: string }) {
  return (
    <svg className={props.className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
}
