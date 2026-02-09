// 反向个税筹划 - 从总收入自动拆分最优方案

import {
  taxBlindZones,
  calculateSeparateTax,
  calculateCombinedTax,
  formatMoney as formatMoneyBase,
} from './taxCalculator';

// 导出formatMoney
export const formatMoney = formatMoneyBase;

// 专项附加扣除配置
export interface DeductionConfig {
  // 子女教育 (每个子女2000元/月 = 24000元/年)
  childrenEducation: number; // 子女数量
  // 3岁以下婴幼儿照护 (每个2000元/月 = 24000元/年)
  childcare: number; // 婴幼儿数量
  // 继续教育 (学历教育400元/月 = 4800元/年，职业资格3600元/年)
  continuingEducation: 'none' | 'degree' | 'certificate';
  // 大病医疗 (最高80000元/年，这里用预估)
  medicalExpenses: number;
  // 住房贷款利息 (1000元/月 = 12000元/年)
  housingLoan: boolean;
  // 住房租金 (按城市级别)
  housingRent: 'none' | 'small' | 'medium' | 'large'; // 800/1100/1500元/月
  // 赡养老人 (独生子女3000元/月 = 36000元/年，非独生子女分摊)
  elderlyCare: 'none' | 'onlyChild' | 'shared';
  // 个人养老金 (最高12000元/年)
  personalPension: number;
}

// 默认扣除配置
export const defaultDeductionConfig: DeductionConfig = {
  childrenEducation: 0,
  childcare: 0,
  continuingEducation: 'none',
  medicalExpenses: 0,
  housingLoan: false,
  housingRent: 'none',
  elderlyCare: 'none',
  personalPension: 0,
};

// 计算专项附加扣除总额
export function calculateDeductions(config: DeductionConfig): number {
  let total = 0;

  // 子女教育: 2000元/月 × 12月 × 子女数
  total += config.childrenEducation * 2000 * 12;

  // 3岁以下婴幼儿照护: 2000元/月 × 12月 × 婴幼儿数
  total += config.childcare * 2000 * 12;

  // 继续教育
  if (config.continuingEducation === 'degree') {
    total += 400 * 12; // 4800元/年
  } else if (config.continuingEducation === 'certificate') {
    total += 3600; // 3600元/年
  }

  // 大病医疗
  total += Math.min(config.medicalExpenses, 80000);

  // 住房贷款利息: 1000元/月 × 12月
  if (config.housingLoan) {
    total += 1000 * 12;
  }

  // 住房租金
  if (config.housingRent === 'small') {
    total += 800 * 12; // 9600元/年
  } else if (config.housingRent === 'medium') {
    total += 1100 * 12; // 13200元/年
  } else if (config.housingRent === 'large') {
    total += 1500 * 12; // 18000元/年
  }

  // 赡养老人
  if (config.elderlyCare === 'onlyChild') {
    total += 3000 * 12; // 36000元/年
  } else if (config.elderlyCare === 'shared') {
    total += 1500 * 12; // 分摊假设平均1500元/月 = 18000元/年
  }

  // 个人养老金
  total += Math.min(config.personalPension, 12000);

  return total;
}

