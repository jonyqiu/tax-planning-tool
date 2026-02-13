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

// 年末奖金优化场景：前11个月工资已知，优化12月工资+年终奖分配
export interface YearEndScenario {
  first11MonthsSalary: number; // 前11个月累计工资
  decemberSalary: number; // 12月工资
  yearEndBonus: number; // 年终奖
  insurance: number; // 全年三险一金
  deduction: number; // 全年专项附加扣除
}

export interface YearEndPlan {
  type: 'separate' | 'combined' | 'partial';
  name: string;
  description: string;
  // 分配方案
  separateBonus: number; // 单独计税的年终奖金额
  mergedBonus: number; // 并入工资的年终奖金额
  combinedIncome: number; // 并入综合所得的总金额（全年工资+并入的奖金）
  // 税额计算
  separateBonusTax: number; // 单独计税部分税额
  salaryTax: number; // 工资部分税额
  totalTax: number; // 总税额
  afterTaxIncome: number; // 税后收入
  // 计算过程
  salaryTaxableIncome: number; // 工资应纳税所得额
  salaryRate: number; // 工资适用税率
  bonusRate: number; // 年终奖适用税率
  // 详细计算步骤（用于展示）
  calculationSteps?: {
    salarySteps: CalculationStep[];
    bonusSteps: CalculationStep[];
    totalSteps: CalculationStep[];
  };
}

// 计算年末最优方案
export function calculateYearEndOptimal(scenario: YearEndScenario) {
  const { first11MonthsSalary, decemberSalary, yearEndBonus, insurance, deduction } = scenario;

  // 全年工资收入
  const annualSalary = first11MonthsSalary + decemberSalary;
  // totalIncome is calculated but not used directly in this function
  // const totalIncome = annualSalary + yearEndBonus;

  // 方案1：年终奖单独计税（全部奖金单独计税）
  const plan1 = calculateYearEndPlan1(annualSalary, yearEndBonus, insurance, deduction);

  // 方案2：年终奖并入综合所得（全部奖金并入工资）
  const plan2 = calculateYearEndPlan2(annualSalary, yearEndBonus, insurance, deduction);

  // 方案3：部分奖金单独计税（寻找最优分配比例）
  const plan3 = findOptimalPartialPlan(annualSalary, yearEndBonus, insurance, deduction);

  // 找出最优方案
  // 优先选择税额低的，税额相同时选择更简单的方案（优先单独计税 > 并入综合所得 > 部分拆分）
  const getComplexityScore = (plan: YearEndPlan): number => {
    if (plan.type === 'separate') return 0; // 全部单独计税，最简单
    if (plan.type === 'combined') return 1; // 全部并入综合所得
    return 2; // 部分拆分，最复杂
  };

  // 使用容差比较浮点数，避免精度问题
  const EPSILON = 0.01;

  const plans = [plan1, plan2, plan3].filter((p): p is YearEndPlan => p !== null);
  const optimalPlan = plans.reduce((best, current) => {
    // 当前方案税额明显更低，选择当前方案
    if (current.totalTax < best.totalTax - EPSILON) return current;
    // 税额在容差范围内相同，选择更简单的方案
    if (Math.abs(current.totalTax - best.totalTax) <= EPSILON && getComplexityScore(current) < getComplexityScore(best)) return current;
    return best;
  });

  // 计算节税金额（对比最差方案）
  const worstPlan = plans.reduce((worst, current) =>
    current.totalTax > worst.totalTax ? current : worst
  );
  const taxSaving = worstPlan.totalTax - optimalPlan.totalTax;

  return {
    scenario,
    plans,
    optimal: optimalPlan,
    taxSaving,
    comparison: {
      separate: plan1,
      combined: plan2,
      partial: plan3,
    },
  };
}

