import { useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Upload, Download, FileSpreadsheet, AlertTriangle, CheckCircle2, X } from 'lucide-react';
import * as XLSX from 'xlsx';
import { batchCalculate, formatMoney, type EmployeeData, type BatchResult } from '@/lib/taxCalculator';

export function BatchProcessingSection() {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<BatchResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 下载模板
  const downloadTemplate = () => {
    const template = [
      {
        姓名: '张三',
        年度工资: 240000,
        年终奖: 36000,
        三险一金: 24000,
        专项附加扣除: 48000,
      },
      {
        姓名: '李四',
        年度工资: 180000,
        年终奖: 50000,
        三险一金: 18000,
        专项附加扣除: 36000,
      },
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '模板');
    XLSX.writeFile(wb, '个税筹划模板.xlsx');
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

      // 验证数据格式
      const requiredFields = ['姓名', '年度工资', '年终奖'];
      const missingFields = requiredFields.filter(
        (field) => !jsonData[0] || !(field in jsonData[0])
      );

      if (missingFields.length > 0) {
        throw new Error(`缺少必需字段: ${missingFields.join(', ')}`);
      }

      // 转换数据
      const employees: EmployeeData[] = jsonData.map((row) => ({
        name: String(row['姓名'] || ''),
        salary: Number(row['年度工资']) || 0,
        bonus: Number(row['年终奖']) || 0,
        insurance: Number(row['三险一金']) || 0,
        deduction: Number(row['专项附加扣除']) || 0,
      }));

      // 模拟进度
      for (let i = 0; i <= 100; i += 10) {
        setProgress(i);
        await new Promise((resolve) => setTimeout(resolve, 50));
      }

      // 批量计算
      const calcResults = batchCalculate(employees);
      setResults(calcResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : '文件处理失败');
    } finally {
      setIsProcessing(false);
    }
  }, []);

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

    const exportData = results.map((r) => ({
      姓名: r.name,
      年度工资: r.salary,
      年终奖: r.bonus,
      三险一金: r.insurance,
      专项附加扣除: r.deduction,
      最优方案: r.optimalType,
      总应纳税额: r.totalTax,
      节税金额: r.taxSaving,
      盲区警告: r.blindZoneWarning || '',
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '计算结果');
    XLSX.writeFile(wb, '个税筹划计算结果.xlsx');
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

  return (
    <section className="w-full bg-[#1a1a2e] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="bg-[#16213e] border-none shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl text-white flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-[#e94560]" />
              批量计算
            </CardTitle>
          </CardHeader>
          <CardContent>
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
                        : 'border-white/30 bg-white/5 hover:border-white/50'
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
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <Download className="w-4 h-4 mr-1" />
                          导出结果
                        </Button>
                        <Button
                          onClick={clearResults}
                          size="sm"
                          variant="outline"
                          className="border-white/20 text-white hover:bg-white/10"
                        >
                          <X className="w-4 h-4 mr-1" />
                          清空
                        </Button>
                      </div>
                    </div>
                    <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-white/10 hover:bg-transparent sticky top-0 bg-[#16213e]">
                            <TableHead className="text-white font-semibold">姓名</TableHead>
                            <TableHead className="text-white font-semibold text-right">年终奖</TableHead>
                            <TableHead className="text-white font-semibold">最优方案</TableHead>
                            <TableHead className="text-white font-semibold text-right">应纳税额</TableHead>
                            <TableHead className="text-white font-semibold text-center">状态</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {results.map((r, index) => (
                            <TableRow key={index} className="border-white/10 hover:bg-white/5">
                              <TableCell className="text-white">{r.name}</TableCell>
                              <TableCell className="text-white text-right">
                                ¥{formatMoney(r.bonus)}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant="outline"
                                  className={`text-xs ${
                                    r.optimalType === '单独计税'
                                      ? 'border-blue-400 text-blue-400'
                                      : 'border-purple-400 text-purple-400'
                                  }`}
                                >
                                  {r.optimalType}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-[#e94560] text-right">
                                ¥{formatMoney(r.totalTax)}
                              </TableCell>
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
                  </div>
                )}
              </div>

              {/* 说明区 */}
              <div className="bg-[#0f3460] rounded-lg p-6">
                <h4 className="text-white font-semibold mb-4">批量计算说明</h4>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#e94560] flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                      1
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">下载Excel模板</p>
                      <p className="text-white/60 text-xs">获取标准格式的Excel模板文件</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#e94560] flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                      2
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">填写员工信息</p>
                      <p className="text-white/60 text-xs">按模板格式填写员工收入信息</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#e94560] flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                      3
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">上传文件计算</p>
                      <p className="text-white/60 text-xs">拖放或点击上传Excel文件</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#e94560] flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
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
                  variant="outline"
                  className="w-full mt-6 border-white/20 text-white hover:bg-white/10"
                >
                  <Download className="w-4 h-4 mr-2" />
                  下载Excel模板
                </Button>

                <div className="mt-6 p-4 bg-[#16213e] rounded-lg">
                  <p className="text-white/80 text-sm font-medium mb-2">模板字段说明</p>
                  <ul className="text-white/60 text-xs space-y-1">
                    <li>• 姓名：员工姓名（必填）</li>
                    <li>• 年度工资：全年工资收入（必填）</li>
                    <li>• 年终奖：年终奖金额（必填）</li>
                    <li>• 三险一金：社保公积金等扣除</li>
                    <li>• 专项附加扣除：子女教育等扣除</li>
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
