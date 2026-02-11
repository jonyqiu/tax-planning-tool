import { useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Upload, Download, FileSpreadsheet, AlertTriangle, CheckCircle2, X, Split, Calendar, FileText } from 'lucide-react';
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

interface BatchScenarioConfig {
  type: BatchScenarioType;
  title: string;
  description: string;
  icon: React.ReactNode;
  bgColor: string;
  borderColor: string;
  buttonColor: string;
}

const batchScenarios: BatchScenarioConfig[] = [
  {
    type: 'split',
    title: '智能拆分批量计算',
    description: '输入税前总收入，自动计算最优工资和年终奖拆分',
    icon: <Split className="w-5 h-5" />,
    bgColor: 'bg-gradient-to-br from-emerald-500/20 to-teal-500/20',
    borderColor: 'border-emerald-500/50',
    buttonColor: 'bg-emerald-600 hover:bg-emerald-700',
  },
  {
    type: 'yearend',
    title: '年末优化批量计算',
    description: '前11个月工资已确定，优化12月和年终奖计税',
    icon: <Calendar className="w-5 h-5" />,
    bgColor: 'bg-gradient-to-br from-blue-500/20 to-indigo-500/20',
    borderColor: 'border-blue-500/50',
    buttonColor: 'bg-blue-600 hover:bg-blue-700',
  },
  {
    type: 'compare',
    title: '方案对比批量计算',
    description: '已确定工资和年终奖，对比两种计税方式差异',
    icon: <FileText className="w-5 h-5" />,
    bgColor: 'bg-gradient-to-br from-amber-500/20 to-orange-500/20',
    borderColor: 'border-amber-500/50',
    buttonColor: 'bg-amber-600 hover:bg-amber-700',
  },
];

