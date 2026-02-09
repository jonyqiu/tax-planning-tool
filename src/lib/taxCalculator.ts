// 个税计算核心逻辑

// 综合所得税率表 (年度)
export const annualTaxBrackets = [
  { limit: 36000, rate: 0.03, deduction: 0 },
  { limit: 144000, rate: 0.10, deduction: 2520 },
  { limit: 300000, rate: 0.20, deduction: 16920 },
  { limit: 420000, rate: 0.25, deduction: 31920 },
  { limit: 660000, rate: 0.30, deduction: 52920 },
  { limit: 960000, rate: 0.35, deduction: 85920 },
  { limit: Infinity, rate: 0.45, deduction: 181920 },
];

// 月度税率表 (年终奖单独计税用)
export const monthlyTaxBrackets = [
  { limit: 3000, rate: 0.03, deduction: 0 },
  { limit: 12000, rate: 0.10, deduction: 210 },
  { limit: 25000, rate: 0.20, deduction: 1410 },
  { limit: 35000, rate: 0.25, deduction: 2660 },
  { limit: 55000, rate: 0.30, deduction: 4410 },
  { limit: 80000, rate: 0.35, deduction: 7160 },
  { limit: Infinity, rate: 0.45, deduction: 15160 },
];

// 计算步骤详细数据接口
export interface CalculationStep {
  description: string;
  formula: string;
  value: number;
}

export interface SeparateTaxCalculation {
  salarySteps: CalculationStep[];
  bonusSteps: CalculationStep[];
  totalSteps: CalculationStep[];
}

export interface CombinedTaxCalculation {
  steps: CalculationStep[];
}

// 个税盲区 (年终奖单独计税)
export const taxBlindZones = [
  { min: 36000, max: 38566.67, loss: 2310.1 },
  { min: 144000, max: 160500, loss: 13200 },
  { min: 300000, max: 318333.33, loss: 13750 },
  { min: 420000, max: 447500, loss: 19250 },
  { min: 660000, max: 706538.46, loss: 30250 },
  { min: 960000, max: 1120000, loss: 88000 },
];

// 计算适用税率和速算扣除数
function getTaxBracket(amount: number, brackets: typeof annualTaxBrackets) {
  for (const bracket of brackets) {
    if (amount <= bracket.limit) {
      return bracket;
    }
  }
  return brackets[brackets.length - 1];
}

// 计算年度综合所得税
function calculateAnnualTax(taxableIncome: number): {
  tax: number;
  rate: number;
  deduction: number;
} {
  if (taxableIncome <= 0) {
    return { tax: 0, rate: 0, deduction: 0 };
  }
  const bracket = getTaxBracket(taxableIncome, annualTaxBrackets);
  const tax = taxableIncome * bracket.rate - bracket.deduction;
  return { tax, rate: bracket.rate, deduction: bracket.deduction };
}

// 计算年终奖单独计税
function calculateBonusTax(bonus: number): {
  tax: number;
  rate: number;
  deduction: number;
  monthlyAmount: number;
} {
  if (bonus <= 0) {
    return { tax: 0, rate: 0, deduction: 0, monthlyAmount: 0 };
  }
  const monthlyAmount = bonus / 12;
  const bracket = getTaxBracket(monthlyAmount, monthlyTaxBrackets);
  const tax = bonus * bracket.rate - bracket.deduction;
  return { tax, rate: bracket.rate, deduction: bracket.deduction, monthlyAmount };
}

// 检查是否处于个税盲区
export function checkBlindZone(bonus: number): {
  isInBlindZone: boolean;
  zone?: { min: number; max: number; loss: number };
  suggestion?: string;
} {
  for (const zone of taxBlindZones) {
    if (bonus > zone.min && bonus < zone.max) {
      return {
        isInBlindZone: true,
        zone,
        suggestion: `建议将年终奖调整为${zone.min.toLocaleString()}元，或增加至${Math.ceil(zone.max).toLocaleString()}元以上`,
      };
    }
  }
  return { isInBlindZone: false };
}

