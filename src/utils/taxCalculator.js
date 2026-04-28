import { getStateBrackets, getCityTax } from "./stateTaxData"

// Federal tax brackets (2025, single filer — IRS Rev. Proc. 2024-40)
// Boundaries are aligned so each bracket's min equals the previous bracket's max.
const FEDERAL_BRACKETS = [
  { min: 0,       max: 11925,   rate: 0.10 },
  { min: 11925,   max: 48475,   rate: 0.12 },
  { min: 48475,   max: 103350,  rate: 0.22 },
  { min: 103350,  max: 197300,  rate: 0.24 },
  { min: 197300,  max: 250525,  rate: 0.32 },
  { min: 250525,  max: 626350,  rate: 0.35 },
  { min: 626350,  max: Infinity, rate: 0.37 },
]

// 2025 standard deduction (single). The IRS Percentage Method (Pub 15-T)
// subtracts this before applying brackets — without it federal tax is over-withheld.
const FEDERAL_STANDARD_DEDUCTION = 15000

function calcBracketTax(income, brackets) {
  let tax = 0
  for (const bracket of brackets) {
    if (income <= bracket.min) break
    const taxableInBracket = Math.min(income, bracket.max) - bracket.min
    tax += taxableInBracket * bracket.rate
  }
  return tax
}

function calcStateTax(taxableIncome, stateCode) {
  const stateData = getStateBrackets(stateCode)
  if (!stateData) return 0
  if (stateData.type === "none") return 0
  if (stateData.type === "flat") return taxableIncome * stateData.rate
  if (stateData.type === "progressive") return calcBracketTax(taxableIncome, stateData.brackets)
  return 0
}

function calcCityTax(taxableIncome, cityName, stateTaxAmount) {
  const cityData = getCityTax(cityName)
  if (!cityData) return 0

  if (cityData.brackets) {
    return calcBracketTax(taxableIncome, cityData.brackets)
  }
  if (cityData.flatRate) {
    return taxableIncome * cityData.flatRate
  }
  if (cityData.surchargeType === "percent_of_state") {
    return stateTaxAmount * cityData.surchargeRate
  }
  return 0
}

export function calculateTaxBreakdown(data) {
  const gross = data.grossSalary || 0
  const stateCode = data.stateCode || "NY"
  const cityName = data.cityName || null

  // Roth 401k is post-tax and does NOT reduce taxable income; traditional does
  const isRoth = data.is401kRoth || false
  const deduction401k = isRoth ? 0 : (gross * (data.retirement401k || 0)) / 100
  const roth401k = isRoth ? (gross * (data.retirement401k || 0)) / 100 : 0

  const deductionHSA = (data.hsa || 0) * 12
  const deductionHealth = (data.healthInsurance || 0) * 12
  const deductionDental = (data.dental || 0) * 12
  const deductionVision = (data.vision || 0) * 12
  const preTaxDeductions = deduction401k + deductionHSA + deductionHealth + deductionDental + deductionVision

  const taxableIncome = Math.max(0, gross - preTaxDeductions)

  // Federal: IRS Percentage Method subtracts standard deduction before brackets
  const federalTaxableIncome = Math.max(0, taxableIncome - FEDERAL_STANDARD_DEDUCTION)
  const federalTax = calcBracketTax(federalTaxableIncome, FEDERAL_BRACKETS)
  const stateTax = calcStateTax(taxableIncome, stateCode)
  const cityTax = calcCityTax(taxableIncome, cityName, stateTax)

  // FICA is on gross (not reduced by 401k/HSA)
  const socialSecurity = Math.min(gross, 176100) * 0.062
  const medicare = gross * 0.0145

  // NY-specific payroll taxes (apply to gross wages)
  // NY SDI: $0.60/week employee contribution, capped at $31.20/year (2026)
  // NY PFL: 0.432% of wages (2026 empirical rate from NYDFS; updates annually)
  const nySDI = stateCode === "NY" ? Math.min(gross * 0.006, 31.20) : 0
  const nyPFL = stateCode === "NY" ? Math.min(gross * 0.00432, 400) : 0

  const totalTax = federalTax + stateTax + cityTax + socialSecurity + medicare + nySDI + nyPFL
  const totalDeductions = totalTax + preTaxDeductions
  const annualNet = gross - totalDeductions - roth401k

  // Get labels for display
  const stateData = getStateBrackets(stateCode)
  const hasStateTax = stateData && stateData.type !== "none"
  const payFrequency = data.payFrequency || "biweekly"
  const paychecksPerYear = {
    weekly: 52,
    biweekly: 26,
    semimonthly: 24,
    monthly: 12,
  }[payFrequency]

  return {
    gross,
    taxableIncome,
    federalTaxableIncome,
    federalStandardDeduction: FEDERAL_STANDARD_DEDUCTION,
    preTaxDeductions,
    deduction401k,
    deductionHSA,
    deductionHealth,
    deductionDental,
    deductionVision,
    roth401k,
    isRoth,
    federalTax,
    stateTax,
    cityTax,
    socialSecurity,
    medicare,
    nySDI,
    nyPFL,
    totalTax,
    totalDeductions,
    annualNet,
    monthlyNet: annualNet / 12,
    biweeklyNet: annualNet / paychecksPerYear,
    paychecksPerYear,
    payFrequency,
    stateCode,
    cityName,
    hasStateTax,
  }}