// 方案1：年终奖全部单独计税
function calculateYearEndPlan1(
  annualSalary: number,
  yearEndBonus: number,
  insurance: number,
  deduction: number
): YearEndPlan {
  // 工资部分应纳税
  const salaryTaxableIncome = Math.max(0, annualSalary - 60000 - insurance - deduction);
  const salaryTaxResult = calculateAnnualTax(salaryTaxableIncome);

  // 年终奖单独计税
  const bonusTaxResult = calculateBonusTax(yearEndBonus);

  const totalTax = salaryTaxResult.tax + bonusTaxResult.tax;

  // 生成计算步骤
  const salarySteps: CalculationStep[] = [
    { description: '年度工资收入', formula: '', value: annualSalary },
    { description: '基本减除费用', formula: '60,000元/年', value: 60000 },
    { description: '专项扣除（三险一金）', formula: '', value: insurance },
    { description: '专项附加扣除', formula: '', value: deduction },
    { description: '工资应纳税所得额', formula: `${annualSalary} - 60,000 - ${insurance} - ${deduction}`, value: salaryTaxableIncome },
    { description: '工资适用税率', formula: `${(salaryTaxResult.rate * 100).toFixed(0)}%`, value: salaryTaxResult.rate },
    { description: '工资速算扣除数', formula: '', value: salaryTaxResult.deduction },
    { description: '工资应纳税额', formula: `${salaryTaxableIncome} × ${(salaryTaxResult.rate * 100).toFixed(0)}% - ${salaryTaxResult.deduction}`, value: salaryTaxResult.tax },
  ];

  const bonusSteps: CalculationStep[] = [
    { description: '年终奖金额', formula: '', value: yearEndBonus },
    { description: '月均奖金', formula: `${yearEndBonus} ÷ 12`, value: bonusTaxResult.monthlyAmount },
    { description: '年终奖适用税率', formula: `${(bonusTaxResult.rate * 100).toFixed(0)}%`, value: bonusTaxResult.rate },
    { description: '年终奖速算扣除数', formula: '', value: bonusTaxResult.deduction },
    { description: '年终奖应纳税额', formula: `${yearEndBonus} × ${(bonusTaxResult.rate * 100).toFixed(0)}% - ${bonusTaxResult.deduction}`, value: bonusTaxResult.tax },
  ];

  const totalSteps: CalculationStep[] = [
    { description: '工资应纳税额', formula: '', value: salaryTaxResult.tax },
    { description: '年终奖应纳税额', formula: '', value: bonusTaxResult.tax },
    { description: '总应纳税额', formula: `${salaryTaxResult.tax} + ${bonusTaxResult.tax}`, value: totalTax },
    { description: '税后收入', formula: `${annualSalary} + ${yearEndBonus} - ${insurance} - ${deduction} - ${totalTax}`, value: annualSalary + yearEndBonus - insurance - deduction - totalTax },
  ];

  return {
    type: 'separate',
    name: '年终奖单独计税',
    description: '年终奖全部单独计税，工资部分正常并入综合所得',
    separateBonus: yearEndBonus,
    mergedBonus: 0,
    combinedIncome: annualSalary,
    separateBonusTax: bonusTaxResult.tax,
    salaryTax: salaryTaxResult.tax,
    totalTax,
    afterTaxIncome: annualSalary + yearEndBonus - insurance - deduction - totalTax,
    salaryTaxableIncome,
    salaryRate: salaryTaxResult.rate,
    bonusRate: bonusTaxResult.rate,
    calculationSteps: {
      salarySteps,
      bonusSteps,
      totalSteps,
    },
  };
}

// 方案2：年终奖全部并入综合所得
function calculateYearEndPlan2(
  annualSalary: number,
  yearEndBonus: number,
  insurance: number,
  deduction: number
): YearEndPlan {
  const totalIncome = annualSalary + yearEndBonus;
  const taxableIncome = Math.max(0, totalIncome - 60000 - insurance - deduction);
  const taxResult = calculateAnnualTax(taxableIncome);

  // 生成计算步骤
  const salarySteps: CalculationStep[] = [
    { description: '年度工资收入', formula: '', value: annualSalary },
    { description: '年终奖金额', formula: '', value: yearEndBonus },
    { description: '综合所得收入', formula: `${annualSalary} + ${yearEndBonus}`, value: totalIncome },
    { description: '基本减除费用', formula: '60,000元/年', value: 60000 },
    { description: '专项扣除（三险一金）', formula: '', value: insurance },
    { description: '专项附加扣除', formula: '', value: deduction },
    { description: '应纳税所得额', formula: `${totalIncome} - 60,000 - ${insurance} - ${deduction}`, value: taxableIncome },
    { description: '适用税率', formula: `${(taxResult.rate * 100).toFixed(0)}%`, value: taxResult.rate },
    { description: '速算扣除数', formula: '', value: taxResult.deduction },
    { description: '总应纳税额', formula: `${taxableIncome} × ${(taxResult.rate * 100).toFixed(0)}% - ${taxResult.deduction}`, value: taxResult.tax },
    { description: '税后收入', formula: `${totalIncome} - ${insurance} - ${deduction} - ${taxResult.tax}`, value: totalIncome - insurance - deduction - taxResult.tax },
  ];

  return {
    type: 'combined',
    name: '年终奖并入综合所得',
    description: '年终奖全部并入综合所得，与工资一起计税',
    separateBonus: 0,
    mergedBonus: yearEndBonus,
    combinedIncome: totalIncome,
    separateBonusTax: 0,
    salaryTax: taxResult.tax,
    totalTax: taxResult.tax,
    afterTaxIncome: totalIncome - insurance - deduction - taxResult.tax,
    salaryTaxableIncome: taxableIncome,
    salaryRate: taxResult.rate,
    bonusRate: 0,
    calculationSteps: {
      salarySteps,
      bonusSteps: [],
      totalSteps: salarySteps.filter(s => s.description.includes('应纳税额') || s.description.includes('税后收入')),
    },
  };
}