// 计算方案一：年终奖单独计税
export function calculateSeparateTax(
  salary: number,
  bonus: number,
  insurance: number,
  deduction: number
) {
  // 工资部分
  const salaryTaxableIncome = Math.max(0, salary - 60000 - insurance - deduction);
  const salaryTaxResult = calculateAnnualTax(salaryTaxableIncome);

  // 年终奖部分
  const bonusTaxResult = calculateBonusTax(bonus);

  // 总税额
  const totalTax = salaryTaxResult.tax + bonusTaxResult.tax;
  // 税后收入 = 总收入 - 三险一金 - 专项附加扣除 - 应纳税额
  const afterTaxIncome = salary + bonus - insurance - deduction - totalTax;

  // 计算步骤
  const salarySteps: CalculationStep[] = [
    { description: '工资收入', formula: '工资', value: salary },
    { description: '基本减除费用', formula: '60,000元/年', value: 60000 },
    { description: '专项扣除', formula: '三险一金等', value: insurance },
    { description: '专项附加扣除', formula: '子女教育、住房贷款等', value: deduction },
    { description: '工资应纳税所得额', formula: '工资 - 60,000 - 专项扣除 - 专项附加扣除', value: salaryTaxableIncome },
    { description: '适用税率', formula: `${(salaryTaxResult.rate * 100).toFixed(0)}%`, value: salaryTaxResult.rate },
    { description: '速算扣除数', formula: '', value: salaryTaxResult.deduction },
    { description: '工资应纳税额', formula: '应纳税所得额 × 税率 - 速算扣除数', value: salaryTaxResult.tax },
  ];

  const bonusSteps: CalculationStep[] = [
    { description: '年终奖金额', formula: '年终奖', value: bonus },
    { description: '月均奖金', formula: '年终奖 ÷ 12', value: bonusTaxResult.monthlyAmount },
    { description: '适用税率', formula: `${(bonusTaxResult.rate * 100).toFixed(0)}%`, value: bonusTaxResult.rate },
    { description: '速算扣除数', formula: '', value: bonusTaxResult.deduction },
    { description: '年终奖应纳税额', formula: '年终奖 × 税率 - 速算扣除数', value: bonusTaxResult.tax },
  ];

  const totalSteps: CalculationStep[] = [
    { description: '工资应纳税额', formula: '', value: salaryTaxResult.tax },
    { description: '年终奖应纳税额', formula: '', value: bonusTaxResult.tax },
    { description: '总应纳税额', formula: '工资税额 + 年终奖税额', value: totalTax },
  ];

  return {
    type: 'separate' as const,
    name: '单独计税',
    salaryTax: salaryTaxResult.tax,
    salaryTaxableIncome,
    salaryRate: salaryTaxResult.rate,
    bonusTax: bonusTaxResult.tax,
    bonusRate: bonusTaxResult.rate,
    bonusMonthlyAmount: bonusTaxResult.monthlyAmount,
    totalTax,
    afterTaxIncome,
    calculation: {
      salarySteps,
      bonusSteps,
      totalSteps,
    },
  };
}