// 获取扣除配置说明
export function getDeductionDescription(config: DeductionConfig): string[] {
  const descriptions: string[] = [];

  if (config.childrenEducation > 0) {
    descriptions.push(`子女教育: ${config.childrenEducation}个子女 × ¥24,000 = ¥${(config.childrenEducation * 24000).toLocaleString()}`);
  }
  if (config.childcare > 0) {
    descriptions.push(`婴幼儿照护: ${config.childcare}个婴幼儿 × ¥24,000 = ¥${(config.childcare * 24000).toLocaleString()}`);
  }
  if (config.continuingEducation === 'degree') {
    descriptions.push(`继续教育(学历): ¥4,800`);
  } else if (config.continuingEducation === 'certificate') {
    descriptions.push(`继续教育(证书): ¥3,600`);
  }
  if (config.medicalExpenses > 0) {
    descriptions.push(`大病医疗: ¥${config.medicalExpenses.toLocaleString()}`);
  }
  if (config.housingLoan) {
    descriptions.push(`住房贷款利息: ¥12,000`);
  }
  if (config.housingRent === 'small') {
    descriptions.push(`住房租金(小城市): ¥9,600`);
  } else if (config.housingRent === 'medium') {
    descriptions.push(`住房租金(中等城市): ¥13,200`);
  } else if (config.housingRent === 'large') {
    descriptions.push(`住房租金(大城市): ¥18,000`);
  }
  if (config.elderlyCare === 'onlyChild') {
    descriptions.push(`赡养老人(独生子女): ¥36,000`);
  } else if (config.elderlyCare === 'shared') {
    descriptions.push(`赡养老人(分摊): ¥18,000`);
  }
  if (config.personalPension > 0) {
    descriptions.push(`个人养老金: ¥${Math.min(config.personalPension, 12000).toLocaleString()}`);
  }

  return descriptions;
}

// 避开个税盲区的年终奖调整
export function avoidBlindZone(bonus: number): {
  adjustedBonus: number;
  isAdjusted: boolean;
  originalBonus: number;
  message: string;
} {
  for (const zone of taxBlindZones) {
    if (bonus > zone.min && bonus < zone.max) {
      // 处于盲区，建议调整到盲区下限
      return {
        adjustedBonus: zone.min,
        isAdjusted: true,
        originalBonus: bonus,
        message: `年终奖 ¥${formatMoney(bonus)} 处于个税盲区，建议调整为 ¥${formatMoney(zone.min)}，可节税 ¥${formatMoney(zone.loss)}`,
      };
    }
  }
  return {
    adjustedBonus: bonus,
    isAdjusted: false,
    originalBonus: bonus,
    message: '',
  };
}

// 反向筹划结果
export interface ReversePlanResult {
  totalIncome: number;
  optimalSalary: number;
  optimalBonus: number;
  insurance: number;
  specialDeduction: number;
  basicDeduction: number;
  taxableIncome: number;
  totalTax: number;
  afterTaxIncome: number;
  method: 'separate' | 'combined';
  methodName: string;
  blindZoneAdjusted: boolean;
  blindZoneMessage: string;
  salaryTax: number;
  bonusTax: number;
  effectiveTaxRate: number;
  savingsVsWorst: number;
}

