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

// NY State brackets (2025, single filer)
const NY_STATE_BRACKETS = [
  { min: 0, max: 8500, rate: 0.04 },
  { min: 8500, max: 11700, rate: 0.045 },
  { min: 11700, max: 13900, rate: 0.0525 },
  { min: 13900, max: 80650, rate: 0.0585 },
  { min: 80650, max: 215400, rate: 0.0625 },
  { min: 215400, max: 1077550, rate: 0.0685 },
  { min: 1077550, max: Infinity, rate: 0.0882 },
]

// NYC city tax brackets (2025)
const NYC_BRACKETS = [
  { min: 0, max: 12000, rate: 0.03078 },
  { min: 12000, max: 25000, rate: 0.03762 },
  { min: 25000, max: 50000, rate: 0.03819 },
  { min: 50000, max: Infinity, rate: 0.03876 },
]

// This function applies progressive bracket math
// Same logic your spreadsheet does, but explicit
function calcBracketTax(income, brackets) {
  let tax = 0
  for (const bracket of brackets) {
    if (income <= bracket.min) break
    const taxableInBracket = Math.min(income, bracket.max) - bracket.min
    tax += taxableInBracket * bracket.rate
  }
  return tax
}

export function calculateTaxBreakdown(data) {
  const gross = data.grossSalary || 0

  // Pre-tax deductions reduce taxable income
  const preTaxDeductions =
    (gross * (data.retirement401k || 0)) / 100 +
    (data.hsa || 0) * 12 +
    (data.healthInsurance || 0) * 12 +
    (data.dental || 0) * 12 +
    (data.vision || 0) * 12

  const taxableIncome = Math.max(0, gross - preTaxDeductions)

  // Tax calculations
  const federalTax = calcBracketTax(taxableIncome, FEDERAL_BRACKETS)
  const nyStateTax = calcBracketTax(taxableIncome, NY_STATE_BRACKETS)
  const nycTax = calcBracketTax(taxableIncome, NYC_BRACKETS)

  // FICA is on gross (not reduced by 401k/HSA)
  const socialSecurity = Math.min(gross, 176100) * 0.062
  const medicare = gross * 0.0145

  const totalTax = federalTax + nyStateTax + nycTax + socialSecurity + medicare
  const totalDeductions = totalTax + preTaxDeductions
  const annualNet = gross - totalDeductions

  return {
    gross,
    taxableIncome,
    preTaxDeductions,
    federalTax,
    nyStateTax,
    nycTax,
    socialSecurity,
    medicare,
    totalTax,
    totalDeductions,
    annualNet,
    monthlyNet: annualNet / 12,
    biweeklyNet: annualNet / 26,
  }
}