// 方案3：寻找最优的部分奖金单独计税方案
function findOptimalPartialPlan(
  annualSalary: number,
  yearEndBonus: number,
  insurance: number,
  deduction: number
): YearEndPlan | null {
  // 如果年终奖为0，不需要部分计税方案
  if (yearEndBonus <= 0) return null;

  let optimalPlan: YearEndPlan | null = null;
  let minTax = Infinity;

  // 遍历不同比例：0%到100%，步长1%
  for (let percent = 0; percent <= 100; percent++) {
    const separateBonus = (yearEndBonus * percent) / 100;
    const remainingBonus = yearEndBonus - separateBonus;
    const combinedSalary = annualSalary + remainingBonus;

    // 计算税额
    const salaryTaxableIncome = Math.max(0, combinedSalary - 60000 - insurance - deduction);
    const salaryTaxResult = calculateAnnualTax(salaryTaxableIncome);
    const bonusTaxResult = calculateBonusTax(separateBonus);
    const totalTax = salaryTaxResult.tax + bonusTaxResult.tax;

    // 计算当前方案的复杂度分数（越低越简单）
    // 0% = 全部并入（复杂度1），100% = 全部单独（复杂度0），其他 = 部分拆分（复杂度2）
    const getComplexityScore = (p: number): number => {
      if (p === 100) return 0; // 全部单独计税，最简单
      if (p === 0) return 1;   // 全部并入综合所得
      return 2;                // 部分拆分，最复杂
    };

    const currentComplexity = getComplexityScore(percent);
    const optimalComplexity = optimalPlan ? getComplexityScore(optimalPlan.separateBonus > 0 && optimalPlan.mergedBonus > 0 ? 50 : (optimalPlan.separateBonus > 0 ? 100 : 0)) : Infinity;

    // 使用容差比较浮点数，避免精度问题
    const EPSILON = 0.01;

    // 优先选择税额低的，税额相同时选择更简单的方案
    if (totalTax < minTax - EPSILON || (Math.abs(totalTax - minTax) <= EPSILON && currentComplexity < optimalComplexity)) {
      minTax = totalTax;

      // 生成描述
      let description: string;
      if (percent === 0) {
        description = '年终奖全部并入综合所得，与工资一起计税';
      } else if (percent === 100) {
        description = '年终奖全部单独计税，工资部分正常并入综合所得';
      } else {
        description = `年终奖中 ${separateBonus.toFixed(0)}元 单独计税，${remainingBonus.toFixed(0)}元 并入综合所得`;
      }

      // 生成计算步骤
      const salarySteps: CalculationStep[] = [
        { description: '年度工资收入', formula: '', value: annualSalary },
        { description: '并入工资的年终奖', formula: '', value: remainingBonus },
        { description: '综合所得收入', formula: `${annualSalary} + ${remainingBonus}`, value: combinedSalary },
        { description: '基本减除费用', formula: '60,000元/年', value: 60000 },
        { description: '专项扣除（三险一金）', formula: '', value: insurance },
        { description: '专项附加扣除', formula: '', value: deduction },
        { description: '工资应纳税所得额', formula: `${combinedSalary} - 60,000 - ${insurance} - ${deduction}`, value: salaryTaxableIncome },
        { description: '工资适用税率', formula: `${(salaryTaxResult.rate * 100).toFixed(0)}%`, value: salaryTaxResult.rate },
        { description: '工资速算扣除数', formula: '', value: salaryTaxResult.deduction },
        { description: '工资应纳税额', formula: `${salaryTaxableIncome} × ${(salaryTaxResult.rate * 100).toFixed(0)}% - ${salaryTaxResult.deduction}`, value: salaryTaxResult.tax },
      ];

      const bonusSteps: CalculationStep[] = [
        { description: '单独计税年终奖', formula: '', value: separateBonus },
        { description: '月均奖金', formula: `${separateBonus} ÷ 12`, value: bonusTaxResult.monthlyAmount },
        { description: '年终奖适用税率', formula: `${(bonusTaxResult.rate * 100).toFixed(0)}%`, value: bonusTaxResult.rate },
        { description: '年终奖速算扣除数', formula: '', value: bonusTaxResult.deduction },
        { description: '年终奖应纳税额', formula: `${separateBonus} × ${(bonusTaxResult.rate * 100).toFixed(0)}% - ${bonusTaxResult.deduction}`, value: bonusTaxResult.tax },
      ];

      const totalSteps: CalculationStep[] = [
        { description: '工资应纳税额', formula: '', value: salaryTaxResult.tax },
        { description: '年终奖应纳税额', formula: '', value: bonusTaxResult.tax },
        { description: '总应纳税额', formula: `${salaryTaxResult.tax} + ${bonusTaxResult.tax}`, value: totalTax },
        { description: '税后收入', formula: `${annualSalary} + ${yearEndBonus} - ${insurance} - ${deduction} - ${totalTax}`, value: annualSalary + yearEndBonus - insurance - deduction - totalTax },
      ];

      optimalPlan = {
        type: percent === 0 || percent === 100 ? (percent === 0 ? 'combined' : 'separate') : 'partial',
        name: percent === 0 || percent === 100 ? (percent === 0 ? '年终奖并入综合所得' : '年终奖单独计税') : '部分奖金单独计税',
        description,
        separateBonus,
        mergedBonus: remainingBonus,
        combinedIncome: combinedSalary,
        separateBonusTax: bonusTaxResult.tax,
        salaryTax: salaryTaxResult.tax,
        totalTax,
        afterTaxIncome: annualSalary + yearEndBonus - insurance - deduction - totalTax,
        salaryTaxableIncome,
        salaryRate: salaryTaxResult.rate,
        bonusRate: bonusTaxResult.rate,
        calculationSteps: {
          salarySteps,
          bonusSteps,
          totalSteps,
        },
      };
    }
  }

  return optimalPlan;
}

