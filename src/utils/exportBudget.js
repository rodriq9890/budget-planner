import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import * as XLSX from "xlsx"
import { calculateTaxBreakdown } from "./taxCalculator"

const fmt = (v) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(v)

function getBudgetData(data) {
  const results = calculateTaxBreakdown(data)
  const expenses = data.monthlyExpenses || []
  const monthlySubs = data.monthlySubs || []
  const annualSubs = data.annualSubs || []
  const extraGoals = data.extraGoals || []

  const monthlyEssentials = expenses.filter((e) => e.essential !== false).reduce((sum, e) => sum + (e.amount || 0), 0)
  const monthlySubsTotal = monthlySubs.reduce((sum, s) => sum + (s.amount || 0), 0)
  const annualSubsMonthly = annualSubs.reduce((sum, s) => sum + (s.amount || 0), 0) / 12
  const emergencyDeposit = data.monthlyEmergencyDeposit || 0
  const extraGoalsTotal = extraGoals.reduce((sum, g) => sum + (g.amount || 0), 0)

  const totalNeeds = monthlyEssentials
  const totalWants = monthlySubsTotal + annualSubsMonthly
  const totalSavings = emergencyDeposit + extraGoalsTotal
  const totalSpent = totalNeeds + totalWants + totalSavings
  const remaining = results.monthlyNet - totalSpent

  return {
    results,
    expenses,
    monthlySubs,
    annualSubs,
    extraGoals,
    monthlyEssentials,
    monthlySubsTotal,
    annualSubsMonthly,
    emergencyDeposit,
    extraGoalsTotal,
    totalNeeds,
    totalWants,
    totalSavings,
    totalSpent,
    remaining,
  }
}