export function BatchProcessingSection() {
  const [selectedScenario, setSelectedScenario] = useState<BatchScenarioType>('split');
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<BatchResult[] | SplitBatchResult[] | YearEndBatchResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentScenario = batchScenarios.find(s => s.type === selectedScenario)!;

  // 下载模板
  const downloadTemplate = () => {
    let template: any[] = [];
    let filename = '';

    switch (selectedScenario) {
      case 'split':
        template = [
          { 姓名: '张三', 税前年度总收入: 300000, 三险一金: 24000, 专项附加扣除: 48000 },
          { 姓名: '李四', 税前年度总收入: 500000, 三险一金: 30000, 专项附加扣除: 60000 },
        ];
        filename = '智能拆分模板.xlsx';
        break;
      case 'yearend':
        template = [
          { 姓名: '张三', 前11个月工资: 220000, '12月工资': 20000, 年终奖: 50000, 三险一金: 24000, 专项附加扣除: 48000 },
          { 姓名: '李四', 前11个月工资: 180000, '12月工资': 18000, 年终奖: 80000, 三险一金: 20000, 专项附加扣除: 36000 },
        ];
        filename = '年末优化模板.xlsx';
        break;
      case 'compare':
        template = [
          { 姓名: '张三', 年度工资: 240000, 年终奖: 36000, 三险一金: 24000, 专项附加扣除: 48000 },
          { 姓名: '李四', 年度工资: 180000, 年终奖: 50000, 三险一金: 18000, 专项附加扣除: 36000 },
        ];
        filename = '方案对比模板.xlsx';
        break;
    }

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '模板');
    XLSX.writeFile(wb, filename);
  };

  // 处理文件
  const processFile = useCallback(async (file: File) => {
    setError(null);
    setResults(null);
    setIsProcessing(true);
    setProgress(0);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];

      if (jsonData.length === 0) {
        throw new Error('Excel文件为空');
      }

      // 根据场景验证字段
      let requiredFields: string[] = [];
      switch (selectedScenario) {
        case 'split':
          requiredFields = ['姓名', '税前年度总收入'];
          break;
        case 'yearend':
          requiredFields = ['姓名', '前11个月工资', '12月工资', '年终奖'];
          break;
        case 'compare':
          requiredFields = ['姓名', '年度工资', '年终奖'];
          break;
      }

      const missingFields = requiredFields.filter(
        (field) => !jsonData[0] || !(field in jsonData[0])
      );

      if (missingFields.length > 0) {
        throw new Error(`缺少必需字段: ${missingFields.join(', ')}`);
      }

      // 模拟进度
      for (let i = 0; i <= 100; i += 10) {
        setProgress(i);
        await new Promise((resolve) => setTimeout(resolve, 50));
      }

      // 根据场景进行批量计算
      switch (selectedScenario) {
        case 'split': {
          const employees: SplitEmployeeData[] = jsonData.map((row) => ({
            name: String(row['姓名'] || ''),
            totalIncome: Number(row['税前年度总收入']) || 0,
            insurance: Number(row['三险一金']) || 0,
            deduction: Number(row['专项附加扣除']) || 0,
          }));
          const calcResults = batchCalculateSplit(employees);
          setResults(calcResults);
          break;
        }
        case 'yearend': {
          const employees: YearEndEmployeeData[] = jsonData.map((row) => ({
            name: String(row['姓名'] || ''),
            first11MonthsSalary: Number(row['前11个月工资']) || 0,
            decemberSalary: Number(row['12月工资' as keyof typeof row]) || 0,
            yearEndBonus: Number(row['年终奖']) || 0,
            insurance: Number(row['三险一金']) || 0,
            deduction: Number(row['专项附加扣除']) || 0,
          }));
          const calcResults = batchCalculateYearEnd(employees);
          setResults(calcResults);
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
          const calcResults = batchCalculate(employees);
          setResults(calcResults);
          break;
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '文件处理失败');
    } finally {
      setIsProcessing(false);
    }
  }, [selectedScenario]);

  // 拖放处理
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        processFile(file);
      } else {
        setError('请上传 .xlsx 或 .xls 格式的Excel文件');
      }
    }
  };

  // 文件选择处理
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  // 导出结果
  const exportResults = () => {
    if (!results) return;

    let exportData: any[] = [];
    let filename = '';

    switch (selectedScenario) {
      case 'split': {
        const splitResults = results as SplitBatchResult[];
        exportData = splitResults.map((r) => ({
          姓名: r.name,
          税前年度总收入: r.totalIncome,
          三险一金: r.insurance,
          专项附加扣除: r.deduction,
          建议工资: r.optimalSalary,
          建议年终奖: r.optimalBonus,
          计税方式: r.planName,
          总应纳税额: r.totalTax,
          税后收入: r.afterTaxIncome,
          避开盲区: r.blindZoneAvoided ? '是' : '否',
        }));
        filename = '智能拆分计算结果.xlsx';
        break;
      }
      case 'yearend': {
        const yearEndResults = results as YearEndBatchResult[];
        exportData = yearEndResults.map((r) => ({
          姓名: r.name,
          前11个月工资: r.first11MonthsSalary,
          '12月工资': r.decemberSalary,
          年终奖: r.yearEndBonus,
          三险一金: r.insurance,
          专项附加扣除: r.deduction,
          最优方案: r.optimalType,
          单独计税金额: r.separateBonus,
          并入综合所得金额: r.mergedBonus,
          总应纳税额: r.totalTax,
          税后收入: r.afterTaxIncome,
          节税金额: r.taxSaving,
        }));
        filename = '年末优化计算结果.xlsx';
        break;
      }
      case 'compare': {
        const compareResults = results as BatchResult[];
        exportData = compareResults.map((r) => ({
          姓名: r.name,
          年度工资: r.salary,
          年终奖: r.bonus,
          三险一金: r.insurance,
          专项附加扣除: r.deduction,
          最优方案: r.optimalType,
          总应纳税额: r.totalTax,
          税后收入: r.afterTaxIncome,
          节税金额: r.taxSaving,
          盲区警告: r.blindZoneWarning || '',
        }));
        filename = '方案对比计算结果.xlsx';
        break;
      }
    }

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '计算结果');
    XLSX.writeFile(wb, filename);
  };

  // 清空结果
  const clearResults = () => {
    setResults(null);
    setError(null);
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 获取模板字段说明
  const getTemplateFields = () => {
    switch (selectedScenario) {
      case 'split':
        return (
          <>
            <li>• 姓名：员工姓名（必填）</li>
            <li>• 税前年度总收入：全年税前总收入（必填）</li>
            <li>• 三险一金：全年社保公积金扣除</li>
            <li>• 专项附加扣除：子女教育等扣除</li>
          </>
        );
      case 'yearend':
        return (
          <>
            <li>• 姓名：员工姓名（必填）</li>
            <li>• 前11个月工资：1-11月累计工资（必填）</li>
            <li>• 12月工资：12月应发工资（必填）</li>
            <li>• 年终奖：年终奖金（必填）</li>
            <li>• 三险一金：全年社保公积金扣除</li>
            <li>• 专项附加扣除：子女教育等扣除</li>
          </>
        );
      case 'compare':
        return (
          <>
            <li>• 姓名：员工姓名（必填）</li>
            <li>• 年度工资：全年工资收入（必填）</li>
            <li>• 年终奖：年终奖金额（必填）</li>
            <li>• 三险一金：社保公积金等扣除</li>
            <li>• 专项附加扣除：子女教育等扣除</li>
          </>
        );
    }
  };

  // 渲染结果表格
  const renderResultsTable = () => {
    if (!results || results.length === 0) return null;

    switch (selectedScenario) {
      case 'split': {
        const splitResults = results as SplitBatchResult[];
        return (
          <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-white/10 hover:bg-transparent sticky top-0 bg-[#16213e]">
                  <TableHead className="text-white font-semibold">姓名</TableHead>
                  <TableHead className="text-white font-semibold text-right">税前总收入</TableHead>
                  <TableHead className="text-white font-semibold text-right">建议工资</TableHead>
                  <TableHead className="text-white font-semibold text-right">建议年终奖</TableHead>
                  <TableHead className="text-white font-semibold">计税方式</TableHead>
                  <TableHead className="text-white font-semibold text-right">应纳税额</TableHead>
                  <TableHead className="text-white font-semibold text-center">盲区</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {splitResults.map((r, index) => (
                  <TableRow key={index} className="border-white/10 hover:bg-white/5">
                    <TableCell className="text-white">{r.name}</TableCell>
                    <TableCell className="text-white text-right">¥{formatMoney(r.totalIncome)}</TableCell>
                    <TableCell className="text-emerald-400 text-right">¥{formatMoney(r.optimalSalary)}</TableCell>
                    <TableCell className="text-blue-400 text-right">¥{formatMoney(r.optimalBonus)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs bg-emerald-500/20 text-emerald-400 border-emerald-500/50">
                        {r.planName}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-[#e94560] text-right">¥{formatMoney(r.totalTax)}</TableCell>
                    <TableCell className="text-center">
                      {r.blindZoneAvoided ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" />
                      ) : (
                        <span className="text-white/40">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        );
      }
      case 'yearend': {
        const yearEndResults = results as YearEndBatchResult[];
        return (
          <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-white/10 hover:bg-transparent sticky top-0 bg-[#16213e]">
                  <TableHead className="text-white font-semibold">姓名</TableHead>
                  <TableHead className="text-white font-semibold text-right">年终奖</TableHead>
                  <TableHead className="text-white font-semibold">最优方案</TableHead>
                  <TableHead className="text-white font-semibold text-right">单独计税</TableHead>
                  <TableHead className="text-white font-semibold text-right">并入综合</TableHead>
                  <TableHead className="text-white font-semibold text-right">应纳税额</TableHead>
                  <TableHead className="text-white font-semibold text-right">节税</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {yearEndResults.map((r, index) => (
                  <TableRow key={index} className="border-white/10 hover:bg-white/5">
                    <TableCell className="text-white">{r.name}</TableCell>
                    <TableCell className="text-white text-right">¥{formatMoney(r.yearEndBonus)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-xs ${
                        r.optimalType === '年终奖单独计税'
                          ? 'bg-blue-500/20 text-blue-400 border-blue-500/50'
                          : r.optimalType === '年终奖并入综合所得'
                          ? 'bg-purple-500/20 text-purple-400 border-purple-500/50'
                          : 'bg-green-500/20 text-green-400 border-green-500/50'
                      }`}>
                        {r.optimalType}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-blue-400 text-right">¥{formatMoney(r.separateBonus)}</TableCell>
                    <TableCell className="text-purple-400 text-right">¥{formatMoney(r.mergedBonus)}</TableCell>
                    <TableCell className="text-[#e94560] text-right">¥{formatMoney(r.totalTax)}</TableCell>
                    <TableCell className="text-emerald-400 text-right">¥{formatMoney(r.taxSaving)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        );
      }
      case 'compare': {
        const compareResults = results as BatchResult[];
        return (
          <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-white/10 hover:bg-transparent sticky top-0 bg-[#16213e]">
                  <TableHead className="text-white font-semibold">姓名</TableHead>
                  <TableHead className="text-white font-semibold text-right">年度工资</TableHead>
                  <TableHead className="text-white font-semibold text-right">年终奖</TableHead>
                  <TableHead className="text-white font-semibold">最优方案</TableHead>
                  <TableHead className="text-white font-semibold text-right">应纳税额</TableHead>
                  <TableHead className="text-white font-semibold text-center">状态</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {compareResults.map((r, index) => (
                  <TableRow key={index} className="border-white/10 hover:bg-white/5">
                    <TableCell className="text-white">{r.name}</TableCell>
                    <TableCell className="text-white text-right">¥{formatMoney(r.salary)}</TableCell>
                    <TableCell className="text-white text-right">¥{formatMoney(r.bonus)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-xs ${
                        r.optimalType === '单独计税'
                          ? 'bg-blue-500/20 text-blue-400 border-blue-500/50'
                          : 'bg-purple-500/20 text-purple-400 border-purple-500/50'
                      }`}>
                        {r.optimalType}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-[#e94560] text-right">¥{formatMoney(r.totalTax)}</TableCell>
                    <TableCell className="text-center">
                      {r.blindZoneWarning ? (
                        <span title={r.blindZoneWarning}>
                          <AlertTriangle className="w-4 h-4 text-[#e94560] mx-auto cursor-help" />
                        </span>
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-green-400 mx-auto" />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        );
      }
    }
  };

  return (
    <section className="w-full bg-[#1a1a2e] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="bg-[#16213e] border-none shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl text-white flex items-center gap-2">
              <FileSpreadsheet className="w-6 h-6 text-[#e94560]" />
              批量计算
            </CardTitle>
            <p className="text-white/60 mt-1">选择计算场景，上传Excel文件进行批量个税优化计算</p>
          </CardHeader>
          <CardContent>
            {/* 场景选择 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {batchScenarios.map((scenario) => (
                <button
                  key={scenario.type}
                  onClick={() => {
                    setSelectedScenario(scenario.type);
                    setResults(null);
                    setError(null);
                  }}
                  className={`relative p-5 rounded-xl border-2 text-left transition-all duration-300 hover:scale-[1.02] ${
                    selectedScenario === scenario.type
                      ? `${scenario.bgColor} ${scenario.borderColor}`
                      : 'bg-[#0f3460]/30 border-white/10 hover:border-white/30'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${
                    selectedScenario === scenario.type ? 'text-white' : 'text-white/60'
                  }`}>
                    {scenario.icon}
                  </div>
                  <h3 className="text-white font-semibold mb-1">{scenario.title}</h3>
                  <p className="text-white/50 text-sm">{scenario.description}</p>
                  {selectedScenario === scenario.type && (
                    <div className="absolute top-3 right-3">
                      <CheckCircle2 className="w-5 h-5 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* 上传区 */}
              <div className="lg:col-span-2">
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`
                    border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
                    transition-all duration-300
                    ${
                      isDragging
                        ? 'border-[#e94560] bg-[#e94560]/10 scale-[1.02]'
                        : 'border-[#0f3460] bg-[#0f3460]/40 hover:border-[#0f3460]/80 hover:bg-[#0f3460]/60'
                    }
                  `}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Upload className="w-16 h-16 text-white/50 mx-auto mb-4" />
                  <p className="text-white text-lg mb-2">
                    拖放Excel文件到这里，或点击上传
                  </p>
                  <p className="text-white/50 text-sm">支持 .xlsx, .xls 格式</p>
                </div>

                {/* 进度条 */}
                {isProcessing && (
                  <div className="mt-4">
                    <div className="flex justify-between text-sm text-white/70 mb-2">
                      <span>正在处理...</span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                )}

                {/* 错误提示 */}
                {error && (
                  <div className="mt-4 p-4 bg-[#e94560]/20 border border-[#e94560]/50 rounded-lg flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-[#e94560] flex-shrink-0" />
                    <div>
                      <p className="text-[#e94560] font-semibold">处理失败</p>
                      <p className="text-white/80 text-sm">{error}</p>
                    </div>
                  </div>
                )}

                {/* 结果表格 */}
                {results && results.length > 0 && (
                  <div className="mt-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-white font-semibold">
                        计算结果 ({results.length} 人)
                      </h4>
                      <div className="flex gap-2">
                        <Button
                          onClick={exportResults}
                          size="sm"
                          className="bg-[#0f3460] hover:bg-[#0f3460]/80 text-white border-0"
                        >
                          <Download className="w-4 h-4 mr-1" />
                          导出结果
                        </Button>
                        <Button
                          onClick={clearResults}
                          size="sm"
                          className="bg-white/10 hover:bg-white/20 text-white border-0"
                        >
                          <X className="w-4 h-4 mr-1" />
                          清空
                        </Button>
                      </div>
                    </div>
                    {renderResultsTable()}
                  </div>
                )}
              </div>

              {/* 说明区 */}
              <div className={`rounded-lg p-6 ${currentScenario.bgColor} border ${currentScenario.borderColor}`}>
                <h4 className="text-white font-semibold mb-4">批量计算说明</h4>
                <div className="space-y-3 mb-6">
                  <div className="flex items-start gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0 ${currentScenario.buttonColor}`}>
                      1
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">下载Excel模板</p>
                      <p className="text-white/60 text-xs">获取对应场景的Excel模板文件</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0 ${currentScenario.buttonColor}`}>
                      2
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">填写员工信息</p>
                      <p className="text-white/60 text-xs">按模板格式填写员工收入信息</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0 ${currentScenario.buttonColor}`}>
                      3
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">上传文件计算</p>
                      <p className="text-white/60 text-xs">拖放或点击上传Excel文件</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0 ${currentScenario.buttonColor}`}>
                      4
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">下载计算结果</p>
                      <p className="text-white/60 text-xs">导出包含最优方案的Excel文件</p>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={downloadTemplate}
                  className={`w-full ${currentScenario.buttonColor} text-white border-0`}
                >
                  <Download className="w-4 h-4 mr-2" />
                  下载Excel模板
                </Button>

                <div className="mt-6 p-4 bg-[#16213e]/50 rounded-lg">
                  <p className="text-white/80 text-sm font-medium mb-2">模板字段说明</p>
                  <ul className="text-white/60 text-xs space-y-1">
                    {getTemplateFields()}
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
