export function FooterSection() {
  return (
    <footer className="w-full bg-[#0f3460] py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* 政策依据 */}
          <div>
            <h4 className="text-white font-semibold mb-3">政策依据</h4>
            <ul className="text-white/60 text-sm space-y-2">
              <li>• 《中华人民共和国个人所得税法》</li>
              <li>• 财政部 税务总局公告2023年第30号</li>
              <li>• 国税发〔2005〕9号</li>
              <li>• 财税〔2018〕164号</li>
            </ul>
          </div>
          
          {/* 扣除标准 */}
          <div>
            <h4 className="text-white font-semibold mb-3">扣除标准 (2024-2025)</h4>
            <ul className="text-white/60 text-sm space-y-2">
              <li>• 基本减除费用：¥60,000/年</li>
              <li>• 子女教育：¥24,000/年/每个</li>
              <li>• 赡养老人：¥36,000/年(独生子女)</li>
              <li>• 住房租金：¥9,600-18,000/年</li>
            </ul>
          </div>
          
          {/* 说明 */}
          <div>
            <h4 className="text-white font-semibold mb-3">使用说明</h4>
            <ul className="text-white/60 text-sm space-y-2">
              <li>• 年终奖政策执行至2027年12月31日</li>
              <li>• 一个纳税年度内只能使用一次单独计税</li>
              <li>• 本工具仅供参考</li>
              <li>• 实际纳税以税务机关核定为准</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/10 pt-6 text-center">
          <p className="text-white/60 text-sm">
            © 2025 个税筹划工具 - 基于中国个人所得税法计算
          </p>
          <p className="text-white/40 text-xs mt-2">
            本工具仅供参考，实际纳税以税务机关核定为准 | 政策有效期至2027年12月31日
          </p>
        </div>
      </div>
    </footer>
  );
}