// 计算方案二：年终奖并入综合所得
export function calculateCombinedTax(
  salary: number,
  bonus: number,
  insurance: number,
  deduction: number
) {
  // 综合所得
  const totalIncome = salary + bonus;
  const taxableIncome = Math.max(0, totalIncome - 60000 - insurance - deduction);
  const taxResult = calculateAnnualTax(taxableIncome);

  // 计算步骤
  const steps: CalculationStep[] = [
    { description: '工资收入', formula: '工资', value: salary },
    { description: '年终奖金额', formula: '年终奖', value: bonus },
    { description: '总收入', formula: '工资 + 年终奖', value: totalIncome },
    { description: '基本减除费用', formula: '60,000元/年', value: 60000 },
    { description: '专项扣除', formula: '三险一金等', value: insurance },
    { description: '专项附加扣除', formula: '子女教育、住房贷款等', value: deduction },
    { description: '应纳税所得额', formula: '总收入 - 60,000 - 专项扣除 - 专项附加扣除', value: taxableIncome },
    { description: '适用税率', formula: `${(taxResult.rate * 100).toFixed(0)}%`, value: taxResult.rate },
    { description: '速算扣除数', formula: '', value: taxResult.deduction },
    { description: '应纳税额', formula: '应纳税所得额 × 税率 - 速算扣除数', value: taxResult.tax },
  ];

  return {
    type: 'combined' as const,
    name: '合并计税',
    totalIncome,
    taxableIncome,
    tax: taxResult.tax,
    rate: taxResult.rate,
    totalTax: taxResult.tax,
    afterTaxIncome: totalIncome - insurance - deduction - taxResult.tax,
    calculation: {
      steps,
    },
  };
}

// 计算最优方案
export function calculateOptimalPlan(
  salary: number,
  bonus: number,
  insurance: number,
  deduction: number
) {
  const separateResult = calculateSeparateTax(salary, bonus, insurance, deduction);
  const combinedResult = calculateCombinedTax(salary, bonus, insurance, deduction);

  // 比较两种方案
  const isSeparateBetter = separateResult.totalTax <= combinedResult.totalTax;
  const optimalPlan = isSeparateBetter ? separateResult : combinedResult;
  const subOptimalPlan = isSeparateBetter ? combinedResult : separateResult;
  const taxSaving = subOptimalPlan.totalTax - optimalPlan.totalTax;

  // 检查年终奖是否处于盲区
  const blindZoneCheck = checkBlindZone(bonus);

  return {
    separate: separateResult,
    combined: combinedResult,
    optimal: optimalPlan,
    subOptimal: subOptimalPlan,
    taxSaving,
    blindZone: blindZoneCheck,
  };
}

// 生成图表数据：不同单独计税比例下的应纳税额
export function generateChartData(
  salary: number,
  bonus: number,
  insurance: number,
  deduction: number
) {
  const data = [];
  const totalIncome = salary + bonus;

  // 从0%到100%，每5%一个点
  for (let percent = 0; percent <= 100; percent += 5) {
    const separateBonus = (bonus * percent) / 100;
    const separateSalary = salary + bonus - separateBonus;

    // 计算这种分配方式下的税额
    const salaryTaxable = Math.max(0, separateSalary - 60000 - insurance - deduction);
    const salaryTaxResult = calculateAnnualTax(salaryTaxable);
    const bonusTaxResult = calculateBonusTax(separateBonus);
    const totalTax = salaryTaxResult.tax + bonusTaxResult.tax;

    data.push({
      percent,
      separatePercent: percent,
      combinedPercent: 100 - percent,
      separateBonus,
      combinedSalary: separateSalary,
      totalTax,
      afterTaxIncome: totalIncome - insurance - deduction - totalTax,
    });
  }

  return data;
}

// 批量计算
export interface EmployeeData {
  name: string;
  salary: number;
  bonus: number;
  insurance: number;
  deduction: number;
}

export interface BatchResult extends EmployeeData {
  optimalType: string;
  totalTax: number;
  afterTaxIncome: number;
  taxSaving: number;
  blindZoneWarning?: string;
}

export function batchCalculate(employees: EmployeeData[]): BatchResult[] {
  return employees.map((emp) => {
    const result = calculateOptimalPlan(emp.salary, emp.bonus, emp.insurance, emp.deduction);
    return {
      ...emp,
      optimalType: result.optimal.name,
      totalTax: result.optimal.totalTax,
      afterTaxIncome: result.optimal.afterTaxIncome,
      taxSaving: result.taxSaving,
      blindZoneWarning: result.blindZone.isInBlindZone ? result.blindZone.suggestion : undefined,
    };
  });
}

// 格式化金额
export function formatMoney(amount: number): string {
  return amount.toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
