import { getStateBrackets, getCityTax } from "./stateTaxData"

// Federal tax brackets (2025, single filer)
const FEDERAL_BRACKETS = [
  { min: 0, max: 11925, rate: 0.10 },
  { min: 11925, max: 48475, rate: 0.12 },
  { min: 48475, max: 103350, rate: 0.22 },
  { min: 103350, max: 197300, rate: 0.24 },
  { min: 197300, max: 250525, rate: 0.32 },
  { min: 250525, max: 626350, rate: 0.35 },
  { min: 626350, max: Infinity, rate: 0.37 },
]

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

  // Pre-tax deductions reduce taxable income
  const deduction401k = (gross * (data.retirement401k || 0)) / 100
  const deductionHSA = (data.hsa || 0) * 12
  const deductionHealth = (data.healthInsurance || 0) * 12
  const deductionDental = (data.dental || 0) * 12
  const deductionVision = (data.vision || 0) * 12
  const preTaxDeductions = deduction401k + deductionHSA + deductionHealth + deductionDental + deductionVision

  const taxableIncome = Math.max(0, gross - preTaxDeductions)

  // Tax calculations
  const federalTax = calcBracketTax(taxableIncome, FEDERAL_BRACKETS)
  const stateTax = calcStateTax(taxableIncome, stateCode)
  const cityTax = calcCityTax(taxableIncome, cityName, stateTax)

  // FICA is on gross (not reduced by 401k/HSA)
  const socialSecurity = Math.min(gross, 176100) * 0.062
  const medicare = gross * 0.0145

  const totalTax = federalTax + stateTax + cityTax + socialSecurity + medicare
  const totalDeductions = totalTax + preTaxDeductions
  const annualNet = gross - totalDeductions

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
    preTaxDeductions,
    deduction401k,
    deductionHSA,
    deductionHealth,
    deductionDental,
    deductionVision,
    federalTax,
    stateTax,
    cityTax,
    socialSecurity,
    medicare,
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