// 场景1：最优拆分方案 - 输入税前总收入，自动拆分工资和年终奖
export interface OptimalSplitResult {
  totalIncome: number;
  optimalSalary: number;
  optimalBonus: number;
  insurance: number;
  deduction: number;
  totalTax: number;
  afterTaxIncome: number;
  plan: 'separate' | 'combined';
  planName: string;
  blindZoneAvoided: boolean;
  calculationSteps: CalculationStep[];
}

// 计算最优拆分方案（避开盲区）
export function calculateOptimalSplit(
  totalIncome: number,
  insurance: number,
  deduction: number
): OptimalSplitResult {
  // 寻找最优的工资和年终奖分配
  let optimalResult: OptimalSplitResult | null = null;
  let minTax = Infinity;

  // 尝试不同的奖金比例（从0到总收入的100%，步长1000元）
  const step = 1000;
  for (let bonus = 0; bonus <= totalIncome; bonus += step) {
    // salary is calculated but used indirectly through bonus allocation
    // const salary = totalIncome - bonus;

    // 检查是否处于盲区
    const blindCheck = checkBlindZone(bonus);
    let adjustedBonus = bonus;

    // 如果处于盲区，调整到盲区下限
    if (blindCheck.isInBlindZone && blindCheck.zone) {
      adjustedBonus = blindCheck.zone.min;
    }

    const adjustedSalary = totalIncome - adjustedBonus;

    // 计算两种方案
    const separateResult = calculateSeparateTax(adjustedSalary, adjustedBonus, insurance, deduction);
    const combinedResult = calculateCombinedTax(adjustedSalary, adjustedBonus, insurance, deduction);

    // 选择税额较低的方案
    const isSeparateBetter = separateResult.totalTax <= combinedResult.totalTax;
    const currentTax = isSeparateBetter ? separateResult.totalTax : combinedResult.totalTax;

    if (currentTax < minTax) {
      minTax = currentTax;

      // 生成计算步骤
      const steps: CalculationStep[] = [
        { description: '税前年度总收入', formula: '输入总额', value: totalIncome },
        { description: '建议工资部分', formula: '优化分配', value: adjustedSalary },
        { description: '建议年终奖部分', formula: '优化分配', value: adjustedBonus },
        { description: '专项扣除（三险一金）', formula: '', value: insurance },
        { description: '专项附加扣除', formula: '', value: deduction },
        { description: '基本减除费用', formula: '60,000元/年', value: 60000 },
      ];

      if (isSeparateBetter) {
        steps.push(
          { description: '工资应纳税所得额', formula: `${adjustedSalary} - 60,000 - ${insurance} - ${deduction}`, value: separateResult.salaryTaxableIncome },
          { description: '工资适用税率', formula: `${(separateResult.salaryRate * 100).toFixed(0)}%`, value: separateResult.salaryRate },
          { description: '工资应纳税额', formula: '', value: separateResult.salaryTax },
          { description: '年终奖应纳税额', formula: '', value: separateResult.bonusTax },
          { description: '总应纳税额', formula: '', value: separateResult.totalTax }
        );
      } else {
        steps.push(
          { description: '综合所得应纳税所得额', formula: `${adjustedSalary} + ${adjustedBonus} - 60,000 - ${insurance} - ${deduction}`, value: combinedResult.taxableIncome },
          { description: '综合所得适用税率', formula: `${(combinedResult.rate * 100).toFixed(0)}%`, value: combinedResult.rate },
          { description: '总应纳税额', formula: '', value: combinedResult.totalTax }
        );
      }

      optimalResult = {
        totalIncome,
        optimalSalary: adjustedSalary,
        optimalBonus: adjustedBonus,
        insurance,
        deduction,
        totalTax: currentTax,
        afterTaxIncome: totalIncome - insurance - deduction - currentTax,
        plan: isSeparateBetter ? 'separate' : 'combined',
        planName: isSeparateBetter ? '年终奖单独计税' : '年终奖并入综合所得',
        blindZoneAvoided: blindCheck.isInBlindZone,
        calculationSteps: steps,
      };
    }
  }

  return optimalResult || {
    totalIncome,
    optimalSalary: totalIncome,
    optimalBonus: 0,
    insurance,
    deduction,
    totalTax: 0,
    afterTaxIncome: totalIncome - insurance - deduction,
    plan: 'combined',
    planName: '年终奖并入综合所得',
    blindZoneAvoided: false,
    calculationSteps: [],
  };
}

