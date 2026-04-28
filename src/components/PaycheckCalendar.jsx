import { useState } from "react"
import { calculateTaxBreakdown } from "../utils/taxCalculator"
import IncomeBar from "./IncomeBar"

function MonthCard({ month, t, isDark, isHourly, hoursPerDay, totalMonthlyCommitted, committedBreakdown, fmt, updateActual, updateActualIncome, payFrequency, hourlyRate, effectiveTaxRate, biweeklyNet, isPast, onExport, showActualIncome }) {
  const [showCommitted, setShowCommitted] = useState(false)
  const isBonus = payFrequency === "biweekly"
    ? month.paychecks.length > 2
    : payFrequency === "weekly"
    ? month.paychecks.length > 4
    : false

  const prevMonthName = month.index > 0
    ? new Date(2000, month.index - 1, 1).toLocaleDateString("en-US", { month: "short" })
    : "Dec"
  const hasCarryover = month.carryover !== 0
  const adjustedSurplus = month.surplus + month.carryover

  return (
    <div
      className={`border rounded-xl p-4 space-y-3 ${t.card} ${
        isBonus ? (isDark ? "border-emerald-800" : "border-emerald-300") : ""
      }`}
    >
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">
          {month.name}{month.showYear ? ` '${String(month.year).slice(2)}` : ""}
        </h3>
        <div className="flex items-center gap-2">
          {isBonus && (
            <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">
              Bonus
            </span>
          )}
          <span className={`text-xs ${t.subtle}`}>
            {month.paychecks.length} paycheck{month.paychecks.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      <div className="space-y-1.5 text-sm">
        <div className="flex justify-between">
          <span className={t.muted}>Income</span>
          <div className="flex items-center gap-1.5">
            {month.isIncomeActual && (
              <span className={`text-xs opacity-60 ${t.subtle}`}>actual</span>
            )}
            <span className="text-emerald-400 font-medium">{fmt(month.totalIncome)}</span>
          </div>
        </div>
        <div
          className="relative flex justify-between cursor-default"
          onMouseEnter={() => setShowCommitted(true)}
          onMouseLeave={() => setShowCommitted(false)}
        >
          {showCommitted && committedBreakdown && (
            <div
              className={`absolute bottom-full left-0 mb-2 z-50 min-w-[200px] rounded-lg border shadow-xl text-xs ${t.card}`}
              style={{ pointerEvents: "none" }}
            >
              <div className="px-3 py-2 space-y-1.5">
                {committedBreakdown.expenses > 0 && (
                  <div className="flex justify-between gap-4">
                    <span className={t.muted}>Fixed Expenses</span>
                    <span className="font-medium">{fmt(committedBreakdown.expenses)}</span>
                  </div>
                )}
                {committedBreakdown.subscriptions > 0 && (
                  <div className="flex justify-between gap-4">
                    <span className={t.muted}>Subscriptions</span>
                    <span className="font-medium">{fmt(committedBreakdown.subscriptions)}</span>
                  </div>
                )}
                {committedBreakdown.savings > 0 && (
                  <div className="flex justify-between gap-4">
                    <span className={t.muted}>Savings</span>
                    <span className="font-medium">{fmt(committedBreakdown.savings)}</span>
                  </div>
                )}
              </div>
              <div className={`flex justify-between px-3 py-1.5 border-t font-semibold ${t.border}`}>
                <span className={t.subtle}>Total</span>
                <span>{fmt(totalMonthlyCommitted)}</span>
              </div>
            </div>
          )}
          <span className={`underline decoration-dashed underline-offset-2 ${t.muted}`}>Committed</span>
          <span>{fmt(totalMonthlyCommitted)}</span>
        </div>
        <div className={`flex justify-between border-t pt-1.5 ${t.border}`}>
          <span className={t.muted}>Surplus</span>
          <span className={month.surplus >= 0 ? "text-emerald-400" : "text-red-400"}>
            {fmt(month.surplus)}
          </span>
        </div>
        {hasCarryover && (
          <div className="flex justify-between text-xs">
            <span className={month.carryover > 0 ? "text-emerald-400 opacity-80" : "text-red-400 opacity-80"}>
              ↳ {month.carryover > 0 ? "+" : "−"}{fmt(Math.abs(month.carryover))} from {prevMonthName}
            </span>
            <span className={adjustedSurplus >= 0 ? "text-emerald-400 font-medium" : "text-red-400 font-medium"}>
              {fmt(adjustedSurplus)}
            </span>
          </div>
        )}
      </div>

      <div className={`border-t pt-3 space-y-3 ${t.border}`}>
        {showActualIncome && (
          <label className="block">
            <span className={`text-xs ${t.subtle}`}>Actual Income</span>
            <div className="relative mt-1">
              <span className={`absolute left-2.5 top-1/2 -translate-y-1/2 text-xs ${t.subtle}`}>$</span>
              <input
                type="number"
                value={month.actualIncomeInput ?? ""}
                onChange={(e) => updateActualIncome(month.incomeKey, e.target.value)}
                placeholder={String(Math.round(month.calculatedIncome))}
                className={`w-full rounded-lg pl-7 pr-3 py-1.5 text-sm border focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 ${t.input}`}
              />
            </div>
            {month.isIncomeActual && (
              <p className={`text-xs mt-0.5 ${t.subtle}`}>Calculated: {fmt(month.calculatedIncome)}</p>
            )}
          </label>
        )}
        <label className="block">
          <span className={`text-xs ${t.subtle}`}>Actual Spent</span>
          <div className="relative mt-1">
            <span className={`absolute left-2.5 top-1/2 -translate-y-1/2 text-xs ${t.subtle}`}>$</span>
            <input
              type="number"
              value={month.actual ?? ""}
              onChange={(e) => updateActual(month.key, e.target.value)}
              placeholder="—"
              className={`w-full rounded-lg pl-7 pr-3 py-1.5 text-sm border focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 ${t.input}`}
            />
          </div>
        </label>
        {month.actual !== null && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className={t.subtle}>
                {month.actual <= month.totalIncome ? "Under budget" : "Over budget"}
              </span>
              <span className={month.actual <= month.totalIncome ? "text-emerald-400" : "text-red-400"}>
                {fmt(Math.abs(month.totalIncome - month.actual))}
              </span>
            </div>
            {hasCarryover && (
              <div className="flex justify-between text-xs">
                <span className={t.subtle}>Net w/ carryover</span>
                <span className={(month.totalIncome + month.carryover - month.actual) >= 0 ? "text-emerald-400 font-medium" : "text-red-400 font-medium"}>
                  {fmt(month.totalIncome + month.carryover - month.actual)}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className={`text-xs ${t.subtle} space-y-1`}>
        <div className="flex justify-between">
          <span>{month.workingDays} working days{isHourly ? ` (${(month.workingDays * hoursPerDay).toFixed(0)} hrs)` : ""}</span>
        </div>

        {isHourly ? (
          <div className={`border-t pt-1 space-y-0.5 ${t.border}`}>
            {month.paycheckDetails && month.paycheckDetails.length > 0 ? (
              <>
                <div className={`pb-0.5 ${t.subtle}`}>
                  ${hourlyRate}/hr · {(effectiveTaxRate * 100).toFixed(1)}% withheld
                </div>
                {month.paycheckDetails.map((p, i) => (
                  <div key={i} className={`flex justify-between pt-0.5 ${i > 0 ? `border-t ${t.border}` : ""}`}>
                    <span>
                      {p.date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      {" "}· {p.workingDays}d · {p.hours.toFixed(0)} hrs · ${fmt(p.hours * hourlyRate).replace("$", "")} gross
                    </span>
                    <span className="text-emerald-400 ml-2 shrink-0">{fmt(p.net)}</span>
                  </div>
                ))}
              </>
            ) : (
              <>
                <div className="flex justify-between">
                  <span>${hourlyRate}/hr × {(month.workingDays * hoursPerDay).toFixed(0)} hrs</span>
                  <span>{fmt(month.workingDays * hoursPerDay * hourlyRate)} gross</span>
                </div>
                <div className="flex justify-between">
                  <span>− {(effectiveTaxRate * 100).toFixed(1)}% tax</span>
                  <span className="text-emerald-400">{fmt(month.totalIncome)} net</span>
                </div>
                <div>
                  {month.paychecks.map((d, i) => (
                    <span key={i}>
                      {d.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      {i < month.paychecks.length - 1 ? " • " : ""}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          <div className={`border-t pt-1 space-y-0.5 ${t.border}`}>
            <div className="flex justify-between">
              <span>{month.paychecks.length} paycheck{month.paychecks.length !== 1 ? "s" : ""} × {fmt(biweeklyNet)}</span>
              <span className="text-emerald-400">{fmt(month.totalIncome)}</span>
            </div>
            <div>
              {month.paychecks.map((d, i) => (
                <span key={i}>
                  {d.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  {i < month.paychecks.length - 1 ? " • " : ""}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {isPast && (
        <div className={`border-t pt-2 ${t.border}`}>
          <button
            onClick={onExport}
            className={`text-xs flex items-center gap-1 transition-colors ${
              isDark ? "text-gray-500 hover:text-gray-300" : "text-gray-400 hover:text-gray-600"
            }`}
          >
            ↓ Export month data
          </button>
        </div>
      )}
    </div>
  )
}

function PayBreakdownModal({ results, data, effectiveTaxRate, rothPctAnnual, isHourly, hourlyRate, t, isDark, fmt, onClose }) {
  const gross = results.gross
  if (gross === 0) return null

  const pct = (v) => `${((v / gross) * 100).toFixed(2)}%`

  const taxRows = [
    { label: "Federal Income Tax", value: results.federalTax },
    ...(results.stateTax > 0 ? [{ label: `${results.stateCode} State Tax`, value: results.stateTax }] : []),
    ...(results.cityTax > 0 ? [{ label: `${results.cityName} City Tax`, value: results.cityTax }] : []),
    { label: "Social Security (6.2%)", value: results.socialSecurity },
    { label: "Medicare (1.45%)", value: results.medicare },
    ...(results.nySDI > 0 ? [{ label: "NY SDI (disability ins.)", value: results.nySDI }] : []),
    ...(results.nyPFL > 0 ? [{ label: "NY PFL (paid family leave)", value: results.nyPFL }] : []),
  ]

  const benefitRows = [
    ...(results.deductionHSA > 0 ? [{ label: "HSA (pre-tax)", value: results.deductionHSA }] : []),
    ...(results.deductionHealth > 0 ? [{ label: "Health Insurance (pre-tax)", value: results.deductionHealth }] : []),
    ...(results.deductionDental > 0 ? [{ label: "Dental (pre-tax)", value: results.deductionDental }] : []),
    ...(results.deductionVision > 0 ? [{ label: "Vision (pre-tax)", value: results.deductionVision }] : []),
    ...(!results.isRoth && results.deduction401k > 0 ? [{ label: "401(k) Traditional (pre-tax)", value: results.deduction401k }] : []),
  ]

  const taxRate = results.totalDeductions / gross
  const periodHours = isHourly ? [80, 88, 96] : []

  const Row = ({ label, value, bold }) => (
    <div className={`flex justify-between text-sm ${bold ? "font-semibold" : ""}`}>
      <span className={bold ? "" : t.muted}>{label}</span>
      <div className="flex items-center gap-4">
        <span className={`text-xs w-12 text-right tabular-nums ${t.subtle}`}>{pct(value)}</span>
        <span className={`w-20 text-right tabular-nums ${bold ? "" : "font-medium"}`}>{fmt(value)}</span>
      </div>
    </div>
  )

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
      onClick={onClose}
    >
      <div
        className={`relative w-full max-w-md rounded-2xl border shadow-2xl max-h-[88vh] overflow-y-auto ${t.card}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`sticky top-0 flex items-center justify-between px-5 py-4 border-b ${t.border} ${t.card} rounded-t-2xl`}>
          <h3 className="font-semibold">Pay Withholding Breakdown</h3>
          <button onClick={onClose} className="text-xl leading-none opacity-50 hover:opacity-100">×</button>
        </div>

        <div className="px-5 py-4 space-y-5">
          <div>
            <p className={`text-xs uppercase tracking-wide font-medium mb-2 ${t.subtle}`}>Income Taxes (annual)</p>
            <div className="space-y-1.5">
              {taxRows.map((r, i) => <Row key={i} label={r.label} value={r.value} />)}
              <div className={`border-t pt-2 mt-1 ${t.border}`}>
                <Row label="Tax subtotal" value={results.totalTax} bold />
              </div>
            </div>
          </div>

          {benefitRows.length > 0 && (
            <div>
              <p className={`text-xs uppercase tracking-wide font-medium mb-2 ${t.subtle}`}>Pre-Tax Benefits (annual)</p>
              <div className="space-y-1.5">
                {benefitRows.map((r, i) => <Row key={i} label={r.label} value={r.value} />)}
                {benefitRows.length > 1 && (
                  <div className={`border-t pt-2 mt-1 ${t.border}`}>
                    <Row label="Benefits subtotal" value={results.preTaxDeductions} bold />
                  </div>
                )}
              </div>
            </div>
          )}

          {results.isRoth && results.roth401k > 0 && (
            <div>
              <p className={`text-xs uppercase tracking-wide font-medium mb-2 ${t.subtle}`}>Post-Tax (annual)</p>
              <Row label="Roth 401(k)" value={results.roth401k} />
            </div>
          )}

          <div className={`rounded-xl p-3.5 space-y-2 ${isDark ? "bg-gray-800/60" : "bg-gray-100"}`}>
            <div className="flex justify-between text-sm">
              <span className={t.muted}>Pure tax rate</span>
              <span className="font-semibold">{((results.totalTax / gross) * 100).toFixed(1)}%</span>
            </div>
            <div className={`flex justify-between text-sm border-t pt-2 ${t.border}`}>
              <span className="font-semibold">Total withheld per paycheck</span>
              <span className="font-bold text-lg">{(effectiveTaxRate * 100).toFixed(1)}%</span>
            </div>
            <p className={`text-xs leading-relaxed ${t.subtle}`}>
              The Income &amp; Taxes page shows <strong>{((results.totalTax / gross) * 100).toFixed(1)}%</strong> — taxes only.
              The calendar shows <strong>{(effectiveTaxRate * 100).toFixed(1)}%</strong> — taxes + pre-tax benefits{results.isRoth ? " + Roth 401(k)" : ""}.
              Both are calculated on the same gross; only what's included differs.
            </p>
          </div>

          <div>
            <p className={`text-xs uppercase tracking-wide font-medium mb-3 ${t.subtle}`}>
              {isHourly ? "Gross vs Take-Home by Period" : "Gross vs Take-Home Per Paycheck"}
            </p>
            {isHourly ? (
              <div className="space-y-2">
                {periodHours.map((h) => {
                  const pGross = h * hourlyRate
                  const pTaxBen = pGross * taxRate
                  const pRoth = results.isRoth ? pGross * rothPctAnnual : 0
                  const pNet = pGross - pTaxBen - pRoth
                  return (
                    <div key={h} className={`rounded-lg border p-3 ${t.border} ${isDark ? "bg-gray-800/30" : "bg-gray-50"}`}>
                      <div className="flex justify-between text-sm font-medium mb-1.5">
                        <span>{h} hrs · <span className={t.subtle}>{fmt(pGross)} gross</span></span>
                        <span className="text-emerald-400">{fmt(pNet)} net</span>
                      </div>
                      <div className={`flex gap-4 text-xs ${t.subtle}`}>
                        <span>Taxes &amp; benefits: {fmt(pTaxBen)}</span>
                        {results.isRoth && <span>Roth: {fmt(pRoth)}</span>}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className={`rounded-lg border p-3 ${t.border}`}>
                <div className="flex justify-between text-sm font-medium mb-1">
                  <span className={t.subtle}>{fmt(gross / results.paychecksPerYear)} gross</span>
                  <span className="text-emerald-400">{fmt(results.biweeklyNet)} net</span>
                </div>
                <p className={`text-xs ${t.subtle}`}>
                  Withheld: {fmt(gross / results.paychecksPerYear - results.biweeklyNet)} ({(effectiveTaxRate * 100).toFixed(1)}% of gross)
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function ToggleRow({ show, onToggle, labelExpand, labelCollapse, isDark }) {
  return (
    <button
      onClick={onToggle}
      className={`w-full flex items-center gap-2 text-xs py-2 px-3 rounded-lg border border-dashed transition-colors ${
        isDark
          ? "border-gray-700 text-gray-500 hover:border-gray-500 hover:text-gray-400"
          : "border-gray-300 text-gray-400 hover:border-gray-400 hover:text-gray-500"
      }`}
    >
      <span>{show ? "▲" : "▼"}</span>
      <span>{show ? labelCollapse : labelExpand}</span>
    </button>
  )
}

function PaycheckCalendar({ data, setData, t, isDark }) {
  const results = calculateTaxBreakdown(data)
  const today = new Date()
  const currentYear = today.getFullYear()
  const currentMonth = today.getMonth()
  const currentDay = today.getDate()

  const [selectedYear, setSelectedYear] = useState(currentYear)
  const [showPast, setShowPast] = useState(false)
  const [showFuture, setShowFuture] = useState(false)
  const [showPayBreakdown, setShowPayBreakdown] = useState(false)

  const carryOver = data.carryOverMonths !== false

  const payFrequency = data.payFrequency || "biweekly"
  const monthlyBudget = data.monthlyExpenses?.filter((e) => e.essential !== "variable" && (e.amount || 0) > 0).reduce((sum, e) => sum + (e.amount || 0), 0) || 0
  const effectiveMonthlySub = (s) => Math.max(0, (s.amount || 0) - (s.hasDiscount ? (s.discount || 0) : 0))
  const monthlySubs = (data.monthlySubs?.reduce((sum, s) => sum + effectiveMonthlySub(s), 0) || 0)
    + (data.annualSubs?.reduce((sum, s) => sum + (s.amount || 0) / 12, 0) || 0)
  const monthlySavings = (data.monthlyEmergencyDeposit || 0)
    + (data.extraGoals?.reduce((sum, g) => sum + (g.amount || 0), 0) || 0)
  const totalMonthlyCommitted = monthlyBudget + monthlySubs + monthlySavings
  const committedBreakdown = { expenses: monthlyBudget, subscriptions: monthlySubs, savings: monthlySavings }

  function getPaycheckDates(year) {
    const dates = []
    if (payFrequency === "monthly") {
      for (let m = 0; m < 12; m++) dates.push(new Date(year, m, 1))
    } else if (payFrequency === "semimonthly") {
      for (let m = 0; m < 12; m++) {
        dates.push(new Date(year, m, 1))
        dates.push(new Date(year, m, 15))
      }
    } else if (payFrequency === "biweekly") {
      const start = new Date(year, 0, 1)
      const firstFriday = new Date(year, 0, 1 + ((5 - start.getDay() + 7) % 7))
      let current = new Date(firstFriday)
      while (current.getFullYear() === year) {
        dates.push(new Date(current))
        current.setDate(current.getDate() + 14)
      }
    } else if (payFrequency === "weekly") {
      const start = new Date(year, 0, 1)
      const firstFriday = new Date(year, 0, 1 + ((5 - start.getDay() + 7) % 7))
      let current = new Date(firstFriday)
      while (current.getFullYear() === year) {
        dates.push(new Date(current))
        current.setDate(current.getDate() + 7)
      }
    }
    return dates
  }

  function getWorkingDays(year, month) {
    let count = 0
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    for (let d = 1; d <= daysInMonth; d++) {
      const day = new Date(year, month, d).getDay()
      if (day !== 0 && day !== 6) count++
    }
    return count
  }

  const isHourly = (data.incomeType || "salary") === "hourly"
  const hourlyRate = data.hourlyRate || 0
  const hoursPerDay = (data.hoursPerWeek || 40) / 5

  function buildMonths(year) {
    const yDates = getPaycheckDates(year)
    const ms = Array.from({ length: 12 }, (_, i) => {
      const monthDate = new Date(year, i, 1)
      const monthName = monthDate.toLocaleDateString("en-US", { month: "long" })
      const paychecks = yDates.filter((d) => d.getMonth() === i)
      const workingDays = getWorkingDays(year, i)

      let totalIncome
      let paycheckDetails = []

      const taxRate = results.gross > 0 ? results.totalDeductions / results.gross : 0
      const rothPct = results.isRoth ? (data.retirement401k || 0) / 100 : 0

      if (isHourly && payFrequency === "semimonthly") {
        paychecks.forEach((payDate) => {
          let periodStart, periodEnd
          if (payDate.getDate() <= 1) {
            const prevMonth = i === 0 ? 11 : i - 1
            const prevYear = i === 0 ? year - 1 : year
            const prevMonthDays = new Date(prevYear, prevMonth + 1, 0).getDate()
            periodStart = new Date(prevYear, prevMonth, 16)
            periodEnd = new Date(prevYear, prevMonth, prevMonthDays)
          } else {
            periodStart = new Date(year, i, 1)
            periodEnd = new Date(year, i, 15)
          }
          let periodWorkingDays = 0
          let current = new Date(periodStart)
          while (current <= periodEnd) {
            const day = current.getDay()
            if (day !== 0 && day !== 6) periodWorkingDays++
            current.setDate(current.getDate() + 1)
          }
          const periodHours = periodWorkingDays * hoursPerDay
          const grossPay = periodHours * hourlyRate
          const netPay = grossPay * (1 - taxRate - rothPct)
          paycheckDetails.push({ date: payDate, periodStart, periodEnd, workingDays: periodWorkingDays, hours: periodHours, net: netPay })
        })
        totalIncome = paycheckDetails.reduce((sum, p) => sum + p.net, 0)
      } else if (isHourly) {
        const monthlyHours = workingDays * hoursPerDay
        const grossMonthly = monthlyHours * hourlyRate
        totalIncome = grossMonthly * (1 - taxRate - rothPct)
      } else {
        totalIncome = paychecks.length * results.biweeklyNet
      }

      const calculatedIncome = totalIncome
      const incomeKey = `income_${year}_${i}`
      const actualIncomeInput = data[incomeKey] !== undefined ? Number(data[incomeKey]) : null
      if (actualIncomeInput !== null) totalIncome = actualIncomeInput
      const isIncomeActual = actualIncomeInput !== null

      const surplus = totalIncome - totalMonthlyCommitted
      const key = `actual_${year}_${i}`
      const actual = data[key] ?? null

      return { index: i, name: monthName, paychecks, workingDays, totalIncome, calculatedIncome, incomeKey, actualIncomeInput, isIncomeActual, surplus, actual, key, paycheckDetails, carryover: 0, year, showYear: false }
    })

    if (carryOver) {
      for (let i = 1; i < ms.length; i++) {
        const prev = ms[i - 1]
        if (prev.actual !== null) {
          ms[i].carryover = prev.totalIncome - prev.actual + prev.carryover
        }
      }
    }

    return ms
  }

  const months = buildMonths(selectedYear)

  const isCurrentYear = selectedYear === currentYear
  const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const visibleStart = isCurrentYear ? Math.max(0, currentDay <= 5 ? currentMonth - 1 : currentMonth) : 0
  const isTailEnd = currentDay >= daysInCurrentMonth - 4
  const monthsAhead = isTailEnd ? 4 : 3
  const visibleEnd = isCurrentYear ? Math.min(11, currentMonth + monthsAhead) : 11

  const pastMonths    = isCurrentYear ? months.slice(0, visibleStart) : []
  const visibleMonths = isCurrentYear ? months.slice(visibleStart, visibleEnd + 1) : months
  const futureMonths  = isCurrentYear ? months.slice(visibleEnd + 1) : []

  // When in early months of current year, surface the tail of last year so past records aren't invisible
  const prevYearTailCount = isCurrentYear ? Math.max(0, 3 - visibleStart) : 0
  const prevYearMonths = prevYearTailCount > 0
    ? buildMonths(selectedYear - 1).slice(12 - prevYearTailCount).map((m) => ({ ...m, showYear: true }))
    : []

  const allPastMonths = [...prevYearMonths, ...pastMonths]

  const monthLabel = (idx) => months[idx]?.name.slice(0, 3) ?? ""
  const prevYearLabel = `'${String(selectedYear - 1).slice(2)}`

  const pastLabelStart = prevYearMonths.length > 0
    ? `${prevYearMonths[0].name.slice(0, 3)} ${prevYearLabel}`
    : monthLabel(0)
  const pastLabelEnd = pastMonths.length > 0
    ? monthLabel(visibleStart - 1)
    : `Dec ${prevYearLabel}`

  const fmt = (v) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(v)

  const updateActual = (key, value) => {
    setData({ ...data, [key]: value === "" ? null : Number(value) })
  }

  const updateActualIncome = (key, value) => {
    if (value === "") {
      const { [key]: _removed, ...rest } = data
      setData(rest)
    } else {
      setData({ ...data, [key]: Number(value) })
    }
  }

  function exportMonth(month) {
    const payload = {
      month: month.name,
      year: month.year,
      income: month.totalIncome,
      incomeIsActual: month.isIncomeActual,
      calculatedIncome: month.calculatedIncome,
      committed: totalMonthlyCommitted,
      surplus: month.surplus,
      carryover: month.carryover,
      adjustedSurplus: month.surplus + month.carryover,
      actualSpent: month.actual,
      netResult: month.actual !== null ? month.totalIncome + month.carryover - month.actual : null,
      paychecks: month.paychecks.map((d) => d.toISOString().split("T")[0]),
      workingDays: month.workingDays,
      breakdown: {
        expenses: (data.monthlyExpenses || []).map((e) => ({ name: e.name, amount: e.amount, essential: e.essential })),
        subscriptions: [
          ...(data.monthlySubs || []).map((s) => ({ name: s.name, amount: s.amount, frequency: "monthly" })),
          ...(data.annualSubs || []).map((s) => ({ name: s.name, amount: s.amount, frequency: "annual", monthlyEquivalent: +(s.amount / 12).toFixed(2) })),
        ],
        savings: {
          emergencyFund: data.monthlyEmergencyDeposit || 0,
          goals: (data.extraGoals || []).map((g) => ({ name: g.name, monthlyAmount: g.amount })),
        },
      },
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `budget-${month.year}-${month.name.toLowerCase()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const totalAnnualIncome = months.reduce((sum, m) => sum + m.totalIncome, 0)
  const totalAnnualCommitted = totalMonthlyCommitted * 12
  const totalPaychecks = months.reduce((sum, m) => sum + m.paychecks.length, 0)

  // Show total deduction rate (taxes + benefits + Roth) so the label matches what's actually withheld per check
  const rothPctAnnual = results.isRoth ? (data.retirement401k || 0) / 100 : 0
  const effectiveTaxRate = results.gross > 0 ? results.totalDeductions / results.gross + rothPctAnnual : 0
  const cardProps = {
    t, isDark, isHourly, hoursPerDay, totalMonthlyCommitted, committedBreakdown, fmt, updateActual, updateActualIncome, payFrequency,
    hourlyRate, effectiveTaxRate, biweeklyNet: results.biweeklyNet,
  }

  return (
    <div>
      {showPayBreakdown && (
        <PayBreakdownModal
          results={results}
          data={data}
          effectiveTaxRate={effectiveTaxRate}
          rothPctAnnual={rothPctAnnual}
          isHourly={isHourly}
          hourlyRate={hourlyRate}
          t={t}
          isDark={isDark}
          fmt={fmt}
          onClose={() => setShowPayBreakdown(false)}
        />
      )}
      <IncomeBar data={data} t={t} />
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <h2 className={`text-xl font-semibold mb-1 ${t.heading}`}>Paycheck Calendar</h2>
            <p className={`${t.subtle} text-sm`}>Track your paychecks and actual spending month by month.</p>
          </div>
          <div className="flex items-center gap-3">
            {results.gross > 0 && (
              <button
                onClick={() => setShowPayBreakdown(true)}
                title="View withholding breakdown and gross vs take-home"
                className={`text-xs px-2.5 py-1.5 rounded-lg border transition-colors ${
                  isDark
                    ? "border-gray-700 text-gray-500 hover:border-gray-500 hover:text-gray-300"
                    : "border-gray-300 text-gray-400 hover:border-gray-400 hover:text-gray-600"
                }`}
              >
                {(effectiveTaxRate * 100).toFixed(1)}% withheld ↗
              </button>
            )}
            <button
              onClick={() => setData({ ...data, carryOverMonths: !carryOver })}
              title="Carry over monthly surplus or deficit to the next month"
              className={`text-xs px-2.5 py-1.5 rounded-lg border transition-colors ${
                carryOver
                  ? "border-emerald-500 text-emerald-400 bg-emerald-500/10"
                  : isDark
                  ? "border-gray-700 text-gray-500 hover:border-gray-500"
                  : "border-gray-300 text-gray-400 hover:border-gray-400"
              }`}
            >
              ↻ Carry over {carryOver ? "on" : "off"}
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedYear(selectedYear - 1)}
                className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                  isDark ? "border-gray-700 hover:bg-gray-800" : "border-gray-300 hover:bg-gray-100"
                }`}
              >
                ←
              </button>
              <span className="font-semibold text-lg w-16 text-center">{selectedYear}</span>
              <button
                onClick={() => setSelectedYear(selectedYear + 1)}
                className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                  isDark ? "border-gray-700 hover:bg-gray-800" : "border-gray-300 hover:bg-gray-100"
                }`}
              >
                →
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className={`border rounded-xl p-4 ${t.card}`}>
            <p className={`text-xs uppercase tracking-wide ${t.subtle}`}>Paychecks</p>
            <p className="text-2xl font-bold mt-1">{totalPaychecks}</p>
            <p className={`text-xs ${t.subtle}`}>{payFrequency}</p>
          </div>
          <div className={`border rounded-xl p-4 ${t.card}`}>
            <p className={`text-xs uppercase tracking-wide ${t.subtle}`}>Annual Income</p>
            <p className="text-2xl font-bold text-emerald-400 mt-1">{fmt(totalAnnualIncome)}</p>
            <p className={`text-xs ${t.subtle}`}>{isHourly ? "based on working days" : "net take-home"}</p>
          </div>
          <div className={`border rounded-xl p-4 ${t.card}`}>
            <p className={`text-xs uppercase tracking-wide ${t.subtle}`}>Annual Committed</p>
            <p className="text-2xl font-bold mt-1">{fmt(totalAnnualCommitted)}</p>
            <p className={`text-xs ${t.subtle}`}>expenses + savings</p>
          </div>
          <div className={`border rounded-xl p-4 ${t.card}`}>
            <p className={`text-xs uppercase tracking-wide ${t.subtle}`}>Bonus Months</p>
            <p className="text-2xl font-bold text-emerald-400 mt-1">
              {months.filter((m) =>
                payFrequency === "biweekly" ? m.paychecks.length > 2
                : payFrequency === "weekly" ? m.paychecks.length > 4
                : false
              ).length}
            </p>
            <p className={`text-xs ${t.subtle}`}>months with extra paycheck</p>
          </div>
        </div>

        <div className="space-y-4">
          {allPastMonths.length > 0 && (
            <ToggleRow
              show={showPast}
              isDark={isDark}
              onToggle={() => setShowPast((p) => !p)}
              labelExpand={`Show ${allPastMonths.length} earlier month${allPastMonths.length !== 1 ? "s" : ""} (${pastLabelStart} – ${pastLabelEnd})`}
              labelCollapse={`Hide ${pastLabelStart} – ${pastLabelEnd}`}
            />
          )}

          {showPast && allPastMonths.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {allPastMonths.map((month) => (
                <MonthCard
                  key={`${month.year}-${month.index}`}
                  month={month}
                  {...cardProps}
                  isPast={true}
                  showActualIncome={true}
                  onExport={() => exportMonth(month)}
                />
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {visibleMonths.map((month) => {
              const isMonthPast = isCurrentYear && month.index < currentMonth
              const isMonthCurrent = isCurrentYear && month.index === currentMonth
              return (
                <MonthCard
                  key={month.index}
                  month={month}
                  {...cardProps}
                  isPast={isMonthPast}
                  showActualIncome={isMonthPast || isMonthCurrent || selectedYear < currentYear}
                  onExport={() => exportMonth(month)}
                />
              )
            })}
          </div>

          {futureMonths.length > 0 && (
            <ToggleRow
              show={showFuture}
              isDark={isDark}
              onToggle={() => setShowFuture((p) => !p)}
              labelExpand={`Show ${futureMonths.length} more month${futureMonths.length !== 1 ? "s" : ""} (${monthLabel(visibleEnd + 1)} – Dec)`}
              labelCollapse={`Hide ${monthLabel(visibleEnd + 1)} – Dec`}
            />
          )}

          {showFuture && futureMonths.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {futureMonths.map((month) => (
                <MonthCard
                  key={month.index}
                  month={month}
                  {...cardProps}
                  isPast={false}
                  showActualIncome={false}
                  onExport={() => exportMonth(month)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PaycheckCalendar