// 智能反向个税筹划 - 从总收入计算最优拆分
export function calculateReversePlan(
  totalIncome: number,
  insurance: number,
  deductionConfig: DeductionConfig
): ReversePlanResult {
  const basicDeduction = 60000; // 基本减除费用 5000元/月 × 12月
  const specialDeduction = calculateDeductions(deductionConfig);

  // 策略1: 尝试各种年终奖金额，找到最优方案
  let bestResult: ReversePlanResult | null = null;

  // 年终奖候选值：包括盲区临界点和各种税率临界点
  const bonusCandidates = [
    0,
    30000,
    36000, // 盲区起点
    38566.67, // 盲区终点
    100000,
    144000, // 盲区起点
    160500, // 盲区终点
    200000,
    300000, // 盲区起点
    318333.33, // 盲区终点
    400000,
    420000, // 盲区起点
    447500, // 盲区终点
    500000,
    660000, // 盲区起点
    706538.46, // 盲区终点
    800000,
    960000, // 盲区起点
    1120000, // 盲区终点
  ];

  // 也尝试一些中间值
  for (let bonus = 0; bonus <= totalIncome; bonus += 10000) {
    bonusCandidates.push(bonus);
  }

  // 去重并排序
  const uniqueCandidates = [...new Set(bonusCandidates)]
    .filter((b) => b <= totalIncome)
    .sort((a, b) => a - b);

  for (const bonus of uniqueCandidates) {
    const salary = totalIncome - bonus;
    if (salary < 0) continue;

    // 计算单独计税方案
    const separateResult = calculateSeparateTax(salary, bonus, insurance, specialDeduction);

    // 计算合并计税方案
    const combinedResult = calculateCombinedTax(salary, bonus, insurance, specialDeduction);

    // 选择更优的方案
    const isSeparateBetter = separateResult.totalTax <= combinedResult.totalTax;
    const optimalResult = isSeparateBetter ? separateResult : combinedResult;

    // 检查是否处于盲区
    const blindZoneCheck = avoidBlindZone(bonus);

    if (!bestResult || optimalResult.totalTax < bestResult.totalTax) {
      bestResult = {
        totalIncome,
        optimalSalary: salary,
        optimalBonus: blindZoneCheck.adjustedBonus,
        insurance,
        specialDeduction,
        basicDeduction,
        taxableIncome: isSeparateBetter
          ? separateResult.salaryTaxableIncome
          : combinedResult.taxableIncome,
        totalTax: optimalResult.totalTax,
        afterTaxIncome: totalIncome - insurance - specialDeduction - optimalResult.totalTax,
        method: isSeparateBetter ? 'separate' : 'combined',
        methodName: isSeparateBetter ? '单独计税' : '合并计税',
        blindZoneAdjusted: blindZoneCheck.isAdjusted,
        blindZoneMessage: blindZoneCheck.message,
        salaryTax: separateResult.salaryTax,
        bonusTax: separateResult.bonusTax,
        effectiveTaxRate: optimalResult.totalTax / totalIncome,
        savingsVsWorst: 0, // 稍后计算
      };
    }
  }

  // 计算相比最差方案节省的税额
  if (bestResult) {
    const worstCase = calculateCombinedTax(totalIncome, 0, insurance, specialDeduction);
    bestResult.savingsVsWorst = worstCase.totalTax - bestResult.totalTax;
  }

  return bestResult!;
}

// 快速估算 - 不考虑盲区优化
export function quickEstimate(
  totalIncome: number,
  insurance: number,
  specialDeduction: number
): {
  salary: number;
  bonus: number;
  totalTax: number;
  afterTaxIncome: number;
  method: string;
} {
  // 简单策略：年终奖设为36000元（最低税率档）
  const defaultBonus = Math.min(36000, totalIncome * 0.1);
  const salary = totalIncome - defaultBonus;

  const separateResult = calculateSeparateTax(salary, defaultBonus, insurance, specialDeduction);
  const combinedResult = calculateCombinedTax(salary, defaultBonus, insurance, specialDeduction);

  const isSeparateBetter = separateResult.totalTax <= combinedResult.totalTax;
  const result = isSeparateBetter ? separateResult : combinedResult;

  return {
    salary,
    bonus: defaultBonus,
    totalTax: result.totalTax,
    afterTaxIncome: totalIncome - insurance - specialDeduction - result.totalTax,
    method: isSeparateBetter ? '单独计税' : '合并计税',
  };
}

// 生成筹划建议
export function generatePlanningAdvice(result: ReversePlanResult): string[] {
  const advices: string[] = [];

  // 基本建议
  advices.push(`建议将总收入 ¥${formatMoney(result.totalIncome)} 拆分为：`);
  advices.push(`• 年度工资：¥${formatMoney(result.optimalSalary)}`);
  advices.push(`• 年终奖：¥${formatMoney(result.optimalBonus)}`);

  // 计税方式建议
  advices.push(`• 采用「${result.methodName}」方式`);

  // 盲区警告
  if (result.blindZoneAdjusted) {
    advices.push(`⚠️ ${result.blindZoneMessage}`);
  }

  // 节税效果
  if (result.savingsVsWorst > 0) {
    advices.push(`💰 相比最差方案可节税 ¥${formatMoney(result.savingsVsWorst)}`);
  }

  // 税率分析
  const effectiveRate = (result.effectiveTaxRate * 100).toFixed(2);
  advices.push(`📊 实际税负率：${effectiveRate}%`);

  return advices;
}
