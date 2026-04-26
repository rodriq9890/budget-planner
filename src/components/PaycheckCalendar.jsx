import { useState } from "react"
import { calculateTaxBreakdown } from "../utils/taxCalculator"
import IncomeBar from "./IncomeBar"

function MonthCard({ month, t, isDark, isHourly, hoursPerDay, totalMonthlyCommitted, fmt, updateActual, payFrequency, hourlyRate, effectiveTaxRate, biweeklyNet, isPast, onExport }) {
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
          <span className="text-emerald-400 font-medium">{fmt(month.totalIncome)}</span>
        </div>
        <div className="flex justify-between">
          <span className={t.muted}>Committed</span>
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

      <div className={`border-t pt-3 ${t.border}`}>
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
          <div className="mt-2 space-y-1">
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
                  ${hourlyRate}/hr · {(effectiveTaxRate * 100).toFixed(1)}% effective tax
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

  const carryOver = data.carryOverMonths !== false

  const payFrequency = data.payFrequency || "biweekly"
  const monthlyBudget = data.monthlyExpenses?.reduce((sum, e) => sum + (e.amount || 0), 0) || 0
  const monthlySubs = (data.monthlySubs?.reduce((sum, s) => sum + (s.amount || 0), 0) || 0)
    + (data.annualSubs?.reduce((sum, s) => sum + (s.amount || 0), 0) || 0) / 12
  const monthlySavings = (data.monthlyEmergencyDeposit || 0)
    + (data.extraGoals?.reduce((sum, g) => sum + (g.amount || 0), 0) || 0)
  const totalMonthlyCommitted = monthlyBudget + monthlySubs + monthlySavings

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
          const taxRate = results.gross > 0 ? results.totalDeductions / results.gross : 0
          const netPay = grossPay * (1 - taxRate)
          paycheckDetails.push({ date: payDate, periodStart, periodEnd, workingDays: periodWorkingDays, hours: periodHours, net: netPay })
        })
        totalIncome = paycheckDetails.reduce((sum, p) => sum + p.net, 0)
      } else if (isHourly) {
        const monthlyHours = workingDays * hoursPerDay
        const grossMonthly = monthlyHours * hourlyRate
        const taxRate = results.gross > 0 ? results.totalDeductions / results.gross : 0
        totalIncome = grossMonthly * (1 - taxRate)
      } else {
        totalIncome = paychecks.length * results.biweeklyNet
      }

      const surplus = totalIncome - totalMonthlyCommitted
      const key = `actual_${year}_${i}`
      const actual = data[key] ?? null

      return { index: i, name: monthName, paychecks, workingDays, totalIncome, surplus, actual, key, paycheckDetails, carryover: 0, year, showYear: false }
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

  function exportMonth(month) {
    const payload = {
      month: month.name,
      year: month.year,
      income: month.totalIncome,
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

  const effectiveTaxRate = results.gross > 0 ? results.totalDeductions / results.gross : 0
  const cardProps = {
    t, isDark, isHourly, hoursPerDay, totalMonthlyCommitted, fmt, updateActual, payFrequency,
    hourlyRate, effectiveTaxRate, biweeklyNet: results.biweeklyNet,
  }

  return (
    <div>
      <IncomeBar data={data} t={t} />
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <h2 className={`text-xl font-semibold mb-1 ${t.heading}`}>Paycheck Calendar</h2>
            <p className={`${t.subtle} text-sm`}>Track your paychecks and actual spending month by month.</p>
          </div>
          <div className="flex items-center gap-3">
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
                  onExport={() => exportMonth(month)}
                />
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {visibleMonths.map((month) => {
              const isMonthPast = isCurrentYear && month.index < currentMonth
              return (
                <MonthCard
                  key={month.index}
                  month={month}
                  {...cardProps}
                  isPast={isMonthPast}
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
