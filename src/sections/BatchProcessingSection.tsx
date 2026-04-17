import { useState, useRef } from 'react';
import { Upload, Download, FileSpreadsheet, AlertTriangle, X, Split, Calendar, FileText } from 'lucide-react';
import * as XLSX from 'xlsx';
import {
  batchCalculate,
  batchCalculateSplit,
  batchCalculateYearEnd,
  formatMoney,
  type EmployeeData,
  type BatchResult,
  type SplitEmployeeData,
  type SplitBatchResult,
  type YearEndEmployeeData,
  type YearEndBatchResult,
} from '@/lib/taxCalculator';

type BatchScenarioType = 'split' | 'yearend' | 'compare';

const batchScenarios = [
  { type: 'split' as BatchScenarioType, title: '智能拆分', icon: Split, color: 'emerald' },
  { type: 'yearend' as BatchScenarioType, title: '年末优化', icon: Calendar, color: 'blue' },
  { type: 'compare' as BatchScenarioType, title: '方案对比', icon: FileText, color: 'amber' },
];

export function BatchProcessingSection() {
  const [selectedScenario, setSelectedScenario] = useState<BatchScenarioType>('split');
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<BatchResult[] | SplitBatchResult[] | YearEndBatchResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentScenario = batchScenarios.find(s => s.type === selectedScenario)!;
  const colorMap = {
    emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', btn: 'bg-emerald-500 hover:bg-emerald-600' },
    blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400', btn: 'bg-blue-500 hover:bg-blue-600' },
    amber: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400', btn: 'bg-amber-500 hover:bg-amber-600' },
  };
  const colors = colorMap[currentScenario.color as keyof typeof colorMap];

  const downloadTemplate = () => {
    let template: any[] = [];
    let filename = '';
    switch (selectedScenario) {
      case 'split':
        template = [{ 姓名: '张三', 税前年度总收入: 300000, 三险一金: 24000, 专项附加扣除: 48000 }];
        filename = '智能拆分模板.xlsx';
        break;
      case 'yearend':
        template = [{ 姓名: '张三', 前11个月工资: 220000, '12月工资': 20000, 年终奖: 50000, 三险一金: 24000, 专项附加扣除: 48000 }];
        filename = '年末优化模板.xlsx';
        break;
      case 'compare':
        template = [{ 姓名: '张三', 年度工资: 240000, 年终奖: 36000, 三险一金: 24000, 专项附加扣除: 48000 }];
        filename = '方案对比模板.xlsx';
        break;
    }
    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '模板');
    XLSX.writeFile(wb, filename);
  };

  const processFile = async (file: File) => {
    setError(null);
    setResults(null);
    setIsProcessing(true);
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];

      if (jsonData.length === 0) throw new Error('Excel文件为空');

      switch (selectedScenario) {
        case 'split': {
          const employees: SplitEmployeeData[] = jsonData.map((row) => ({
            name: String(row['姓名'] || ''),
            totalIncome: Number(row['税前年度总收入']) || 0,
            insurance: Number(row['三险一金']) || 0,
            deduction: Number(row['专项附加扣除']) || 0,
          }));
          setResults(batchCalculateSplit(employees));
          break;
        }
        case 'yearend': {
          const employees: YearEndEmployeeData[] = jsonData.map((row) => ({
            name: String(row['姓名'] || ''),
            first11MonthsSalary: Number(row['前11个月工资']) || 0,
            decemberSalary: Number(row['12月工资']) || 0,
            yearEndBonus: Number(row['年终奖']) || 0,
            insurance: Number(row['三险一金']) || 0,
            deduction: Number(row['专项附加扣除']) || 0,
          }));
          setResults(batchCalculateYearEnd(employees));
          break;
        }
        case 'compare': {
          const employees: EmployeeData[] = jsonData.map((row) => ({
            name: String(row['姓名'] || ''),
            salary: Number(row['年度工资']) || 0,
            bonus: Number(row['年终奖']) || 0,
            insurance: Number(row['三险一金']) || 0,
            deduction: Number(row['专项附加扣除']) || 0,
          }));
          setResults(batchCalculate(employees));
          break;
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '文件处理失败');
    } finally {
      setIsProcessing(false);
    }
  };

  const exportResults = () => {
    if (!results) return;
    let exportData: any[] = [];
    let filename = '';

    if (selectedScenario === 'split') {
      const splitResults = results as SplitBatchResult[];
      exportData = splitResults.map((r) => ({
        姓名: r.name, 税前年度总收入: r.totalIncome, 三险一金: r.insurance,
        专项附加扣除: r.deduction, 建议工资: r.optimalSalary, 建议年终奖: r.optimalBonus,
        计税方式: r.planName, 总应纳税额: r.totalTax, 税后收入: r.afterTaxIncome,
      }));
      filename = '智能拆分计算结果.xlsx';
    } else if (selectedScenario === 'yearend') {
      const yearEndResults = results as YearEndBatchResult[];
      exportData = yearEndResults.map((r) => ({
        姓名: r.name, 前11个月工资: r.first11MonthsSalary, '12月工资': r.decemberSalary,
        年终奖: r.yearEndBonus, 三险一金: r.insurance, 专项附加扣除: r.deduction,
        最优方案: r.optimalType, 总应纳税额: r.totalTax, 税后收入: r.afterTaxIncome, 节税金额: r.taxSaving,
      }));
      filename = '年末优化计算结果.xlsx';
    } else {
      const compareResults = results as BatchResult[];
      exportData = compareResults.map((r) => ({
        姓名: r.name, 年度工资: r.salary, 年终奖: r.bonus, 三险一金: r.insurance,
        专项附加扣除: r.deduction, 最优方案: r.optimalType, 总应纳税额: r.totalTax,
        税后收入: r.afterTaxIncome, 节税金额: r.taxSaving, 盲区警告: r.blindZoneWarning || '',
      }));
      filename = '方案对比计算结果.xlsx';
    }

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '计算结果');
    XLSX.writeFile(wb, filename);
  };

  return (
    <section className="min-h-screen py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-white mb-3">批量计算</h2>
          <p className="text-white/50">上传Excel文件，批量计算个税优化方案</p>
        </div>

        {/* Scenario Tabs */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-white/5 rounded-xl p-1.5 border border-white/10">
            {batchScenarios.map((scenario) => {
              const Icon = scenario.icon;
              const isActive = selectedScenario === scenario.type;
              const c = colorMap[scenario.color as keyof typeof colorMap];
              return (
                <button
                  key={scenario.type}
                  onClick={() => { setSelectedScenario(scenario.type); setResults(null); setError(null); }}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-medium transition-all ${isActive ? `${c.bg} ${c.text}` : 'text-white/50 hover:text-white'}`}
                >
                  <Icon className="w-4 h-4" />
                  {scenario.title}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Upload Area */}
          <div className="lg:col-span-2">
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                const file = e.dataTransfer.files[0];
                if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) processFile(file);
                else setError('请上传 .xlsx 或 .xls 格式文件');
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${isDragging ? `${colors.border} ${colors.bg} scale-[1.01]` : 'border-white/10 hover:border-white/20'}`}
            >
              <input ref={fileInputRef} type="file" accept=".xlsx,.xls" onChange={(e) => { const f = e.target.files?.[0]; if (f) processFile(f); }} className="hidden" />
              <Upload className="w-16 h-16 text-white/30 mx-auto mb-4" />
              <p className="text-white text-lg mb-2">拖放Excel文件到这里</p>
              <p className="text-white/40 text-sm">或点击上传 · 支持 .xlsx, .xls</p>
            </div>

            {error && (
              <div className="mt-4 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <span className="text-amber-400">{error}</span>
              </div>
            )}

            {isProcessing && (
              <div className="mt-4 flex items-center justify-center gap-3">
                <div className="w-5 h-5 border-2 border-white/20 border-t-white/50 rounded-full animate-spin" />
                <span className="text-white/50">处理中...</span>
              </div>
            )}

            {/* Results Table */}
            {results && results.length > 0 && (
              <div className="mt-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-white/70">计算结果 ({results.length} 人)</span>
                  <div className="flex gap-2">
                    <button onClick={exportResults} className={`px-4 py-2 rounded-lg text-sm font-medium text-white ${colors.btn} flex items-center gap-2`}>
                      <Download className="w-4 h-4" /> 导出
                    </button>
                    <button onClick={() => { setResults(null); }} className="px-4 py-2 rounded-lg text-sm font-medium text-white/50 bg-white/5 hover:bg-white/10">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left text-white/50 font-medium p-4">姓名</th>
                        <th className="text-right text-white/50 font-medium p-4">应纳税额</th>
                        <th className="text-right text-white/50 font-medium p-4">税后收入</th>
                        <th className="text-center text-white/50 font-medium p-4">最优方案</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.map((r: any, i) => (
                        <tr key={i} className="border-b border-white/5 last:border-0 hover:bg-white/5">
                          <td className="p-4 text-white">{r.name}</td>
                          <td className="p-4 text-right text-amber-400">¥{formatMoney(r.totalTax)}</td>
                          <td className="p-4 text-right text-white">¥{formatMoney(r.afterTaxIncome)}</td>
                          <td className="p-4 text-center">
                            <span className={`px-3 py-1 rounded-full text-xs ${colors.bg}`}>
                              {r.optimalType || r.planName}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div>
            <div className={`${colors.bg} border ${colors.border} rounded-2xl p-6`}>
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <FileSpreadsheet className={`w-5 h-5 ${colors.text}`} />
                使用步骤
              </h3>
              <ol className="space-y-4 text-sm text-white/60">
                <li className="flex gap-3">
                  <span className={`w-6 h-6 rounded-full ${colors.btn} text-white flex items-center justify-center text-xs flex-shrink-0`}>1</span>
                  <span>下载Excel模板</span>
                </li>
                <li className="flex gap-3">
                  <span className={`w-6 h-6 rounded-full ${colors.btn} text-white flex items-center justify-center text-xs flex-shrink-0`}>2</span>
                  <span>填写员工信息</span>
                </li>
                <li className="flex gap-3">
                  <span className={`w-6 h-6 rounded-full ${colors.btn} text-white flex items-center justify-center text-xs flex-shrink-0`}>3</span>
                  <span>上传文件计算</span>
                </li>
                <li className="flex gap-3">
                  <span className={`w-6 h-6 rounded-full ${colors.btn} text-white flex items-center justify-center text-xs flex-shrink-0`}>4</span>
                  <span>导出计算结果</span>
                </li>
              </ol>

              <button onClick={downloadTemplate} className={`w-full mt-6 ${colors.btn} text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2`}>
                <Download className="w-4 h-4" />
                下载模板
              </button>

              <div className="mt-6 p-4 bg-white/5 rounded-xl">
                <p className="text-white/50 text-xs mb-2">必填字段</p>
                <ul className="text-white/40 text-xs space-y-1">
                  {selectedScenario === 'split' && <li>姓名、税前年度总收入</li>}
                  {selectedScenario === 'yearend' && <li>姓名、前11月工资、12月工资、年终奖</li>}
                  {selectedScenario === 'compare' && <li>姓名、年度工资、年终奖</li>}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