// 场景1批量计算：智能拆分
export interface SplitEmployeeData {
  name: string;
  totalIncome: number;
  insurance: number;
  deduction: number;
}

export interface SplitBatchResult extends SplitEmployeeData {
  optimalSalary: number;
  optimalBonus: number;
  totalTax: number;
  afterTaxIncome: number;
  planName: string;
  blindZoneAvoided: boolean;
}

export function batchCalculateSplit(employees: SplitEmployeeData[]): SplitBatchResult[] {
  return employees.map((emp) => {
    const result = calculateOptimalSplit(emp.totalIncome, emp.insurance, emp.deduction);
    return {
      ...emp,
      optimalSalary: result.optimalSalary,
      optimalBonus: result.optimalBonus,
      totalTax: result.totalTax,
      afterTaxIncome: result.afterTaxIncome,
      planName: result.planName,
      blindZoneAvoided: result.blindZoneAvoided,
    };
  });
}

// 场景2批量计算：年末优化
export interface YearEndEmployeeData {
  name: string;
  first11MonthsSalary: number;
  decemberSalary: number;
  yearEndBonus: number;
  insurance: number;
  deduction: number;
}

export interface YearEndBatchResult extends YearEndEmployeeData {
  optimalType: string;
  separateBonus: number;
  mergedBonus: number;
  totalTax: number;
  afterTaxIncome: number;
  taxSaving: number;
}

export function batchCalculateYearEnd(employees: YearEndEmployeeData[]): YearEndBatchResult[] {
  return employees.map((emp) => {
    const scenario: YearEndScenario = {
      first11MonthsSalary: emp.first11MonthsSalary,
      decemberSalary: emp.decemberSalary,
      yearEndBonus: emp.yearEndBonus,
      insurance: emp.insurance,
      deduction: emp.deduction,
    };
    const result = calculateYearEndOptimal(scenario);
    return {
      ...emp,
      optimalType: result.optimal.name,
      separateBonus: result.optimal.separateBonus,
      mergedBonus: result.optimal.mergedBonus,
      totalTax: result.optimal.totalTax,
      afterTaxIncome: result.optimal.afterTaxIncome,
      taxSaving: result.taxSaving,
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
