export function FooterSection() {
  return (
    <footer className="border-t border-white/5 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* 政策依据 */}
          <div>
            <h4 className="text-white/50 text-sm font-medium mb-3">政策依据</h4>
            <ul className="text-white/30 text-xs space-y-1.5">
              <li>《中华人民共和国个人所得税法》</li>
              <li>财政部 税务总局公告2023年第30号</li>
              <li>年终奖优惠政策延续至2027年12月31日</li>
            </ul>
          </div>

          {/* 扣除标准 */}
          <div>
            <h4 className="text-white/50 text-sm font-medium mb-3">扣除标准</h4>
            <ul className="text-white/30 text-xs space-y-1.5">
              <li>基本减除费用：¥60,000/年</li>
              <li>子女教育：¥24,000/年/每个子女</li>
              <li>赡养老人：¥36,000/年（独生子女）</li>
              <li>住房租金：¥9,600-18,000/年</li>
            </ul>
          </div>

          {/* 说明 */}
          <div>
            <h4 className="text-white/50 text-sm font-medium mb-3">使用说明</h4>
            <ul className="text-white/30 text-xs space-y-1.5">
              <li>年终奖一年只能使用一次单独计税</li>
              <li>计算结果仅供参考</li>
              <li>实际纳税以税务机关核定为准</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 pt-6 text-center">
          <p className="text-white/20 text-xs">
            © 2024 个税筹划工具 · 计算结果仅供参考，具体以税务部门为准
          </p>
        </div>
      </div>
    </footer>
  );
}