export function exportToPDF(data) {
  const b = getBudgetData(data)
  const doc = new jsPDF()
  let y = 20

  // Title
  doc.setFontSize(22)
  doc.setTextColor(16, 185, 129)
  doc.text("Budget Planner", 14, y)
  y += 6
  doc.setFontSize(10)
  doc.setTextColor(150)
  doc.text(`Generated ${new Date().toLocaleDateString()}`, 14, y)
  y += 14

  // Income & Taxes
  doc.setFontSize(14)
  doc.setTextColor(40)
  doc.text("Income & Taxes", 14, y)
  y += 8

  autoTable(doc, {
    startY: y,
    theme: "grid",
    headStyles: { fillColor: [16, 185, 129] },
    body: [
      ["Gross Annual Salary", fmt(data.grossSalary)],
      ["Federal Tax", fmt(b.results.federalTax)],
      ["NY State Tax", fmt(b.results.nyStateTax)],
      ["NYC Tax", fmt(b.results.nycTax)],
      ["Social Security", fmt(b.results.socialSecurity)],
      ["Medicare", fmt(b.results.medicare)],
      ["Total Tax", fmt(b.results.totalTax)],
      ["Pre-Tax Deductions", fmt(b.results.preTaxDeductions)],
      ["Annual Net Income", fmt(b.results.annualNet)],
      ["Monthly Take-Home", fmt(b.results.monthlyNet)],
      ["Per Paycheck", fmt(b.results.biweeklyNet)],
    ],
    columns: [
      { header: "Item", dataKey: 0 },
      { header: "Amount", dataKey: 1 },
    ],
  })
  y = doc.lastAutoTable.finalY + 12

  // Monthly Expenses
  doc.setFontSize(14)
  doc.text("Monthly Expenses (Needs)", 14, y)
  y += 8

  const expenseRows = b.expenses
    .filter((e) => e.amount > 0)
    .map((e) => [e.name, fmt(e.amount)])
  expenseRows.push(["Total", fmt(b.monthlyEssentials)])

  autoTable(doc, {
    startY: y,
    theme: "grid",
    headStyles: { fillColor: [59, 130, 246] },
    body: expenseRows,
    columns: [
      { header: "Expense", dataKey: 0 },
      { header: "Per Month", dataKey: 1 },
    ],
  })
  y = doc.lastAutoTable.finalY + 12

  // Subscriptions
  doc.setFontSize(14)
  doc.text("Subscriptions (Wants)", 14, y)
  y += 8

  const subRows = [
    ...b.monthlySubs.filter((s) => s.amount > 0).map((s) => [s.name, fmt(s.amount), "Monthly"]),
    ...b.annualSubs.filter((s) => s.amount > 0).map((s) => [s.name, fmt(s.amount / 12), `Annual (${fmt(s.amount)}/yr)`]),
  ]
  subRows.push(["Total", fmt(b.totalWants), ""])

  autoTable(doc, {
    startY: y,
    theme: "grid",
    headStyles: { fillColor: [168, 85, 247] },
    body: subRows,
    columns: [
      { header: "Subscription", dataKey: 0 },
      { header: "Per Month", dataKey: 1 },
      { header: "Billing", dataKey: 2 },
    ],
  })
  y = doc.lastAutoTable.finalY + 12

  // Check if we need a new page
  if (y > 230) {
    doc.addPage()
    y = 20
  }

  // Savings
  doc.setFontSize(14)
  doc.text("Savings", 14, y)
  y += 8

  const savingsRows = []
  if (b.emergencyDeposit > 0) savingsRows.push(["Emergency Fund", fmt(b.emergencyDeposit)])
  b.extraGoals.filter((g) => g.amount > 0).forEach((g) => savingsRows.push([g.name, fmt(g.amount)]))
  savingsRows.push(["Total", fmt(b.totalSavings)])

  autoTable(doc, {
    startY: y,
    theme: "grid",
    headStyles: { fillColor: [16, 185, 129] },
    body: savingsRows,
    columns: [
      { header: "Goal", dataKey: 0 },
      { header: "Per Month", dataKey: 1 },
    ],
  })
  y = doc.lastAutoTable.finalY + 12

  // Summary
  if (y > 230) {
    doc.addPage()
    y = 20
  }

  doc.setFontSize(14)
  doc.text("Monthly Summary", 14, y)
  y += 8

  const needsPct = b.results.monthlyNet > 0 ? ((b.totalNeeds / b.results.monthlyNet) * 100).toFixed(1) + "%" : "0%"
  const wantsPct = b.results.monthlyNet > 0 ? ((b.totalWants / b.results.monthlyNet) * 100).toFixed(1) + "%" : "0%"
  const savingsPct = b.results.monthlyNet > 0 ? ((b.totalSavings / b.results.monthlyNet) * 100).toFixed(1) + "%" : "0%"
  const remainingPct = b.results.monthlyNet > 0 ? ((b.remaining / b.results.monthlyNet) * 100).toFixed(1) + "%" : "0%"


  autoTable(doc, {
    startY: y,
    theme: "grid",
    headStyles: { fillColor: [55, 65, 81] },
    body: [
      ["Take-Home Pay", fmt(b.results.monthlyNet), "100%"],
      ["Needs", fmt(b.totalNeeds), needsPct],
      ["Wants", fmt(b.totalWants), wantsPct],
      ["Savings", fmt(b.totalSavings), savingsPct],
      ["Remaining", fmt(b.remaining), remainingPct],
    ],
    columns: [
      { header: "Category", dataKey: 0 },
      { header: "Amount", dataKey: 1 },
      { header: "% of Take-Home", dataKey: 2 },
    ],
  })

  doc.save("budget-planner.pdf")
}

