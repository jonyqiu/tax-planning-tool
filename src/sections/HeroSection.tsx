import { Calculator, Split, Calendar, FileText, TrendingDown } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="w-full bg-gradient-to-b from-[#1a1a2e] to-[#16213e] py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-[#e94560] to-[#ff6b6b] rounded-2xl flex items-center justify-center shadow-lg shadow-[#e94560]/20">
              <Calculator className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white">
              个税筹划工具
            </h1>
          </div>
          <p className="text-lg md:text-xl text-white/70 max-w-3xl mx-auto leading-relaxed">
            三种场景智能计算，自动避开
            <span className="text-[#e94560] font-semibold">个税盲区</span>
            ，最大化税后收入
          </p>

          {/* 三大场景标签 */}
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
            <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-xl p-5 text-left border border-emerald-500/30 hover:border-emerald-500/50 transition-all hover:scale-[1.02]">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center mb-4">
                <Split className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">智能拆分方案</h3>
              <p className="text-white/60 text-sm leading-relaxed">输入税前年度总收入，系统自动计算最优工资和年终奖拆分，自动避开个税盲区</p>
            </div>
            <div className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-xl p-5 text-left border border-blue-500/30 hover:border-blue-500/50 transition-all hover:scale-[1.02]">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">年末优化方案</h3>
              <p className="text-white/60 text-sm leading-relaxed">前11个月工资已确定，优化12月工资和年终奖的计税方式，寻找最优分配</p>
            </div>
            <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-xl p-5 text-left border border-amber-500/30 hover:border-amber-500/50 transition-all hover:scale-[1.02]">
              <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-amber-400" />
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">方案对比</h3>
              <p className="text-white/60 text-sm leading-relaxed">已确定工资和年终奖，计算年终奖单独计税和并入综合所得的税收差异</p>
            </div>
          </div>

          {/* 核心优势 */}
          <div className="mt-12 flex flex-wrap justify-center gap-4">
            <div className="flex items-center gap-2 bg-[#16213e] px-5 py-2.5 rounded-full border border-white/10">
              <TrendingDown className="w-4 h-4 text-emerald-400" />
              <span className="text-white/80 text-sm">税负最小化</span>
            </div>
            <div className="flex items-center gap-2 bg-[#16213e] px-5 py-2.5 rounded-full border border-white/10">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-white/80 text-sm">实时计算</span>
            </div>
            <div className="flex items-center gap-2 bg-[#16213e] px-5 py-2.5 rounded-full border border-white/10">
              <span className="text-white/80 text-sm">过程透明</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
