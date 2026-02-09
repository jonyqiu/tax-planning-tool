import { Calculator, Sparkles, Shield, TrendingDown } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="w-full bg-[#1a1a2e] py-16 md:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Calculator className="w-12 h-12 text-[#e94560]" />
            <h1 className="text-4xl md:text-5xl font-bold text-white font-['Poppins']">
              个税筹划工具
            </h1>
          </div>
          <p className="text-lg md:text-xl text-white/80 max-w-3xl mx-auto leading-relaxed">
            智能计算年终奖最优计税方案，自动避开
            <span className="text-[#e94560] font-semibold">个税盲区</span>
            ，最大化税后收入
          </p>
          
          {/* 核心功能标签 */}
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <div className="flex items-center gap-2 bg-[#16213e] px-4 py-2 rounded-full border border-green-500/30">
              <Sparkles className="w-4 h-4 text-green-400" />
              <span className="text-white/80 text-sm">智能反向筹划</span>
            </div>
            <div className="flex items-center gap-2 bg-[#16213e] px-4 py-2 rounded-full border border-[#e94560]/30">
              <Shield className="w-4 h-4 text-[#e94560]" />
              <span className="text-white/80 text-sm">自动避开盲区</span>
            </div>
            <div className="flex items-center gap-2 bg-[#16213e] px-4 py-2 rounded-full border border-blue-400/30">
              <TrendingDown className="w-4 h-4 text-blue-400" />
              <span className="text-white/80 text-sm">税负最小化</span>
            </div>
          </div>

          {/* 功能说明 */}
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-[#16213e] rounded-xl p-5 text-left border border-white/5 hover:border-[#e94560]/30 transition-colors">
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center mb-3">
                <Sparkles className="w-5 h-5 text-green-400" />
              </div>
              <h3 className="text-white font-semibold mb-2">智能反向筹划</h3>
              <p className="text-white/60 text-sm">输入年度总收入，系统自动拆分最优工资和年终奖比例</p>
            </div>
            <div className="bg-[#16213e] rounded-xl p-5 text-left border border-white/5 hover:border-[#e94560]/30 transition-colors">
              <div className="w-10 h-10 bg-[#e94560]/20 rounded-lg flex items-center justify-center mb-3">
                <Shield className="w-5 h-5 text-[#e94560]" />
              </div>
              <h3 className="text-white font-semibold mb-2">盲区智能避让</h3>
              <p className="text-white/60 text-sm">自动识别6大个税盲区，给出调整建议避免多缴税款</p>
            </div>
            <div className="bg-[#16213e] rounded-xl p-5 text-left border border-white/5 hover:border-[#e94560]/30 transition-colors">
              <div className="w-10 h-10 bg-blue-400/20 rounded-lg flex items-center justify-center mb-3">
                <Calculator className="w-5 h-5 text-blue-400" />
              </div>
              <h3 className="text-white font-semibold mb-2">专项附加扣除</h3>
              <p className="text-white/60 text-sm">支持7项专项附加扣除配置，精准计算应纳税额</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
