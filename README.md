# 个税筹划工具

一个现代化的个人所得税筹划工具，帮助用户优化工资与年终奖的税务规划。

## ✨ 功能特点

- **双方案对比**：单独计税 vs 合并计税
- **智能推荐**：自动计算最优税务方案
- **个税盲区检测**：自动识别年终奖个税盲区并提供调整建议
- **反向筹划**：从总收入自动拆分最优工资与年终奖比例
- **批量处理**：支持Excel导入导出，批量计算员工个税
- **可视化图表**：展示不同计税方案下的税额变化
- **详细计算过程**：展示应纳税额每一步的计算过程

## 📋 最近更新

### 版本 1.1.0
- ✅ **移除税后收入显示**：所有界面不再显示税后收入
- ✅ **新增计算过程显示**：详细展示应纳税额的计算步骤
- ✅ **优化界面布局**：调整显示结构，突出应纳税额
- ✅ **修复构建配置**：支持直接打开 `index.html` 文件

## 🚀 快速开始

### 环境要求
- Node.js 18+
- npm 9+

### 安装依赖
```bash
npm install
```

### 启动开发服务器
```bash
npm run dev
```
访问 http://localhost:5173

### 构建生产版本
```bash
npm run build
```

## 📁 项目结构

```
├── src/
│   ├── components/     # 可复用组件
│   ├── sections/       # 页面区块组件
│   ├── lib/           # 核心计算逻辑
│   └── App.tsx        # 主应用组件
├── public/            # 静态资源
└── dist/              # 构建输出
```

## 🔧 核心计算逻辑

### 单独计税
1. 工资部分按综合所得税率表计算
2. 年终奖按月度税率表单独计算
3. 总税额 = 工资税额 + 年终奖税额

### 合并计税
1. 综合所得 = 工资 + 年终奖
2. 应纳税所得额 = 综合所得 - 60,000 - 专项扣除
3. 按综合所得税率表计算税额

## 📊 税率表

### 综合所得税率表（年度）
| 级数 | 累计预扣预缴应纳税所得额 | 税率 | 速算扣除数 |
|------|--------------------------|------|------------|
| 1    | 不超过36,000元           | 3%   | 0          |
| 2    | 超过36,000元至144,000元  | 10%  | 2,520      |
| 3    | 超过144,000元至300,000元 | 20%  | 16,920     |
| 4    | 超过300,000元至420,000元 | 25%  | 31,920     |
| 5    | 超过420,000元至660,000元 | 30%  | 52,920     |
| 6    | 超过660,000元至960,000元 | 35%  | 85,920     |
| 7    | 超过960,000元           | 45%  | 181,920    |

## 🚀 部署到GitHub Pages

### 方法一：使用GitHub CLI（推荐）

1. **登录GitHub CLI**
```bash
gh auth login
```

2. **创建新仓库**
```bash
gh repo create tax-planning-tool --public --push --source=. --remote=origin
```

3. **推送到GitHub**
```bash
git push -u origin main
```

### 方法二：手动创建仓库

1. **在GitHub.com创建新仓库**：`tax-planning-tool`
2. **添加远程仓库**
```bash
git remote add origin https://github.com/你的用户名/tax-planning-tool.git
```
3. **推送代码**
```bash
git push -u origin main
```

### 方法三：使用GitHub Pages自动部署

1. **安装`gh-pages`包**
```bash
npm install --save-dev gh-pages
```

2. **在`package.json`中添加脚本**
```json
"scripts": {
  "predeploy": "npm run build",
  "deploy": "gh-pages -d dist"
}
```

3. **修改`vite.config.ts`**
```typescript
base: '/tax-planning-tool/',
```

4. **部署到GitHub Pages**
```bash
npm run deploy
```

## 📱 使用说明

1. **输入收入信息**：填写年度工资、年终奖、三险一金、专项附加扣除
2. **计算最优方案**：系统自动推荐最优计税方式
3. **查看计算过程**：查看详细的应纳税额计算步骤
4. **导出结果**：支持Excel格式导出计算结果

## 🔍 技术栈

- **前端框架**：React 19 + TypeScript
- **构建工具**：Vite 7
- **样式框架**：Tailwind CSS + shadcn/ui
- **图表库**：Recharts
- **表格处理**：SheetJS (xlsx)

## 📄 许可证

MIT License

## 👥 贡献者

- **Claude Sonnet 4.5** - 核心功能开发与优化

## 📞 支持

如有问题或建议，请提交GitHub Issue。