export function exportToExcel(data) {
  const b = getBudgetData(data)
  const wb = XLSX.utils.book_new()

  // Income & Taxes sheet
  const taxData = [
    ["Income & Taxes"],
    [],
    ["Item", "Amount"],
    ["Gross Annual Salary", data.grossSalary],
    ["Federal Tax", b.results.federalTax],
    ["NY State Tax", b.results.nyStateTax],
    ["NYC Tax", b.results.nycTax],
    ["Social Security", b.results.socialSecurity],
    ["Medicare", b.results.medicare],
    ["Total Tax", b.results.totalTax],
    [],
    ["Pre-Tax Deductions", b.results.preTaxDeductions],
    ["Annual Net Income", b.results.annualNet],
    ["Monthly Take-Home", b.results.monthlyNet],
    ["Per Paycheck (Bi-Weekly)", b.results.biweeklyNet],
    [],
    ["Effective Tax Rate", b.results.totalTax / data.grossSalary],
  ]
  const taxSheet = XLSX.utils.aoa_to_sheet(taxData)
  taxSheet["B17"] = { t: "n", v: b.results.totalTax / data.grossSalary, z: "0.0%" }
  XLSX.utils.book_append_sheet(wb, taxSheet, "Income & Taxes")

  // Budget sheet
  const budgetData = [
    ["Monthly Budget"],
    [],
    ["NEEDS (Monthly Expenses)"],
    ["Name", "Amount"],
    ...b.expenses.filter((e) => e.amount > 0).map((e) => [e.name, e.amount]),
    ["Total Needs", b.monthlyEssentials],
    [],
    ["WANTS (Subscriptions)"],
    ["Name", "Monthly Cost", "Billing"],
    ...b.monthlySubs.filter((s) => s.amount > 0).map((s) => [s.name, s.amount, "Monthly"]),
    ...b.annualSubs.filter((s) => s.amount > 0).map((s) => [s.name, s.amount / 12, `Annual (${fmt(s.amount)}/yr)`]),
    ["Total Wants", b.totalWants],
    [],
    ["SAVINGS"],
    ["Name", "Monthly Amount"],
    ...(b.emergencyDeposit > 0 ? [["Emergency Fund", b.emergencyDeposit]] : []),
    ...b.extraGoals.filter((g) => g.amount > 0).map((g) => [g.name, g.amount]),
    ["Total Savings", b.totalSavings],
    [],
    ["SUMMARY"],
    ["Category", "Amount", "% of Take-Home"],
    ["Take-Home Pay", b.results.monthlyNet, 1],
    ["Needs", b.totalNeeds, b.results.monthlyNet > 0 ? b.totalNeeds / b.results.monthlyNet : 0],
    ["Wants", b.totalWants, b.results.monthlyNet > 0 ? b.totalWants / b.results.monthlyNet : 0],
    ["Savings", b.totalSavings, b.results.monthlyNet > 0 ? b.totalSavings / b.results.monthlyNet : 0],
    ["Remaining", b.remaining, b.results.monthlyNet > 0 ? b.remaining / b.results.monthlyNet : 0],
  ]
  const budgetSheet = XLSX.utils.aoa_to_sheet(budgetData)
  XLSX.utils.book_append_sheet(wb, budgetSheet, "Budget")

  // Emergency Fund sheet
  if (data.monthlyEmergencyDeposit > 0) {
    const monthlyRate = (data.hysaApy || 0) / 100 / 12
    const target = b.monthlyEssentials * (data.emergencyMonths || 0)
    let balance = data.currentSavings || 0
    const projData = [
      ["Emergency Fund Projection"],
      [],
      ["Target", target],
      ["Current Savings", data.currentSavings || 0],
      ["Monthly Deposit", data.monthlyEmergencyDeposit],
      ["HYSA APY", (data.hysaApy || 0) / 100],
      [],
      ["Month", "Start Balance", "Deposit", "Interest", "End Balance"],
    ]
    for (let i = 1; i <= 24; i++) {
      const start = balance
      const interest = balance * monthlyRate
      balance += data.monthlyEmergencyDeposit + interest
      const d = new Date()
      d.setMonth(d.getMonth() + i)
      projData.push([
        d.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
        start,
        data.monthlyEmergencyDeposit,
        interest,
        balance,
      ])
    }
    const efSheet = XLSX.utils.aoa_to_sheet(projData)
    efSheet["B6"] = { t: "n", v: (data.hysaApy || 0) / 100, z: "0.0%" }
    XLSX.utils.book_append_sheet(wb, efSheet, "Emergency Fund")
  }

  XLSX.writeFile(wb, "budget-planner.xlsx")
}